'use strict';

const net = require('net');
const PORT = 1234;
const HOST = 'localhost';
const { spawn } = require('child_process');
const fs = require('fs')
const { randomBytes } = require('crypto')
class ServerHand {
    constructor(port, address) {
        this.helloMessage = ""
    }
    async execute(command) {
        const process = spawn(`bash`, [])
        await new Promise(resolve => process.once(`spawn`, resolve))
        process.stdout.on(`data`, data => console.log(data.toString()))
        process.stderr.on(`data`, data => console.log(data.toString()))
        await new Promise(resolve => process.stdin.write(`exec ${command}\n`, `utf8`, () => resolve()))
        await Promise.all([
            new Promise(resolve => process.stdout.on('end', resolve)),
            new Promise(resolve => process.stderr.on('end', resolve)),
            new Promise(resolve => process.once(`close`, resolve))
        ])
    }

    async readPublicKey() {
        await this.execute("openssl genpkey -algorithm ed25519 -out private-server.pem")
        await this.execute("openssl pkey -in private-server.pem -pubout -out public-server.pem")
        var key = fs.readFileSync('public-server.pem').toString().substring(26, 87)
        const buffer = Buffer.from(key, 'base64');
        const bufString = buffer.toString('hex');
        return bufString
    }

    async serverHello() {
        var pubKey = await this.readPublicKey()
        const serverRandom = randomBytes(32).toString('hex')
        var helloMessage = "160303007a"
            + "02000076"
            + "0303"
            + serverRandom
            + "20e0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"
            + "1302"
            + "00"
            + "002e"
            + "002b00020304"
            + pubKey
        this.helloMessage = helloMessage
        return helloMessage
    }

    async hashHelloMessages(clientHello) {
        const process = spawn(`bash`, [])
        await new Promise(resolve => process.once(`spawn`, resolve))
        process.stdout.on(`data`, data => console.log(data.toString()))
        process.stderr.on(`data`, data => console.log(data.toString()))
        await new Promise(resolve => process.stdin.write(`exec echo ${clientHello} > clienthello&echo ${this.helloMessage} > serverhello&(tail -c +6 clienthello; tail -c +6 serverhello) | openssl sha384 > hashedHello.txt\n`, `utf8`, () => resolve()))
        await Promise.all([
            new Promise(resolve => process.stdout.on('end', resolve)),
            new Promise(resolve => process.stderr.on('end', resolve)),
            new Promise(resolve => process.once(`close`, resolve))
        ])
    }

    async serverKeysCalc(data) {
        await this.execute("cc -o curve25519-mult curve25519-mult.c")
        await this.execute("./curve25519-mult private-server.pem \ public-client.pem | hexdump > shared-server.txt")
        await this.hashHelloMessages(data)
        return [0, 0, 0, 0]
    }
}
module.exports = ServerHand;