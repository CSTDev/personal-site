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
4. Select the board by going to Tools → Board → esp8266 → Generic ESP8266 Module
5. Connect your ESP using a USB cable
6. Select the port by going to Tools → Port. The ESP8266 typically appears as `COM3` on Windows or `/dev/ttyUSB0` on Linux. If you're unsure which port is correct, unplug the board, check which ports are listed, then plug it back in — the new entry is your board.
   - **Port not showing up?** This is usually a driver issue. The NodeMCU v3 uses a CH340 USB-to-serial chip. Download and install the [CH340 driver](https://sparks.gogo.co.nz/ch340.html), then reconnect the board.
   - **Still not showing?** Try a different USB cable — many micro USB cables are charge-only and won't carry data.
   - On Windows you can verify the port in Device Manager under *Ports (COM & LPT)*. It will appear as *USB-SERIAL CH340 (COMx)* when the driver is installed correctly.

The board should now appear in **Tools → Port** as a selectable entry (e.g. `COM3` or `/dev/ttyUSB0`), and the IDE's toolbar will show it as the selected board, e.g. `Generic ESP8266 Module on COM3`.
