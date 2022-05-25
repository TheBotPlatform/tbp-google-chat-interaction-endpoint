var TBPConnector = {
    name: "template",
    sendMessage: async function(thread, message) {
        console.log("sending message to " + thread);
        console.log(message);
    },
    setup: async function(config) {
        return this;
    },
    renderButtons: function(buttons) {
        return buttons;
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
        console.log("Sending video " + url + " to " + thread);
    },
    sendAudio: function(thread, url) {
        console.log("Sending audio " + url + " to " + thread);
    },
    sendImage: function(thread, url) {
        console.log("Sending image " + url + " to " + thread);
    },
    sendCarousel: function(thread, cards) {
        console.log("Sending carousel to " + thread);
        console.log(cards);
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


module.exports = TBPConnector