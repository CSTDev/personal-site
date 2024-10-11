---
template: blog-post
title: Amplify Lambda Functions with Triggers in Go
slug: /amplify-lambda-with-triggers-in-go
date: 2024-10-10 10:00
description: How to use Go with Amplify to create Lambda functions with triggers.
featuredImage: /assets/michael-DXQB5D1njMY-unsplash.jpg
featured: false
tags:
  - AWS
  - Amplify
  - Lambda
  - Go
---

NodeJS functions in Amplify are straightforward; Node is the default that is used whenever you create a function for things like Cognito or DynamoDB triggers. 

To get a function in Go, you can either create a function with `amplify add function` and select Go and then alter the template to add any triggers, IAM rules or connections but it’s quite involved. It’s easier to create the Node version of the function and update that to change it to Go.

## Creating the Initial NodeJS Function

Create a function with a trigger, e.g. a Cognito one `amplify update auth`, select the option to create a lambda for a reason e.g. `Post-Confirmation` . Amplify will do its thing to create a folder.

## Convert to Go

These are the files that need updating to get things working.  

Make the following changes within the function directory `amplify/backend/function/<function name>`:

1. Update the template json file usually named `<function name>-cloudformation-template.json` replacing:

    - `Resources.Properties.Handler` : `index.handler` → **`bootstrap`** 
    - `Resources.Properties.Runtime` : `nodejs18.x` → `provided.al2023`
2. Create the Go files:
    - Change into the src directory `cd src`
    - Initialise the module `go mod init lambda`
    - Create the `main.go` file
    - Create the handler. The important bits below are the `main` function calling `lambda.Start(handler)`, see AWS documentation on Go Lambdas for what the handler can look like. This example is for triggering off a Cognito sign up to customise the messages:
        
        ```go
        package main
        
        import (
        	"context"
        	"fmt"
        
        	"github.com/aws/aws-lambda-go/events"
        	"github.com/aws/aws-lambda-go/lambda"
        )
        
        func handler(ctx context.Context, event 
        events.CognitoEventUserPoolsCustomMessage) 
        (events.CognitoEventUserPoolsCustomMessage, error) {
        	// Retrieve the user's email address from the event
        	email := event.Request.UserAttributes["email"]
        
        	// Customize the message based on your requirements
        	message := fmt.Sprintf("Hello %s! welcome to our application!", email)
        
        	// Return the customized message
        	response := events.CognitoEventUserPoolsCustomMessageResponse{
        		SMSMessage:   message,
        		EmailMessage: message,
        		EmailSubject: "Welcome to our application!",
        	}
        
        	event.Response = response
        
        	return event, nil
        }
        
        func main() {
        	lambda.Start(handler)
        }
        
        ```
        
    - Install dependencies `go mod tidy`
    - Remove the javascript files
        - `src/node_modules`
        - `src/custom.js`  
        - `src/index.js` 
        - `src/package.json` 
        - `yarn.lock` 
3. Update the `amplify.state` file, this lives in the root of the function directory. Set the contents to be the following: 
    
    ```go
    {
      "pluginId": "amplify-go-function-runtime-provider",
      "functionRuntime": "provided.al2023",
      "useLegacyBuild": false,
      "defaultEditorFile": "src/main.go"
    }
    ```

>💡 This file may be hidden in your IDE.  
>  For VSCode:  
> Edit `.vscode/settings.json` and remove the line `"amplify/**/amplify.state": true` 

## Deploy Changes

Finally, you can push the new function with the usual  
`amplify push`  

This will now re-create your function and it’ll be using Go!
