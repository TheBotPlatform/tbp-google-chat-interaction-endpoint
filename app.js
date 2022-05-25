const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require('dotenv').config();


const TBPInteractionEndpoint = require('./modules/thebotplatform-interaction-endpoint')({
    clientID: process.env.TBP_CLIENT_ID,
    clientSecret: process.env.TBP_CLIENT_SECRET
});

TBPInteractionEndpoint.setConnector(
    'googlechat', { tokenPath: process.env.GOOGLE_TOKEN_PATH }
);

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.post('/', TBPInteractionEndpoint.connector.reactToEvent);

app.listen(8100, function() {
    console.log('App listening on port 8100.');
});