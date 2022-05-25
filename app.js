require('dotenv').config();

var main = async function() {

    // set up the interaction endpoint library
    const TBPInteractionEndpoint = require('./modules/thebotplatform-interaction-endpoint')({
        clientID: process.env.TBP_CLIENT_ID,
        clientSecret: process.env.TBP_CLIENT_SECRET
    });

    // specify the connect you want to use, and pass the required config object
    await TBPInteractionEndpoint.setConnector(
        'googlechat', { tokenPath: process.env.GOOGLE_TOKEN_PATH }
    );

    // start the server
    TBPInteractionEndpoint.server.start(
        "/",
        process.env.SERVER_PORT_NUMBER
    );

};
main();