import type { ConnectOptions } from "puppeteer-core";

export interface BrowserAdapter {
  name: string;
  connectOptions: ConnectOptions;
}

export class FirefoxBrowserAdapter implements BrowserAdapter {
  name = 'firefox';
  port: number = 9222;

  constructor(port: number = 9222) { this.port = port; }

  get connectOptions(): ConnectOptions {
    return {
      browserWSEndpoint: `ws://127.0.0.1:${this.port}/session`,
      protocol: 'webDriverBiDi',
    }
  }
}

export class ChromiumBrowserAdapter implements BrowserAdapter {
  name = 'chromium';
  port: number = 9222;

  constructor(port: number = 9222) { this.port = port; }

  get connectOptions(): ConnectOptions {
    return {
      browserURL: `http://127.0.0.1:${this.port}`,
      protocol: 'cdp',
    }
  }
}

