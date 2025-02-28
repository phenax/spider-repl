import { spawn } from 'node:child_process'
import type { ConnectOptions } from 'puppeteer-core'

const RETRY_INTERVAL = 1300 // ms

type LaunchOpts = { onExit?: () => void }

type BrowserAdapterOptions = {
  command: string
  args?: (args: string[]) => string[]
  port?: number
  host?: string
  beforeStart?: () => void | PromiseLike<void>
}

export abstract class ProtocolAdapter {
  abstract connectOptions: ConnectOptions

  command: BrowserAdapterOptions['command']
  args: BrowserAdapterOptions['args'] = undefined
  host: BrowserAdapterOptions['host'] = '127.0.0.1'
  port: BrowserAdapterOptions['port'] = 9222
  beforeStart: BrowserAdapterOptions['beforeStart']

  constructor({
    host,
    port,
    args,
    command,
    beforeStart,
  }: BrowserAdapterOptions) {
    this.command = command
    if (host !== undefined) this.host = host
    if (port !== undefined) this.port = port
    if (args !== undefined) this.args = args
    if (beforeStart !== undefined) this.beforeStart = beforeStart
  }

  async launch(options: LaunchOpts = {}) {
    await this.beforeStart?.()
    let args = [`--remote-debugging-port=${this.port}`]
    args = this.args ? this.args.apply(this, [args]) : args
    const proc = spawn(this.command, args, { stdio: 'pipe', detached: false })
    proc.once('exit', () => options?.onExit?.())
    await waitForHttp200(`http://${this.host}:${this.port}/`)
  }
}

export class WebDriverBiDiProtocolAdapter extends ProtocolAdapter {
  get connectOptions(): ConnectOptions {
    return {
      browserWSEndpoint: `ws://${this.host}:${this.port}/session`,
      protocol: 'webDriverBiDi',
    }
  }
}

export class DevtoolsProtocolAdapter extends ProtocolAdapter {
  get connectOptions(): ConnectOptions {
    return {
      browserURL: `http://127.0.0.1:${this.port}`,
      protocol: 'cdp',
    }
  }
}

const waitForHttp200 = async (url: string) => {
  await new Promise((res) => setTimeout(res, 500))
  // Wait for debug port to open up (5 poll attempts)
  for (const _ in Array.from({ length: 5 })) {
    try {
      const resp = await fetch(url)
      if (resp.status === 200) return
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL))
    } catch (e) {}
  }
}
