---
template: blog-post
title: Delete Kubernetes resources based on age
slug: /delete-kubernetes-resources-after-preiod
date: 2019-12-20 12:46
description: Connect to Kubernetes Service in a Different Namespace
featuredImage: /assets/ilya-pavlov-OqtafYT5kTw-unsplash.jpg
featured: false
tags:
  - kubernetes
  - tekton
---

Lately I've been playing with [Tekton](https://github.com/tektoncd/pipeline) to try and build a CI pipeline. It has a concept of a Pipeline that contains ordering of Tasks that should be run. In order to actually run a pipeline there's an aptly named resource called PipelineRun. Once this is complete it sits around on the Kubernetes cluster which is helpful when you need to see logs, but eventually you need to clean this up. This can also be used to delete pods based on age, or any other resource that has the creationTimestamp metadata (potentially all of them?)

<!--more-->

The simplest way I thought this could be done was to delete the PipelineRun after a certain duration.

Note: If you're running on alpine linux it has a different version of the "date" utility than some fatter distros, so you'll either need to install that version, or use this slightly more complicated date command to get the date you need.

### Command

The command to get all PipelineRuns and delete them if they're older than a day would be:

```
kubectl get pipelineruns -o go-template --template '{{range .items}}{{.metadata.name}} {{.metadata.creationTimestamp}}{{"\n"}}{{end}}' | awk -v date="$(date -d "@$(($(date +%s) - 86400))" +%Y-%m-%d)" '$2 < date {print $1}' | xargs --no-run-if-empty kubectl delete pipelinerun
```

You can change this to be older or more recent by changing the "86400" value. That is the number of seconds ago.

#### Breakdown

##### Get Resource

The first part get the PipelineRun (or another resource's) name and creation time:

```
kubectl get pipelineruns -o go-template --template '{{range .items}}{{.metadata.name}} {{.metadata.creationTimestamp}}{{"\n"}}{{end}}'
```

Outputs:

```
build-pipeline-run-4lwr9 2019-12-20T09:55:46Z
build-pipeline-run-6jf9x 2019-12-20T10:06:08Z
build-pipeline-run-6sn69 2019-12-19T09:54:50Z
```

##### Date comparison

Finds the timestamp in the output lines above (the $2 in the command below).
Gets the current date and takes off a number of seconds
Format it as YYYY-mm-dd
Compare it to the timestamp of the resource
If the resources timestamp is before the given date, print the resource name

```
awk -v date="$(date -d "@$(($(date +%s) - 86400))" +%Y-%m-%d)" '$2 < date {print $1}'
```

##### Delete Resource

Finally pass all the matching resource names into the kubectl delete command:

```
xargs --no-run-if-empty kubectl delete pipelinerun
```

### CronJob

The last thing to do is to set this up to run regularly, fortunately Kubernetes provides us with CronJobs to run tasks on a schedule.

```
---
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: tidy-old-pipeline-runs
spec:
  schedule: "0 4 * * *"
  successfulJobsHistoryLimit: 2
  failedJobsHistoryLimit: 2
  jobTemplate:
    spec:
      backoffLimit: 4
      template:
        spec:
          serviceAccountName: trigger-service-acct
        terminationGracePeriodSeconds: 0
        restartPolicy: Never
        containers:
          - name: kubectl
            imagePullPolicy: IfNotPresent
            image: bitnami/kubectl:1.15
            command:
            - "/bin/sh"
            - "-c"
            - |
              kubectl get pipelineruns -o go-template --template '{{range .items}}{{.metadata.name}} {{.metadata.creationTimestamp}}{{"\n"}}{{end}}' | awk -v date="$(date -d "@$(($(date +%s) - 86400))" +%Y-%m-%d)" '$2 < date {print $1}' | xargs --no-run-if-empty kubectl delete pipelinerun

```
