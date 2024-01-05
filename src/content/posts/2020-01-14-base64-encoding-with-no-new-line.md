---
template: blog-post
title: Base64 Encoding with no new line
slug: /base64-encoding-with-no-new-line
date: 2020-01-14 12:46
description: Base64 Encoding with no new line
featuredImage: /assets/ilya-pavlov-OqtafYT5kTw-unsplash.jpg
featured: false
tags:
  - bash
---

Occasionally when I create secrets in Kubernetes I'll get told that the credentials or values I've entered are wrong. I dig through and find everything looks OK, print out the base64 encoded secret, decode it and everything still looks OK!

<!--more-->

What's often wrong is that there is a new line attached at the end of the string that I've encoded, so of course when it's decoded and used it's not just the string that's needed.

I usually encode things using:

```
echo <my string> | base64
```

Simple enough, but to make sure that we don't add the trailing new line use:

```
echo -n "<my string> | base64
```

That often solves my problem of invalid credentials, and I spend far too long remembering that new lines are the problem. **However**, it seems that not all versions of echo are the same! Sometimes the above may not work, and an alternative is to use _printf_ which is supposedly more consistent, the same command is then applied:

```
printf <my string> | base64
```
