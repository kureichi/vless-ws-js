import { TCPSocket } from "../services/tcpSocket.js"
import { UDPSocket } from "../services/udpSocket.js"
import { parseVlessHeader } from "../utils/index.js"

export class VLESS {
  constructor(server) {
    this.version = null
    this.command = null
    this.address = null
    this.port = null
    this.payload = null
    this.socket = null
    this.server = server
    
    this.started = false
  }
  
  parse(data) {
    const { version, command, address, port, payload } = parseVlessHeader(data);
    this.version = version
    this.command = command
    this.address = address
    this.port = port
    this.payload = payload
  }
  
  start(data) {
    this.parse(data) 
    console.log(`[VLESS/INIT] ${this.command === 1 ? 'TCP': this.command == 2 ? 'UDP':''} ${this.address} ${this.port}`)
    
    this.server.send(new Uint8Array([this.version, 0]))
    const opts = {
        address: this.address, 
        port: this.port, 
        payload: this.payload
      }

    if (this.command === 1) {
      this.socket = new TCPSocket(opts)
    } else if (this.command === 2) {
      this.socket = new UDPSocket(opts)
    }
    
    if (this.socket) {
      this.socket.relay(this.server)
      this.started = true
    }
  }
  
  continue(payload) {
    if (!this.socket) return

    console.log(`[VLESS/CONTINUE] ${this.command === 1 ? 'TCP': this.command == 2 ? 'UDP':''} ${this.address} ${this.port}`)
    this.socket.write(payload) 
  }
}