---
template: blog-post
title: Fixing SNI Errors with nginx Upstream Blocks
slug: /nginx-sni-and-nifi
date: 2026-04-10 10:00
description: How to handle SNI when proxying through nginx with added NiFi considerations
featuredImage: /assets/nginx-padlock.png
featured: false
tags:
  - TIL
  - nginx
  - NiFi
---

I was having problems exhausting connections to NiFi through nginx so needed to modify the nginx configuration to allow connection pooling. As soon as I did I hit an error I've seen a few times but often forget about, `Invalid SNI`.

Some servers require and validate requests using Server Name Indication (SNI). From [Wikipedia](https://en.wikipedia.org/wiki/Server_Name_Indication) 

> SNI is an extension to [Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) (TLS) where a client indicates which hostname it is attempting to connect to at the start of the handshaking process. The extension allows a server to present one of multiple possible certificates on the same IP address and port number
> 

I’m using Nifi 2 (NiFi 1 doesn't enforce SNI) for some data processing and as it uses Jetty under the hood, SNI is required by default. This was fine until I changed how our nginx proxy was handling requests.

### Simple Proxy Passthrough

Initially I had the following nginx configuration:

```bash
http {
  server {
	  location /files {
		  proxy_pass https://nifi.mycompany.com:8444;
	  }
  }
}
```

This worked wonderfully, when it tries to connect to [`nifi.mycompany.com`](http://nifi.mycompany.com) it uses that as the server name it’s trying to connect to and NiFi is presenting a certificate that has that as one of the Subject Alternate Names (SANs).

### Upstream

In order to solve the connection problem, I had to change the proxy handling to make use of an `upstream` block to enable connection pooling. The new config looked similar to this:

```bash
http {
	
	upstream nifi_backend {
		server nifi.mycompany.com:8444;
	}
	
  server {
	  location /files {
		  proxy_pass https://nifi_backend;
	  }
  }
}
```

The trouble here is that by default nginx will use the host part of the proxy_pass address as the name of the server it is requesting. So in this case it calls NiFi, as part of the handshake it tells NiFi it expects it to be called `nifi_backend` which is not in the certificate so we get a `400: Invalid SNI` response.

### Solutions

There are two ways to handle this:

#### Backend Name

One is to set the backend name to match the name in the server's certificate. This works but if you have other `proxy_pass` directives going to the same server but not via that backend they will all now use that backend which might not be the desired behaviour.

```bash
http {
	
	upstream nifi.mycompany.com {
		server nifi.mycompany.com:8444;
	}
	
  server {
	  location /files {
		  proxy_pass https://nifi.mycompany.com;
	  }
	  
	  location /data {
		  proxy_pass https://nifi.mycompany.com:1234; # Even if you didn't want it to this would go via the backend
	  }
  }
}
```

#### Proxy SSL Directives

The alternative is to use the directives provided by the [**ngx_http_proxy_module**](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_ssl_server_name). There are two that need to be set:

- **proxy_ssl_server_name** `on;` - This enables (or disables) the passing of the server name
- **proxy_ssl_name** `name;` - This sets the SNI hostname used during the TLS handshake therefore should be what matches a value in the certificate's SAN.

```bash
proxy_ssl_server_name on;
proxy_ssl_name nifi.mycompany.com;
```


The proxy SSL directives are probably the nicer of the two ways to approach this as it makes your server names explicit, not relying on an understanding that nginx uses the host name by default. It also handles the second proxy pass issue pointed out above. 

### Bonus NiFi Host Header

This last one likely only applies when proxying to NiFi or another service that checks after the TLS handshake, so not really SNI but does the same check.

You should set the `Host` header sent with the proxy request so in your `location` block add:

```bash
proxy_set_header Host nifi.mycompany.com;
```