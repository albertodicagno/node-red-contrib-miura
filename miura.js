const xml2js = require('xml2js')
const request = require('request')
const parser = new xml2js.Parser()

module.exports = function (RED) {
    function MiuraNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg_in) {
            if (msg_in.payload && msg_in.payload.command) {
                let msg = {}
                let command = msg_in.payload.command
                switch (command) {
                    case 'getStatus':
                        request.get('http://' + config.hostname + ':' + config.port + '/status.xml', {
                            'auth': {
                                'user': config.username,
                                'pass': config.pincode,
                                'sendImmediately': false
                            }
                        }, function (err, res) {
                            if (!err) {
                                msg.payload = res.body
                                node.send(msg)
                            } else {
                                node.error("HTTP request error", err);
                            }
                        })
                        break;
                    default:
                        node.error("Command " + ((command.length > 0) ? (command + " ") : "") + "not recognized.");
                        break;
                }
            }
        });
    }
    RED.nodes.registerType("miura", MiuraNode);
}