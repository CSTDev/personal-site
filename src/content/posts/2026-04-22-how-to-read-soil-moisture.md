---
template: blog-post
title: How to read soil moisture with an ESP8266
slug: /how-to-soil-moisture-sensor-esp8266
date: 2026-04-22 10:00
description: How to read soil moisture with an ESP8266
featuredImage: /assets/nginx-padlock.png
featured: false
tags:
  - IOT
  - soil-alerter
  - how-to
---

This how-to covers how to connect a capacitive soil moisture sensor to an ESP8266 NodeMCU board to enable you to take readings. This guide is part of the [Soil Moisture Exporter](./soil-moisture-exporter) series.

## Prerequisites

- A [ESP8266 NodeMCU](https://www.amazon.co.uk/dp/B0CH9G6R6S?psc=1&ref=ppx_yo2ov_dt_b_product_details)
- A [capacitive soil moisture sensor](https://thepihut.com/products/capacitive-soil-moisture-sensor)
- 3 male-to-female jumper wires
- 1 female-to-female jumper wire
- Arduino IDE setup with ESP8266 support - see [this How-To](./how-to-soil-moisture-sensor-arduino-ide)


## Steps

### Wiring

Connect the provided wires using the jumper wires. Ensure that the following line up:

1. The ground (`GND`) on the sensor is connected to the ground GPIO pin on the ESP8266
2. The `VCC` on the sensor is connected to the `5V` GPIO pin
3. The `AOUT` on the sensor is connected to the `A0` GPIO pin.

![Wiring diagram showing the ESP8266 NodeMCU GND, 5V and A0 pins connected to the soil moisture sensor's GND, VCC and AOUT pins](/assets/soil-moisture-sensor-wiring.svg)

The wiring is now complete, but to see anything you will need to deploy some code to the ESP8266.


### Taking Readings

In the Arduino IDE create a sketch with the following:

- Add the following to the sketch:
    
    ```c
    void setup() {
    	Serial.begin(9600);
    }
    
    void loop() {
    	int val;
    	val = analogRead(0); // Connect sensor to Analog 0
    	Serial.print(val);
    	delay(500);
    }
    ```
    
- Upload the sketch to the ESP and it’ll run.

The serial monitor will print out the moisture reading every half a second. This is a value that represents how much moisture the sensor is detecting.

To take your calibration readings in order to know when the soil is dry vs wet, set it up as above and then:

- Keep the sensor dry in the air and note the highest reading that is output to the serial console, this will be your `airValue` in the final sketch
- Put the sensor in a glass of water, ensuring not to immerse it above the recommended depth
- Take a few readings and note the lowest that is output to the serial console, this will be your `waterValue` in the final sketch

### Reading Moisture as a Percentage

With those two values you can convert a raw reading into a 0-100 moisture percentage. Update your sketch to use them:

```c
const int airValue = 622; // Replace with your reading
const int waterValue = 215; // Replace with your reading

double readInput() {
	double average = analogRead(A0);
	double moisture = 100 - ((average - waterValue) / (airValue - waterValue) * 100);
	if (moisture <= 0) {
		return 0;
	}
	if (moisture >= 100) {
		return 100;
	}
	return moisture;
}

void setup() {
	Serial.begin(9600);
}

void loop() {
	Serial.print(readInput());
	delay(500);
}
```

Upload the sketch and the serial monitor will print a value between 0 (dry) and 100 (saturated) every half second. That's your soil moisture reading.
