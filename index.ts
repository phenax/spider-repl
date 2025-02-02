import puppeteer, { Browser, Page } from 'puppeteer-core';
import repl from 'node:repl';

type BrowserNames = 'firefox' | 'chromium'

class BrowserManager {
  browserName: BrowserNames = 'chromium';
  browser: Browser | undefined;
  page: Page | undefined;

  constructor(browserName?: BrowserNames) {
    if (browserName)
      this.browserName = browserName
  }

  async init() {
    this.browser = await puppeteer.launch({
      executablePath: process.env[`PUPPETEER_EXECUTABLE_PATH_${this.browserName}`],
      headless: false,
    });
    this.page = await this.browser.newPage();
  }
}

const browserManager = new BrowserManager();
await browserManager.init();

const loadPage = async (url: string) => {
  await browserManager.page?.goto(url, { waitUntil: 'domcontentloaded' });
  await browserManager.page?.evaluate(() => {
    const win = window as any;
    win.$expose = (name: string, obj: any) => {
      win[name] ||= {};
      Object.assign(win[name], obj)
    };
  })
}

const createExposedHandler = (chain: (string | symbol | number)[] = []) => new Proxy({}, {
  get: (_, name) => createExposedHandler([...chain, name]),
  apply: () => browserManager.page?.evaluate(() =>
    chain.reduce<any>((obj, name) => obj?.[name], window)),
})

const webRepl = repl.start({
  prompt: 'web > ',
  preview: true,
  useGlobal: false,
  breakEvalOnSigint: true,
})

const quit = async () => {
  await browserManager.browser?.close()
  webRepl.close()
  console.log('bye bye')
  process.exit(0);
}

webRepl.on('exit', () => quit())
browserManager.browser?.on('disconnected', () => quit())
webRepl.defineCommand('q', () => quit())
Object.assign(webRepl.context, {
  quit,
  load: loadPage,
  $: createExposedHandler(),
  page: browserManager.page,
})
