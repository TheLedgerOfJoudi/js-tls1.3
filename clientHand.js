'use strict';

// load the Node.js TCP library
const net = require('net');
const PORT = 1234;
const HOST = 'localhost';
const { spawn } = require('child_process');
const fs = require('fs')
const { randomBytes } = require('crypto')

class ClientHand {
  constructor() {
  }


  async generatePrivateKey() {
    const process = spawn(`bash`, [])
    await new Promise(resolve => process.once(`spawn`, resolve))
    process.stdout.on(`data`, data => console.log(data.toString()))
    process.stderr.on(`data`, data => console.log(data.toString()))
    await new Promise(resolve => process.stdin.write(`exec openssl genpkey -algorithm ed25519 -out private.pem\n`, `utf8`, () => resolve()))
    await Promise.all([
      new Promise(resolve => process.stdout.on('end', resolve)),
      new Promise(resolve => process.stderr.on('end', resolve)),
      new Promise(resolve => process.once(`close`, resolve))
    ])
  }

  async createPublicKeyFromPrivateKey() {
    const process = spawn(`bash`, [])
    await new Promise(resolve => process.once(`spawn`, resolve))
    process.stdout.on(`data`, data => console.log(data.toString()))
    process.stderr.on(`data`, data => console.log(data.toString()))
    await new Promise(resolve => process.stdin.write(`exec openssl pkey -in private.pem -pubout -out public.pem\n`, `utf8`, () => resolve()))
    await Promise.all([
      new Promise(resolve => process.stdout.on('end', resolve)),
      new Promise(resolve => process.stderr.on('end', resolve)),
      new Promise(resolve => process.once(`close`, resolve))
    ])
  }


  async readPublicKey() {
    await this.generatePrivateKey()
    await this.createPublicKeyFromPrivateKey()
    var key = fs.readFileSync('public.pem').toString().substring(26, 87)
    const buffer = Buffer.from(key, 'base64');
    const bufString = buffer.toString('hex');
    return bufString
  }

  async clientHello() {
    var pubKey = await this.readPublicKey()
    const clientRandom = randomBytes(32).toString('hex')
    var helloMessage = "16030100f8"
      + "010000f4"
      + "0303"
      + clientRandom
      + "20e0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"
      + "000813021303130100ff"
      + "0100"
      + "00a3"
      + "0000000d000c0000096c6f63616c686f7374"
      + "000b000403000102"
      + "000a00160014001d0017001e0019001801000101010201030104"
      + "00230000"
      + "00160000"
      + "00170000"
      + "000d001e001c040305030603080708080809080a080b080408050806040105010601"
      + "002b0003020304"
      + "002d00020101"
      + "003300260024001d0020"
      + pubKey
    console.log(helloMessage)
    return helloMessage
  }
}
module.exports = ClientHand;