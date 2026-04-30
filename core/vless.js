import { parseVlessHeader } from "../utils/index.js"

export class VLESS {
  constructor(client, logger, { udpSocket, tcpSocket }) {
    this.tcpSocket = tcpSocket
    this.udpSocket = udpSocket
    this.currentSocket = null
    this.logger = logger

    this.opts = {}
    this.started = false
    this.client = client
  }

  async respond(data) {
    if (this.started) {
      this.sendToCurrentSocket(data)
      return
    }
    this.started = true

    const { version, command, address, port, payload } = parseVlessHeader(data);
    const commandStr = command === 1 ? 'TCP' : command == 2 ? 'UDP' : ''
    this.logger.info(`New request packet (${payload ? payload.length : 0} bytes) to ${address}:${port} with command ${command}`)

    this.opts = {
      commandStr,
      address,
      port
    }

    // send vless greeting
    this.client.send(new Uint8Array([version, 0]))

    const opts = {
      address: address,
      port: port,
      client: this.client
    }

    switch (command) {
      case 1:
        this.currentSocket = this.tcpSocket.createSocket(opts)
        break;
      case 2:
        this.currentSocket = this.udpSocket.createSocket(opts)
        break;
    }

    this.sendToCurrentSocket(payload)
  }

  sendToCurrentSocket(payload) {
    this.logger.info(`Send packet (${payload ? payload.length : 0} bytes) to ${this.opts.address}:${this.opts.port} with ${this.opts.commandStr} socket`)
    if (payload && payload.length > 0 || !this.opts.address) {
      this.currentSocket.send(payload)
    } else {
      this.logger.warn(`Send packet to ${this.opts.address}:${this.opts.port} aborted`)
    }
  }
}
