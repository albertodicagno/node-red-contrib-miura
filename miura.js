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
                        this.status({ fill: "green", shape: "ring", text: "Richiesta in corso..." })
                        request.get('http://' + config.hostname + ':' + config.port + '/status.xml', {
                            'auth': {
                                'user': this.credentials.username,
                                'pass': this.credentials.pincode,
                                'sendImmediately': false
                            }
                        }, function (err, res) {
                            if (!err) {
                                if (res.statusCode == 200) {
                                    this.status({ fill: "green", shape: "dot", text: "Richiesta completata." });
                                    msg.payload = res.body
                                    node.send(msg)
                                } else if (res.statusCode == 401) {
                                    this.status({ fill: "red", shape: "ring", text: "Nome utente o pin errato." });
                                } else {
                                    this.status({ fill: "red", shape: "ring", text: "Errore. Codice HTTP " + res.statusCode.toString() + "." });
                                }
                            } else {
                                node.error("HTTP request error", err);
                                this.status({ fill: "red", shape: "ring", text: "Errore richiesta." });
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
    RED.nodes.registerType("miura", MiuraNode, {
        credentials: {
            username: { type: "text" },
            pincode: { type: "password" }
        }
    });
}