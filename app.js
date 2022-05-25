const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

var main = async function() {

    const TBPInteractionEndpoint = require('./modules/thebotplatform-interaction-endpoint')({
        clientID: process.env.TBP_CLIENT_ID,
        clientSecret: process.env.TBP_CLIENT_SECRET
    });

    await TBPInteractionEndpoint.setConnector(
        'googlechat', { tokenPath: process.env.GOOGLE_TOKEN_PATH }
    );

    TBPInteractionEndpoint.server.start(
        "/",
        process.env.EXPRESS_PORT_NUMBER
    );

};
main();