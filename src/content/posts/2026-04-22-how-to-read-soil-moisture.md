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
