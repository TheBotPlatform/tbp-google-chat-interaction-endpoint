var unirest = require('unirest');


var TBPInteractionEndpoint = function(config) {

    var TBP_CLIENT_ID = config.clientID;
    var TBP_CLIENT_SECRET = config.clientSecret;

    var lastToken = false;
    var lastTokenTime = 0;
    var TokenLifespan = 58 * 60;


    var getBearerToken = function(cb) {
        now = Date.now()

        if (lastToken && lastTokenTime > now - TokenLifespan) {
            return cb(lastToken);

        }

        var url = "https://api.thebotplatform.com/oauth2/token"
        var payload = "client_id=" + TBP_CLIENT_ID + "&client_secret=" + TBP_CLIENT_SECRET + "&grant_type=client_credentials"
        var headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        return unirest
            .post(url)
            .headers(headers)
            .send(payload)
            .then((response) => {
                if (response.body === undefined) {
                    throw new Error("Can't connect to TBP");
                }
                if (response.body === "Unauthorized") {
                    throw new Error("TBP API Credentials are incorrect");
                }
                lastToken = response.body.access_token;
                lastTokenTime = Date.now();
                return cb(lastToken);
            });

    };
    var createdUserID = function() {

    };
    var getBotResponse = function(userID, input, cb = function() {}) {

        getBearerToken(function(token) {
            var url = "https://api.thebotplatform.com/v1.0/interaction"
            var headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
            var payload = { "data": { "type": "interaction", "attributes": { "user": { "id": userID }, "input": input } } }

            unirest
                .post(url)
                .headers(headers)
                .send(payload)
                .then((response) => {
                    if (response.body === "Unauthorized") {
                        throw new Error("TBP API Credentials are incorrect");
                    }
                    cb(response.body);
                });
        })


    };

    // test getting a bearer token
    getBearerToken(function(token) {
        console.log(token);
    }).catch(function(e) {
        console.log(e.message);
        process.exit();
    });

    return {
        getBearerToken: getBearerToken,
        createdUserID: createdUserID,
        getBotResponse: getBotResponse,
        getBotResponseAndSend: function(userID, thread, input) {
            var that = this;
            getBotResponse(userID, input, function(response) {
                console.log(response);
                that.sendMessages(thread, response.data.attributes.output);
            });
        },
        setConnector: async function(connector, config) {
            var connector = require('./chat-connectors/' + connector);
            await connector.setup(config);
            connector.parent = this;
            this.connector = connector;

        },
        sendMessages: async function(thread, messages) {
            for (var i = 0; i < messages.length; i++) {
                var msg = messages[i];
                switch (msg.type) {
                    case 'text':
                        await this.connector.sendText(
                            thread,
                            msg.text,
                            msg.buttons
                        );
                        break;
                    case 'quick_reply':
                        await this.connector.sendText(
                            thread,
                            "",
                            msg.buttons
                        );
                        break;
                    case 'image':
                        await this.connector.sendImage(
                            thread,
                            msg.url
                        );
                        break;
                    case 'video':
                        await this.connector.sendVideo(
                            thread,
                            msg.url
                        );
                        break;
                    case 'audio':
                        await this.connector.sendAudio(
                            thread,
                            msg.url
                        );
                        break;
                    case 'carousel':
                        await this.connector.sendCarousel(
                            thread,
                            msg.cards
                        );
                        break;
                    default:
                        console.log("type not implemented: " + msg.type);

                }
            }
        },
        sendWelcome: function(userID, thread) {
            this.getBotResponseAndSend(userID, thread, "__PAYLOAD__START");
        }
    }
}

module.exports = TBPInteractionEndpoint;