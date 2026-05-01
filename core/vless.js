import { parseVlessHeader } from "../utils/index.js"

export class VLESS {
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

      const { version, command, address, port, payload } = parseVlessHeader(data);
      const commandStr = command === 1 ? 'TCP' : command == 2 ? 'UDP' : ''
      this.logger.info(`New request packet (${payload ? payload.length : 0} bytes) to ${address}:${port} with command ${command}`)

      opts = {
        commandStr,
        address,
        port
      }

      // send vless greeting
      client.send(new Uint8Array([version, 0]))

      const socketOpts = {
        address: address,
        port: port,
        client: client
      }

      switch (command) {
        case 1:
          currentSocket = tcpSocket.createSocket(socketOpts)
          currentSocket.on('packet', (packet) => {
            this.logger.info(`Relay packet (${packet.length} bytes) from TCP socket to client`)
            client.send(packet)
          })
          break;
        case 2:
          currentSocket = udpSocket.createSocket(socketOpts)
          currentSocket.on('packet', (packet) => {
            const packetLength = packet.length
            const header = Buffer.alloc(2)
            header.writeUint16BE(packetLength)
            const newPacket = Buffer.concat([header, packet])

            this.logger.info(`Relay packet (${newPacket.length} bytes) from UDP socket to client`)
            client.send(newPacket)
          })
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
