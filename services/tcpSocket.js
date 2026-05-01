import EventEmitter from 'events'
import net from 'net'

export class TCPSocket {
  constructor(logger) {
    this.logger = logger
  }

  createSocket({ address, port }) {
    const emitter = new EventEmitter()

    const socket = net.connect(port, address, () => {
      this.logger.info(`Socket connected to ${address}:${port}`)
    })

    socket.on('data', (chunk) => {
      this.logger.info(`Emit packet (${chunk.length} Bytes) from ${address}:${port}`)
      emitter.emit('packet', chunk)
    })
    socket.on('error', (error) => {
      this.logger.error(`Error from ${address}:${port}:  ${error.message}`)
      emitter.emit('error', error)
    })

    const send = (payload) => {
      this.logger.info(`Send packet (${payload.length} Bytes) to ${address}:${port}`)

      if (payload?.length) {
        socket.write(payload)
      }
    }

    return {
      send,
      on: (e, c) => emitter.on(e, c)
    }
  }
}
