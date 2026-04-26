import net from 'net'

export class TCPSocket {
  constructor({ address, port, payload }) {
    this.connected = false
    this.remoteSocket = null
    this.address = address
    this.port = port

    console.log('[TCPSOCKET] Socket Created')
    this.remoteSocket = net.connect(port, address, () => {
      this.connected = true
      console.log('[TCPSOCKET] Connected to ' + address)

      this.write(payload)
    })
  }
  
  write(payload) {
    if (!this.remoteSocket) return
    this.remoteSocket.write(payload)
    console.log('[TCPSOCKET] Writed payload to ' + this.address)
  }
  
  relay(server) {
    if (!this.remoteSocket) return
    
    this.remoteSocket.on('data', (chunk) => {
      console.log('[TCPSOCKET] Relayed packet from ' + this.address)
      server.send(chunk)
    })
    this.remoteSocket.on('error', (error) => {
      console.log('[TCPSOCKET/ERROR] ' + error.message)
      server.close()
    })
  }
}