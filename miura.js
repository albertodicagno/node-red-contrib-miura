const xml2js = require('xml2js')
const http = require('http')
const parser = new xml2js.Parser()

module.exports = function (RED) {
    function MiuraNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg_in) {
            if (msg_in.payload && msg_in.payload != {}) {
                let msg = {}
                let command = msg_in.command
                switch (command) {
                    case 'getStatus':
                        http.get({
                            hostname: '192.168.5.250',
                            port: 5400,
                            path: '/status.xml',
                            agent: false  // create a new agent just for this one request
                        }, (res) => {
                            msg.payload = msg.payload.toLowerCase()
                            node.send(res);
                        });
                        break;
                }
            }
        });
    }
    RED.nodes.registerType("miura", MiuraNode);
}