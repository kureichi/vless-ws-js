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
      const commandStr = command === 1 ? 'TCP' : command == 3 ? 'UDP' : ''
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
          currentSocket.on('packet', (packet) => {
            this.logger.info(`Relay packet (${packet.length} bytes) from TCP socket to client`)
            client.send(packet)
          })

          break;
        case 3:
          currentSocket = udpSocket.createSocket(socketOpts)
          currentSocket.on('packet', (packet) => {
            const msgLength = packet.length
            const header = Buffer.alloc(11) 
            header[0] = 0x01
            
            header.writeUint16BE(msgLength, 7)
            header[9] = 0x0D
            header[10] = 0x0A
            
            const newPacket = Buffer.concat([header, packet])

            this.logger.info(`Relay packet (${newPacket.length} bytes) from UDP socket to client`)
            client.send(newPacket)
          })

          break;
      }

      sendToCurrentSocket(payload)
    }

    const sendToCurrentSocket = (payload) => {
      if (currentSocket && payload && payload.length > 0 || !opts.address) {
        let actualPayload = payload 
        if (opts.commandStr == 'UDP') actualPayload = payload.slice(11)

        this.logger.info(`Send packet (${actualPayload ? actualPayload.length : 0} bytes) to ${opts.address}:${opts.port} with ${opts.commandStr} socket`)
        currentSocket.send(actualPayload)
      } else {
        this.logger.warn(`Send packet to ${opts.address}:${opts.port} aborted`)
      }
    }

    return {
      respond
    }
  }
}
