---
template: blog-post
title: Connect to Kubernetes Service in a Different Namespace
slug: /connect-to-kubernetes-service-in-a-different-namespace
date: 2019-10-25 12:46
description: Connect to Kubernetes Service in a Different Namespace
featuredImage: /assets/growtika-ZfVyuV8l7WU-unsplash.jpg
featured: false
tags:
  - kubernetes
  - quick-note
---

Sometimes you need to access a service in a namespace from a different one. For example, I've got an instance of Elasticsearch running in my monitoring namespace and want to send data to it from pods running in my application namespace.

<!--more-->

You can reference it using its DNS name in a service in the namespace that it isn't running in.

For this example, Elasticsearch is running in my monitoring namespace and a new service needs to be created in the application namespace to reference it, add the following service:

```
#Used to get access to elasticsearch when it's running in a namespace other than monitoring
---
kind: Service
apiVersion: v1
metadata:
  name: elastic-ns
  namespace: application
spec:
  type: ExternalName
  externalName: <elasticsearch service>.<monitoring namespace>.svc.cluster.local
  ports:
  - port: 9200
```
