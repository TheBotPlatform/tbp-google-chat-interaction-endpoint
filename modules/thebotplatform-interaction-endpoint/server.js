const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

module.exports = {
    parent: undefined,
    start: function(path, port = false) {

        app.post(path, this.parent.connector.reactToEvent);
        if (port) {
            app.listen(port, function() {
                console.log('App listening on port ' + port);
            });
        }
    }
};