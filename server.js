'use strict';

// load the Node.js TCP library
const net = require('net');
// const ServerHand = require('./serverHand')
const PORT = 1234;
const HOST = 'localhost';

class Server {
  constructor(port, address) {
    this.port = port || PORT;
    this.address = address || HOST;

    this.init();
  }

  init() {
    let server = this;

    let onClientConnected = (sock) => {
      sock.on('data', (data) => {
        console.log(`${data.byteLength}`);
        sock.write(data);
        sock.write('exit');
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