---
template: blog-post
title: Calling AWS Services from OpenShift
slug: /calling-aws-services-from-openshift
date: 2024-01-08 12:46
description: Using IRSA to use AWS services from OpenShift pods
featuredImage: /assets/federico-beccari-ahi73ZN5P0Y-unsplash.jpg
featured: false
tags:
  - openshift
  - AWS
---

Sometimes you need to access AWS Services from pods running in OpenShift. One way of doing this is to associate an IAM role with an OpenShift service account. A pod can then run as this service account and obtain credentials that it uses to talk to the allowed AWS Services. You can use this to assume a role in an AWS account beyond the one that OpenShift may be running in. This is also known as IAM Roles for Service Accounts (IRSA), the benefits of this approach are:

- **Least Privilege** - The IAM permissions granted are scoped to a service account, and only the pods running as that service account have access to those permissions.
- **Credential Isolation** - A container can only retrieve credentials for the IAM role that is associated with the service account, not any for any other pod or namespace.
- **Auditability** - Access and event logging are available through AWS CloudTrail.

Your OpenShift cluster should be configured with the [Cloud Credential Operator (CCO) in manual mode](https://docs.openshift.com/container-platform/4.14/installing/installing_aws/installing-aws-customizations.htlm#manually-create-iam_installing-aws-customizations) to use the AWS Secure Token Service (AWS STS).

### Prerequisites

The rest of this guide makes the assumptions that you have the following:

- OpenShift installed with the CCO in manual mode
- Access to the `ccoctl` tool (part of the OpenShift installation media)
- OpenID Connect provider set up within your AWS account
- A second AWS account that you want a pod to access

### Creating Secrets

1. Define a [CredentialsRequest](https://github.com/openshift/cloud-credential-operator?tab=readme-ov-file#credentials-requests), which is a custom resource definition that allows you to specify permissions that the credential will have, how it is restricted, and how it is referenced. Create this in a directory called `credrequests`
    
    ```yaml
    apiVersion: cloudcredential.openshift.io/v1
    kind: CredentialsRequest
    metadata:
    	labels:
    		controller-tools.k8s.io: "1.01
    	name: assume-dev-dynamodb-reader # Suitable name to identify the credentials request e.g. assume-env-role-name
    	namespace: my-namespace # Namespace that the secret will be used in
    spec:
    	providerSpec:
    		apiVersion: cloudcredential.openshift.io/v1
    		kind: AWSProviderSpec # This is an AWS provider, so the following matches how you'd define an IAM spec in AWS
    		statementEntries:
    		- action:
    			- sts:AssumeRole # Define that we'll be assuming a role
    				effect: Allow
    				resource: 'arn:aws:iam::account:role/dynamodb-reader' # THe role which can be assumed
    	secretRef:
    		name: dev-dynamodb-reader # Name of the secret that will be created in OpenShift
    		namespace: my-namespace # Namespace the secret will be used in
    	serviceAccountNames:
    		- dev-db-reader # Name of the OpenShift service account that the pod will run as
    ```
    
2. Ensure you’re logged in to the `oc` and `aws` clis.
3. Create the role using the [ccoctl](https://github.com/openshift/cloud-credential-operator/blob/master/docs/ccoctl.md) tool 
    
    ```bash
    ccoctl aws create-iam-roles \
    	--name=my-namespace-creds \
    	--region=eu-west-2 \
    	--credentials-requests-dir=credrequests \
    	--identity-provider-arn=arn:aws:iam::account:oidc-provider/address \
    	--output-dir=outputs
    ```
    
    - `name` is used to prefix the roles created in IAM
    - `identity-provider-arn` is the ARN of the OpenID Connect provider in your AWS account
    - `output-dir` is where your manifests will be written
    
    **Note:** You can do many CredentialRequests at once, so long as you’ve created all their definitions in the directory used for `credentials-requests-dir`.
    
4. This will create a role in the AWS account in which OpenShift lives and outputs YAML file(s) to `outputs/manifests/<namespace>-<name>-credentials.yaml`
5. Apply the created secret(s) using `oc apply -f outputs/manifests/*.yaml`

### Using the Secrets

Any secrets created above are now available in OpenShift and by running a pod as the service account that was specified, temporary credentials can be injected into the pod which will allow applications to assume the role that was specified in the `CredentialsRequest`

1. Mount the secret and service account token, and ensure the pod runs using the service account specified in the CredentialsRequest. For example, add the following to a deployment.yaml.
    
    ```yaml
    ...
    spec:
    	containers:
    		- name: my-container
    			volumeMounts:
    				- name: bound-sa-token
    					mountPath: /var/run/secrets/openshift/serviceaccount
    				- name: dev-dynamodb-reader
    					mountPath: /var/run/secrets/cloud
    			env:
    				- name: AWS_CONFIG_FILE # Specify where the credentials file will be
    					value: /var/run/secrets/cloud/credentials
    				- name: AWS_ROLE_SESSION_NAME
    					value: dev-dynamodb-reader # A name for the session being used
    ...
    serviceAccount: dev-db-reader
    ...
    volumes:
    	- name: dev-dynamodb-reader # This volume mounts the config
    		secret:
    			defaultMode: 420
    			optional: false
    			secretName: dev-dynamodb-reader
    	- name: bound-sa-token # This volume mounts the web identity token which is used by AWS SDKs
    		projected:
    			defaultMode: 420
    			sources:
    			- serviceAccountToken:
    				audience: openshift
    				expirationSeconds: 3600
    				path: token
    ```
    
2. Create the role in the destination AWS account that the CredentialsRequest allows the pod to assume i.e. in this case `dynamodb-reader`
3. Give it a trust relationship that allows the role created by ccoctl to assume it, the session name is the one defined above i.e. dev-dynamodb-reader
    
    ```json
    {
    	"Version": "2021-10-17",
    	"Statement": {
    		{
    			"Effect": "Allow",
    			"Principal": {
    				"AWS": "arn:aws:sts::<openshift aws account id>:assumed-role/<ccoctl created role>/<session name>"
    			}
    		}
    	}
    }
    ```
    

Finally, the application that wants access to the AWS resources needs to assume the role, this will vary depending on the SDK for each language, by not specifying credentials for the STSClient most SDKs will pick up the credentials from the path specified by the `AWS_CONFIG_FILE` environment variable that was set.

e.g. in JavaScript

```jsx
const stsClient = new STSClient({region: "eu-west-2"});
const command = new AssumeRoleCommand({
	RoleArn: "<arn of role in destination account>",
	RoleSessionName: "<a name for the session being assumed>",
	DurationSeconds: 900,
});
const reponse = await stsClient.send(command);
return new DynamoDBClient({
	credentials: {
		accessKeyId: response.Credentials?.AccessKeyId,
		secretAccessKey: response.Credentials?.SecretAccessKey,
		sessionToken: response.Credentials?.SessionToken,
	}
});
```

**Refreshing Tokens**

The token injected into the pod is only valid for as long as is specified in the `bound-sa-token` defined above. Then, in turn, the assumed role is only valid as long as the duration in the `AssumeRoleCommand`, however, this has a maximum duration of an hour. 

The token is routinely refreshed by OpenShift, however, your application needs to read this new token from the disk and re-request credentials from STS. 

A naive way of doing this in Typescript when using the connected client is to watch for the `ExpiredTokenException` when requesting before re-connecting and then retrying the request.

```tsx
try {
	await this.dynamodbClient.send(command);
} catch (err: unknown) {
	if(err.toString().includes("ExpiredTokenException")){
		// Refresh client
		this.dynamodbClient = this.getClient();
		// Retry request
	}
}
```