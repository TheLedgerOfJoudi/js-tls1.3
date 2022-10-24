'use strict';

const net = require('net');
const ServerHand = require('./serverHand.js')
const PORT = 1234;
const HOST = 'localhost';

class Server {
  constructor(port, address) {
    this.port = port || PORT;
    this.address = address || HOST;
    this.hand = new ServerHand()
    this.init();
    this.handshakeSeq = 0;
    this.handshakeSecret = ""
    this.trafficSecret = ""
    this.handshakeKey = ""
    this.handshakeIV = ""
  }

  init() {
    let server = this;

    let onClientConnected = (sock) => {
      sock.on('data', async (data) => {
        if (this.handshakeSeq === 0) {
          var serverHello = await server.hand.serverHello()
          sock.write(serverHello);
          this.handshakeSeq = 1;
          const [handshakeSecret, trafficSecret, handshakeKey, handshakeIV] = await server.hand.serverKeysCalc(data.toString());
        }
      });

      sock.on('close', () => {
        console.log(`connection closed`);
      });

      sock.on('error', (err) => {
        console.log(`Connection error: ${err.message}`);
      });
    }

    server.connection = net.createServer(onClientConnected);

    server.connection.listen(PORT, HOST, function () {
      console.log(`Server started at: ${HOST}:${PORT}`);
    });
  }
}
module.exports = Server;