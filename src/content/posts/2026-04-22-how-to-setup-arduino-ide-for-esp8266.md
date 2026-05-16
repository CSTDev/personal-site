---
template: blog-post
title: How to setup the Arduino IDE for ESP8266 development
slug: /how-to-soil-moisture-sensor-arduino-ide
date: 2026-04-22 10:00
description: How to setup the Arduino IDE for ESP8266 development
featuredImage: /assets/nginx-padlock.png
featured: false
tags:
  - IOT
  - soil-alerter
  - how-to
  - arduino
---

This guide walks you through installing the Arduino IDE and configuring it to program an ESP8266 NodeMCU board. To program the board you can connect a micro USB to USB wire to plug the board into the computer. This guide is part of the [Soil Moisture Exporter](./soil-moisture-exporter) series.

## Prerequisites

- ESP8266 NodeMCU v3
- Micro USB to USB cable

## Steps

1. To install it take the latest release from [here](https://www.arduino.cc/en/software)
2. Add the ESP8266 as a recognised board. Go to File → Preferences then for *Additional boards manager URLs* add: [http://arduino.esp8266.com/stable/package_esp8266com_index.json](http://arduino.esp8266.com/stable/package_esp8266com_index.json)
3. Install the ESP8266 board via Board manager. Go to Tools → Board → Board Manager, search for ESP8266 and then press *Install*
4. Select the board by going to Tools → Board
5. Select the port by going to Tools → Port
6. Connect your ESP using a USB cable

TODO what does it look like once it's connected ok?
