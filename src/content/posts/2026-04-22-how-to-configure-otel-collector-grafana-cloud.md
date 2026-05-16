---
template: blog-post
title: How to configure the OpenTelemetry Collector for Grafana Cloud
slug: /how-to-configure-otel-collector-grafana-cloud
date: 2026-04-22 10:00
description: How to configure the OpenTelemetry Collector to scrape Prometheus metrics and send them to Grafana Cloud, including authentication setup
featuredImage: /assets/nginx-padlock.png
featured: false
tags:
  - IOT
  - soil-alerter
  - how-to
  - otel
---

This _How To_ takes you through configuring the OpenTelemetry (otel) collector to read metrics and export to Grafana cloud using cloud provided credentials.

### Prerequisites

- Grafana Cloud account
- OTel Collector installed

### Authentication & OTLP Metrics Endpoint

To authenticate you’ll use a token associated with your Grafana Cloud instance ID. In oder to get this:

1. Go to your Grafana Cloud portal → **My Account** (this is [grafana.com](http://grafana.com) not your actual Grafana UI instance)
2. Under your stack, choose **Configure** under **OpenTelemetry**
3. It shows your endpoint URL, instance ID, and lets you generate an API token
4. Use the above values in your OTel collector configuration file

## Configuration

The config for the OTel collector should be:

```yaml
---
receivers:
  prometheus: # Scrape from the prometheus endpoint of the soil moisture exporter
    config:
      scrape_configs:
        - job_name: "moisture_collector"
          scrape_interval: 15s
          static_configs:
            - targets: ["soilconsumer:2112"] # Hostname of the soil-moisture-exporter based on the docker compose service name 
  hostmetrics: # Also scrape some host metrics e.g. CPU load/memory usage
    scrapers:
      load:
      memory:

extensions: # Setup authentication
  basicauth/grafana_cloud:
    client_auth:
      username: "" # Grafana Cloud instance ID e.g. "1208224"
      password: "" # Grafana Cloud API key
exporters: # Tell it where to send the data to
  otlphttp/grafana_cloud:
    endpoint: "" # Grafana Cloud OTLP endpoint e.g. "https://otlp-gateway-prod-us-central1.grafana.net/otel/v1/metrics"
    auth:
      authenticator: basicauth/grafana_cloud

# Tie it all together
service:
  extensions:
    [
      basicauth/grafana_cloud,
    ]
  pipelines:
    metrics:
      receivers: [prometheus, hostmetrics]
      exporters: [otlphttp/grafana_cloud]
```

Once the configuration is set up restart your OTel Collector. In your Grafana Cloud account, under Explore you can select the `Prometheus` datasource and should see values for the metrics you are scraping.
