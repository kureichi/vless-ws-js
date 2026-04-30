import { sniffProtocol } from "../utils/index.js"

export class Proxy {
  constructor(logger, { vless, trojan }) {
    this.logger = logger
    this.vless = vless
    this.trojan = trojan
  }

  createProxy(client, { tcpSocket, udpSocket }) {
    let proxy = null
    let started = false

    return {
      respond: (data) => {
        if (started && proxy) {
          proxy.respond(data)
          return
        }
        started = true

        const protocol = sniffProtocol(data)

        switch (protocol) {
          case "VLESS":
            this.logger.info('Route request -> vless proxy')
            proxy = this.vless.createProxy(client, { tcpSocket, udpSocket })
            break
          case "TROJAN":
            this.logger.info('Route request -> trojan proxy')
            proxy = this.trojan.createProxy(client, { tcpSocket, udpSocket })
            break
        }

        if (proxy) {
          proxy.respond(data)
        }
      }
    }
  }
}
