---
template: blog-post
title: How to send to a HiveMQ from an ESP8266
slug: /how-to-send-mqtt-esp8266
date: 2026-04-22 10:00
description: How to send MQTT messages from an ESP8266 to HiveMQ cloud broker
featuredImage: /assets/nginx-padlock.png
featured: false
tags:
  - IOT
  - soil-alerter
  - how-to
  - mqtt
---

This _How To_ takes you through connecting to WiFi and sending messages to a MQTT broker using TLS. This guide is part of the [Soil Moisture Exporter](./soil-moisture-exporter) series.

## Prerequisites

- An ESP8266
- Arduino IDE set up and able to deploy to the ESP8266 (see [How to setup the Arduino IDE for ESP8266 development](../how-to-soil-moisture-sensor-arduino-ide))
- HiveMQ account

## Connecting WiFi

In the Arduino IDE create a sketch with the following

```c
#include <ESP8266WiFi.h>
#include <WiFiClient.h>

#ifndef STASSID
#define STASSID "Network Name" // Name of your WiFi network
#define STAPSK "Password" // WiFi network password
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

WiFiClientSecure espClient;

void connectWiFi() {
	if(WiFi.status() == WL_CONNECTED){
    return;
  }

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void setup() {
	connectWiFi();
}
```

Upload the sketch to your ESP and you should be able to view it on your network. The easiest way to do this is likely to be to go to your routers admin dashboard and view the connected devices.

## TLS Setup

Ideally you should use TLS to connect to your broker to ensure that data is encrypted in transit. It is mandatory if using the cloud hosted instance of HiveMQ.
The original instructions HiveMQ provides for using an ESP8266 [are here](https://console.hivemq.cloud/clients/arduino-esp8266), but I’ll pull out the useful bits below.

1. Get the [PubSubClient](https://github.com/knolleary/pubsubclient/releases)  which allows us to talk to the MQTT server
    1. Download the`.zip` file from the releases page for the project. 
    2. Add it to the Arduino IDE by going to Sketch → Include Library → Add .ZIP library and select the downloaded zip
2. Install NTPClient library to provide date time functionality
    1. In the Arduino IDE go to Tools → Manage Libraries… Search for `NTPClient`
3. Install Filesystem Uploader to allow you to add certificates which enables you to connect to HiveMQ securely.
    1. Download the `ESP826LittleFS-x.x.x.zip`  file from the [LittleFS releases page](https://github.com/earlephilhower/arduino-esp8266littlefs-plugin/releases)
    2. Unzip it into the Arduino tools directory - to find this, within Arduino IDE go to File → Preferences, then make note of the `Sketchbook Location`. Navigate to that path and to the `tools` directory there, if there isn’t one, create it.
    3. Within the `ESP826LittleFS-x-x-x` directory there will be one without the version i.e. `ESP826LittleFS` move that to the top level of `tools` and remove the (now empty) versioned one
4. Upload certificates - in order to connect to HiveMQ you need to use TLS and therefore need to  have the certificates to trust.
    1. Get the `certs-from-mozilla.py` script from [this repository](https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi/examples/BearSSL_CertStore/certs-from-mozilla.py) to create a `certs.ar` file which has the required certificates.
        
      >
      > <img src="https://www.notion.so/icons/report_yellow.svg" alt="https://www.notion.so/icons/report_yellow.svg" width="40px" />
        
      >  I found the script needs a program called `ar.exe` this can be found (on windows) under `c:\Users\XXX\AppData\Local\Arduino15\packages\esp8266\tools\xtensa-lx106-elf-gcc\3.0.4-gcc10.3-1757bed\xtensa-lx106-elf\bin\XXXX-ar.exe` copy it to the same directory as the `certs-from-mozilla.py` script if it’s not on your path
      >
        
    2. Copy the [`certs.ar`](http://certs.ar) file to a sub directory called `data` within the directory that your sketch lives in.
    3. Upload it by going in Arduino IDE to `Tools -> ESP8266 LittleFS Data Upload` 
    

>    <img src="https://www.notion.so/icons/report_yellow.svg" alt="https://www.notion.so/icons/report_yellow.svg" width="40px" />
>    
>    You may have to change Flash size (under Tools → Flash Size) to 4MB
    
>    If ` ESP8266 LittleFS Data Upload` is not under tools you can run it from the command pallete: `[Ctrl]` + `[Shift]` + `[P]`, then "`Upload LittleFS to Pico/ESP8266`".
    

That is the HiveMQ connection prerequisites done

## Sending Messages

To send messages to the broker we need to connect, manage reconnecting in case the connection is lost and then send messages.

### Connect

1. Add the additional imports so the full block should be

```c
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <time.h>
#include <TZ.h>
#include <FS.h>
#include <LittleFS.h>
#include <CertStoreBearSSL.h>
```

2. Add the following to your initialisation method:

```c
// MQTT
  setDateTime();

  int numCerts = certStore.initCertStore(LittleFS, PSTR("/certs.idx"), PSTR("/certs.ar"));
  Serial.printf("Number of CA certs read: %d\n", numCerts);
  if (numCerts == 0) {
    Serial.printf("No certs found. Did you run certs-from-mozilla.py and upload the LittleFS directory before running?\n");
    return; // Can't connect to anything w/o certs!
  }

  BearSSL::WiFiClientSecure *bear = new BearSSL::WiFiClientSecure();
  // Integrate the cert store with this connection
  bear->setCertStore(&certStore);

  client = new PubSubClient(*bear);

  client->setServer(mqtt_server, 8883);

  // END MQTT
```

### Reconnect

1. Create a method to reconnect if it isn't connected:

```c
void reconnect() {
  // Loop until we’re reconnected
  while (!client->connected()) {
    Serial.print("Attempting MQTT connection…");
    String clientId = "ESP8266Client - MyClient";
    // Attempt to connect
    // Replace the mqtt username and mqtt password below with actual values from your broker
    if (client->connect(clientId.c_str(), "<mqtt username>", "<mqtt password>")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc = ");
      Serial.print(client->state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
```

2. Then call it from the main application loop:

```c
if (!client->connected()) {
    reconnect();
  }
```


### Send a Message

Start the client loop, construct a message and then send it using the client:

```c
client->loop();
  
  snprintf (msg, MSG_BUFFER_SIZE, "{\"name\": \"%s\", \"value\": %s}", "readingName", "20");
  Serial.print("Publish message: ");
  Serial.println(msg);
  client->publish("soilMoisture", msg);
```

## Conclusion

If you now go to your broker and listen for messages, if using HiveMQ you can do this through the web UI, you should see messages regularly coming in. 

For full working code see [this sketch: soilmoisture.ino](https://github.com/CSTDev/soil-moisture-monitoring/blob/main/esp8266/soilmoisture.ino)