---
template: blog-post
title: Monitoring house plants for when they need watering
slug: /soil-moisture-exporter
date: 2026-04-22 10:00
description: A description of how and why I get alerts when my house plants need watering
featuredImage: /assets/nginx-padlock.png
featured: false
tags:
  - IOT
  - soil-alerter
  - build-narrative
---

>
> <img src="https://www.notion.so/icons/tulip_green.svg" alt="tulip_green" width="40px" /> My fake plants died because I did not pretend to water them.
>

And when it comes to real house plants mine tend to err on the side of death too. I can’t seem to get the balance right between not watering the plants around the house and then over-watering them when I realise that they’ve been neglected for a little while. 

I do however have slightly more success with the seedlings I start inside but again the watering is more of a “when I remember it” than a science. 

Rather than be consistent for either I decided why not get a sensor to measure the moisture level of the soil and let me know when it needs watering! 

This post goes through what I set up and why with links out to various How-To guides if you want to replicate the setup.

## The Plan

This post will take you through the overview of how I get alerts sent to me via Slack when my house plants need watering. If you want to build it yourself then follow through the guides in the How-To section.

The setup I envisioned was to have a moisture sensor attached to a small board that has some WiFi capability running off a battery. It’ll send through readings at regular intervals to an MQTT broker and if those fall below a given threshold I’ll send a notification to myself and then go water the plant in question.

## How To’s

If you want to replicate this build here are the relevant guides for the more specific parts of the setup, I'll also link to them at the relevant points through the article.

- [How to setup the Arduino IDE for ESP8266 development](../how-to-soil-moisture-sensor-arduino-ide)
- [How to read soil moisture with an ESP8266](../how-to-soil-moisture-sensor-esp8266)
- [How to send messages to HiveMQ (MQTT) from an ESP8266](../how-to-send-mqtt-esp8266)
- [How to configure deep sleep with timed wakeup on an ESP8266](../how-to-configure-deep-sleep-esp8266)

## The Hardware

The following are the bits and pieces that I used to put this together:

**Microcontroller** - I chose an ESP8266 to control the system as it’s a low-cost, Wi-Fi-enabled  MCU that doesn’t have a huge power requirement. The WiFi connection is important as it allowed me to send readings to a MQTT broker which in turn can be used to create metrics for monitoring and enable me to send alerts.

I specifically used an [ESP8266 NodeMCU](https://www.amazon.co.uk/dp/B0CH9G6R6S?psc=1&ref=ppx_yo2ov_dt_b_product_details) which is a development board that requires no soldering, provides a micro-USB interface for power and programming, and GPIO pins. 

**Sensor** - The sensor itself is a [capacitive soil moisture sensor](https://thepihut.com/products/capacitive-soil-moisture-sensor) that goes into the soil to do the measuring. Being capacitive it is less prone to corrosion than some other sensors, and it also comes with the appropriately connected jumper wires.

**Battery -** The battery is just a simple portable power bank that you’d normally use to charge a phone or other device. The first one I tried was a 20,000mAh Li-Po one from Ansmann, however when the ESP8266 went into deep sleep mode, more on that later, the battery also stopped providing power and therefore the board was unable to wake up, I switched to a smaller cheap 10,400mAh Li-ion battery and that didn’t have the same problem. 

> 
> You may have to experiment with the battery setup to find one that provides enough power and handles when the ESP8266 sleeps
>

**Wires -** I just needed a few jumper wires, 3 male-to-female for connecting the sensor to the GPIO pins, and 1 female-to-female for connecting the GPIO pins to allow the deep sleep to work.

## Setup

The setup was fairly straightforward, it was a case of connecting the ESP8266 to the moisture sensor and taking a few calibrating readings (see [How to read soil moisture with an ESP8266](../how-to-soil-moisture-sensor-esp8266)). The readings are used to work out what the sensor reads as a maximum moisture (i.e. placed in a glass of water) and a minimum (i.e. in air) this then lets you translate to how much moisture there is in the soil of the plant pot.

Once ready to deploy the sensor to its final location I connected the power pack via the micro USB connector. A final female-to-female jumper wire is used to connect the `RST` and `D0` GPIO pins on the ESP8266, this enables to board to be woken from deep sleep (see below and [How to configure deep sleep with timed wakeup on an ESP8266](../how-to-configure-deep-sleep-esp8266)). I currently have two sensors set up, one is not near a socket, hence the power pack, however the other is and so can be plugged in directly, this is more reliable as it doesn't require the power pack to be charged every week or so. The alerts that I set up do notify me when the battery powered one stops reporting that it is alive so I at least know when it needs charging. (See [Part 2](../soil-moisture-exporter-pt2) for setting up the alerts)


### Connecting to MQTT

One of the main selling points of using an ESP8266 is that it has the ability to connect to WiFi and therefore is able to easily report readings it takes from connected hardware to somewhere for analysis, or it can be controlled remotely, we therefore use this feature to send readings to an MQTT broker.
My MQTT broker of choice for this project is [HiveMQ](https://www.hivemq.com/) as it provides a free tier and can be connected to over the internet.

Their free tier includes:

- 100 connections - we'll have one per sensor so unlikely to hit!
- 10GB/Month - each message we send is about 40 bytes, so we're only sending approximatley 55Kb per sensor per month.
- There's no uptime SLA - but this isnt a crital system really, is it.
 
There are a number of alternatives or you could host your own broker which would keep all your data local and would mean we can set up and use our own certificates, however for the speed of getting the main thing built, the moisture sensor, we'll stick with HiveMQ. Maybe one for another time! For the setup to connect to HiveMQ from an ESP8266 follow [How to send to a MQTT broker from an ESP8266](../how-to-send-mqtt-esp8266)

### Deep Sleep

Now, to save power when running off a battery, and also so we’re not continuously taking readings we need to sleep the ESP8266. It has the ability to do what is referred to as **DeepSleep** this reduces what the board is doing to run nothing but the real time clock (RTC) which allows it to track the time it’s been asleep. To set this up follow [How to configure deep sleep on an ESP8266](../how-to-configure-deep-sleep-esp8266)

To wake it up either:

- It will wake itself up after a predefined period of time; or
- You press the RST button to restart the ESP8266

The ESP8266 has a maximum time it can deep sleep for, about 3.5 hours, beyond that it’s not likely to wake up. I experimented with setting various durations for the deep sleep up to the reported 3.5 hours maximum, however times over about an hour seemed to result in it not waking up. I found that 30 minutes worked consistently and the battery would last about a week with it waking up to take readings.  

## Conclusion

So that’s the hardware setup done, and readings being taken. We have an ESP8266 reading the soil moisture and writing the readings to a MQTT broker. 

The full sketch can be found in this repository: https://github.com/CSTDev/soil-moisture-monitoring/tree/main/esp8266

Now we've got readings that's all well and good but we need to do something with them. The next step I took was to send the readings to Grafana and show them on a dashboard as well as send notifications when something needed watering or a component wasn't running. For this next part continue to [Monitoring house plants for when they need watering - Part 2](../soil-moisture-exporter-pt2)
