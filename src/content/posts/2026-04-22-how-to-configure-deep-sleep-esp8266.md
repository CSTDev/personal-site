---
template: blog-post
title: How to configure deep sleep on an ESP8266
slug: /how-to-configure-deep-sleep-esp8266
date: 2026-04-22 10:00
description: How to configure deep sleep on an ESP8266
featuredImage: /assets/nginx-padlock.png
featured: false
tags:
  - IOT
  - soil-alerter
  - how-to
---

## Deep Sleep

The ESP8266 has the ability to do what is referred to as **DeepSleep** this reduces what the board is doing to run nothing but the real time clock (RTC) which allows it to track the time it’s been asleep. This guide is part of the [Soil Moisture Exporter](./soil-moisture-exporter) series.

To wake it up either:

- It will wake itself up after a predefined period of time; or
- You press the RST button to restart the ESP8266

### Prerequisites

- An ESP8266
- A sketch you can deploy to your ESP8266

### Timed Wakeup

1. Add the following to the sketch for the deep sleep:

```c

    ESP.deepSleep(3.6e9); //30m

```

2. Once the sketch has been written to the ESP8266 - connect the `RST` and `D0` pins.
3. You should see you sketch's setup output on the serial monitor each time the board wakes.
 
This works because the RST pin is always HIGH, when it receives a LOW signal it triggers the ESP8266 to restart therefore waking it from sleep. When you set the deep sleep timer, when it gets to the end, `GPIO 16` (`D0`) sends a LOW signal which triggers the wakeup.

>
> ⏰
> The ESP8266 has a maximum time it can deep sleep for, about 3.5 hours, beyond that it’s not likely to wake up.
>

### Manual Wakeup

Once you have put the ESP8266 to sleep the other alternative to wake it up is to press the RST button on the board. This will reboot the board and your sketch will run from the beginning again.
