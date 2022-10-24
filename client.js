'use strict';

const net = require('net');
const ClientHand = require('./clientHand.js')
const PORT = 1234;
const HOST = 'localhost';

class Client {
  constructor(port, address) {
    this.socket = new net.Socket();
    this.address = address || HOST;
    this.port = port || PORT;
    this.hand = new ClientHand()
    this.init();
    this.handshakeSeq = 0;
    this.handshakeSecret = ""
    this.trafficSecret = ""
    this.handshakeKey = ""
    this.handshakeIV = ""
  }
  init() {
    var client = this;

    client.socket.connect(client.port, client.address, async () => {
      var clientHello = await client.hand.clientHello()
      client.socket.write(clientHello);
    });

    client.socket.on('data', (data) => {
      console.log(`Client received: ${data}`);
    });

    client.socket.on('close', () => {
      console.log('Client closed');
    });

    client.socket.on('error', (err) => {
      console.error(err);
    });

  }
}
module.exports = Client;