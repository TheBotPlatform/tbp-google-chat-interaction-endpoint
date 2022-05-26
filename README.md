# Google Chat Connector

## Setup

Visit Google Developer Console and create a new project

https://console.developers.google.com/

Enable Google Chat API on the project

Create Credentials
- Application data

Under Configuration set:
- App name: bot name
- Image: 256x256
- Description the description of the bot

Functionality
- App can be messaged directly

Connection settings
- App URL
- - The url of this code base

Permissions
- Specify who should have access to the bot

Create Service Account Keys under IAM & Admin

Download the .json file and place it in a keys folder

Clone .env.example -> .env and update the parameters

Run `node app.js`

Make sure you have setup the App URL here: https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat


## Points to note:
- Inline video not supported
- Inline audio not supported
- Workaround for quick replies, card remains - annoying
- Native carousel support is a workaround




## Supported Message Parts

- Welcome message
- Text
- Buttons
- Images, GIFs
- Jump
- Attributes
- Webhook posts
- Message variations

## Partially supported Message Parts

- Videos & Audio - native inline not supported by google chat
- Quick replies - but has a google dependent annoyance
- Carousels - google chat workaround, has a different layout


## Features NOT supported

- User profile attributes, such as {{first_name}}, {{last_name}}, {{department}} etc.
- Delays
- Webhook responses
- Broadcasts

## Further reading
- [API Docs](https://drive.google.com/file/d/1XSo1WfToh3tsU4iSulaum64K_dvpudxx/view?usp=sharing)