import net from 'net'

export class TCPSocket {
  constructor(logger) {
    this.logger = logger
  }

  createSocket({ address, port, client }) {
    const socket = net.connect(port, address, () => {
      this.logger.info(`Socket connected to ${address}:${port}`)
    })

    socket.on('data', (chunk) => {
      this.logger.info(`Relay packet (${chunk.length} Bytes) from ${address}:${port} to client`)
      client.send(chunk)
    })
    socket.on('error', (error) => {
      this.logger.error(`Error from ${address}:${port}:  ${error.message}`)
      client.close()
    })

    const send = (payload) => {
      this.logger.info(`Send packet (${payload.length} Bytes) to ${address}:${port}`)

      if (payload?.length) {
        socket.write(payload)
      }
    }

    return {
      send
    }
  }
}
