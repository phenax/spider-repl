import { spawn } from "node:child_process";
import type { ConnectOptions } from "puppeteer-core";

type LaunchOpts = { onExit?: () => void }

type BrowserAdapterOptions = { command: string; args?: () => string[]; port?: number }

export abstract class BrowserAdapter {
  abstract name: string;
  abstract connectOptions: ConnectOptions;

  command: string;
  args: (() => string[]) | undefined = undefined;
  port: number = 9222;

  constructor({ port, args, command }: BrowserAdapterOptions) {
    this.command = command;
    if (port) this.port = port;
    if (args) this.args = args;
  }

  async launch(options: LaunchOpts = {}) {
    const args = this.args ? this.args.apply(this) : [`--remote-debugging-port=${this.port}`]
    const proc = spawn(this.command, args, { stdio: 'pipe', detached: false })
    proc.once('exit', () => options?.onExit?.())
    await waitForHttp200(`http://127.0.0.1:${this.port}/`)
  }
}

export class WebDriverBiDiBrowserAdapter extends BrowserAdapter {
  name = 'webdriverbidi';

  constructor(options: BrowserAdapterOptions) {
    super(options);
  }

  get connectOptions(): ConnectOptions {
    return {
      browserWSEndpoint: `ws://127.0.0.1:${this.port}/session`,
      protocol: 'webDriverBiDi',
    }
  }
}

export class DevtoolsProtocolBrowserAdapter extends BrowserAdapter {
  name = 'cdp';

  constructor(options: BrowserAdapterOptions) {
    super(options);
  }

  get connectOptions(): ConnectOptions {
    return {
      browserURL: `http://127.0.0.1:${this.port}`,
      protocol: 'cdp',
    }
  }
}

const waitForHttp200 = async (url: string) => {
  await new Promise(res => setTimeout(res, 500));
  // Wait for debug port to open up (5 poll attempts)
  for (const _ in Array.from({ length: 5 })) {
    try {
      const resp = await fetch(url)
      if (resp.status === 200) return;
      await new Promise(res => setTimeout(res, 1300));
    } catch (e) { }
  }
}
