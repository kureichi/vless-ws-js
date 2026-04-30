import { parseTrojanHeader } from "../utils/index.js"

export class TROJAN {
  constructor(logger) {
    this.logger = logger
  }

  createProxy(client, { udpSocket, tcpSocket }) {
    let started = false
    let currentSocket = null
    let opts = {}

    const respond = (data) => {
      if (started) {
        sendToCurrentSocket(data)
        return
      }
      started = true

      const { command, address, port, payload } = parseTrojanHeader(data);
      const commandStr = command === 1 ? 'TCP' : command == 2 ? 'UDP' : ''
      this.logger.info(`New request packet (${payload ? payload.length : 0} bytes) to ${address}:${port} with command ${command}`)

      opts = {
        commandStr,
        address,
        port
      }

      const socketOpts = {
        address: address,
        port: port,
        client: client
      }

      switch (command) {
        case 1:
          currentSocket = tcpSocket.createSocket(socketOpts)
          break;
        case 2:
          currentSocket = udpSocket.createSocket(socketOpts)
          break;
      }

      sendToCurrentSocket(payload)
    }

    const sendToCurrentSocket = (payload) => {
      this.logger.info(`Send packet (${payload ? payload.length : 0} bytes) to ${opts.address}:${opts.port} with ${opts.commandStr} socket`)
      if (currentSocket && payload && payload.length > 0 || !opts.address) {
        currentSocket.send(payload)
      } else {
        this.logger.warn(`Send packet to ${opts.address}:${opts.port} aborted`)
      }
    }

    return {
      respond
    }
  }
}
