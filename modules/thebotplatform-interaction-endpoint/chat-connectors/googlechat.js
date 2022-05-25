const { google } = require('googleapis');

const chat = google.chat('v1');

var TBPGoogleChatConnector = {
    auth: async function(config) {

        if (typeof config !== "object") {
            throw Error("Expecting config object, instead found " + (typeof config));
        }
        if (config.tokenPath === undefined) {
            throw Error("Expecting tokenPath param in config object");
        }

        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/chat.bot'],
            keyFilename: config.tokenPath,
        });
        // Acquire an auth client, and bind it to all future calls
        const authClient = await auth.getClient();
        return google.options({ auth: authClient });
    },
    sendMessage: async function(thread, message) {
        var res = await chat.dms.messages({
            parent: thread,
            requestBody: message,

        });
    },
    setup: async function(config) {
        return this.auth(config);
    },
    renderButtons: function(buttons) {
        var rendered = [];
        for (var i in buttons) {
            console.log(buttons[i]);
            var onClick = {};
            switch (buttons[i].type) {
                case "open_url":
                    onClick = {
                        openLink: {
                            url: buttons[i].url
                        }
                    };
                    break;
                case "postback":
                    onClick = {
                        action: {
                            actionMethodName: buttons[i].actions[0].id,
                            parameters: [{
                                key: "destroy_all_on_interaction",
                                value: (buttons[i].destroy_all_on_interaction ? 'yes' : 'no')
                            }],
                        }
                    }
                    break;
                default:
                    console.log("unknown button type " + buttons[i].type);

            }

            rendered.push({
                textButton: {
                    text: buttons[i].title,
                    onClick: onClick
                }
            })
        }
        return rendered;
    },
    sendText: function(thread, text, buttons = false) {
        if (!buttons) {
            return this.sendMessage(thread, {
                text: text
            });
        } else {
            var renderedButtons = this.renderButtons(buttons);
            return this.sendMessage(thread, {
                cards: [{
                    sections: [{
                        widgets: [{
                            textParagraph: {
                                text: text
                            },
                            buttons: renderedButtons
                        }]
                    }]
                }]
            });
        }
    },
    sendVideo: function(thread, url) {
        this.sendText(thread, "Inline video not supported on Google Chat", [{
            type: 'open_url',
            title: 'Watch video',
            destroy_all_on_interaction: false,
            url: url
        }]);
    },
    sendAudio: function(thread, url) {
        this.sendText(thread, "Inline audio not supported on Google Chat", [{
            type: 'open_url',
            title: 'Listen to audio',
            destroy_all_on_interaction: false,
            url: url
        }]);
    },
    sendImage: function(thread, url) {
        return this.sendMessage(thread, {
            cards: [{
                sections: [{
                    widgets: [{
                        image: { imageUrl: url }
                    }]
                }]
            }]
        });
    },
    sendCarousel: function(thread, cards) {
        var renderedCards = [];
        var self = this;
        var renderCard = function(card) {
            console.log(card);
            var renderedCard = {
                sections: [{
                    header: card.title,
                    widgets: [{
                        textParagraph: {
                            text: card.subtitle
                        }
                    }]
                }]
            }
            if (card.image) {
                renderedCard.sections[0].widgets.push({
                    image: {
                        imageUrl: card.image
                    }
                })
            }
            if (card.buttons && card.buttons.length > 0) {
                renderedCard.sections.push({
                    widgets: [{
                        buttons: self.renderButtons(card.buttons)
                    }]
                });
            }
            return renderedCard;
        }


        for (var i = 0; i < cards.length; i++) {
            renderedCards.push(renderCard(cards[i]));
        }


        return this.sendMessage(thread, {
            cards: renderedCards

        });
    },
    reactToEvent: function(req, res) {
        var response = {};
        switch (req.body.type) {
            case "MESSAGE":
                this.parent.getBotResponseAndSend(
                    req.body.user.name,
                    req.body.space.name,
                    req.body.message.text
                );
                break;
            case "ADDED_TO_SPACE":
                this.parent.sendWelcome(
                    req.body.user.name,
                    req.body.space.name
                );
                break;
            case "CARD_CLICKED":

                this.parent.getBotResponseAndSend(
                    req.body.user.name,
                    req.body.space.name,
                    req.body.action.actionMethodName
                );
                var cards = req.body.message.cards;
                for (var i = 0; i < req.body.action.parameters.length; i++) {
                    if (req.body.action.parameters[i].key === "destroy_all_on_interaction") {

                        if (req.body.action.parameters[i].value === "yes") {
                            cards = [{
                                sections: [{
                                    widgets: [{
                                        textParagraph: {
                                            text: ""
                                        }
                                    }]
                                }]
                            }];
                        }
                    }
                }
                response = {
                    actionResponse: {
                        type: "UPDATE_MESSAGE"
                    },
                    cards: cards
                };
                break;

            default:
                console.log(req.body);
                console.log("unhandled event: " + req.body.type);
        }
        return res.json(response);
    }
}


module.exports = TBPGoogleChatConnector