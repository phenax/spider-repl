import puppeteer from 'puppeteer-core';
import repl from 'node:repl';
import path from 'node:path';
import { type BrowserAdapter } from './browserAdapter.ts';
import { mkdir } from 'node:fs/promises';

export const makeBrowserManager = async (
  browserAdapter: BrowserAdapter,
  options: { onExit?: () => void } = {}
) => {
  await browserAdapter.launch({
    onExit: () => options.onExit?.(),
  });

  const browser = await puppeteer.connect({
    ...browserAdapter.connectOptions,
    defaultViewport: { width: 0, height: 0 },
  });
  let page = await browser.newPage();

  browser.on('disconnected', () => options.onExit?.())

  const loadPage = async (url: string) => {
    if (page.isClosed()) {
      page = await browser.newPage();
    }
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const win = window as any;
      win.$expose = (name: string, obj: any) => {
        win[name] ||= {};
        Object.assign(win[name], obj)
      };
    })
  }

  const createWindowProxy = (chain: (string | symbol | number)[] = []) => new Proxy(() => { }, {
    get: (_, name) => createWindowProxy([...chain, name]),
    apply: () => page.evaluate((ch) =>
      ch.reduce<any>((obj, name) => obj?.[name], window), chain),
  })

  const close = async () => {
    // await browser.disconnect();
    await browser.close();
  }

  return {
    browser,
    getPage: () => page,
    loadPage,
    createWindowProxy,
    close,
  }
}

export const makeBrowserRepl = async (options: { onExit?: () => void } = {}) => {
  const replServer = repl.start({
    prompt: 'web > ',
    preview: true,
    useGlobal: false,
    breakEvalOnSigint: true,
  })

  const stateDirPath = path.join(process.env['HOME'] ?? '', '.local/state/spider-repl')
  await mkdir(stateDirPath, { recursive: true })

  // Dont care if the history setup failed
  replServer.setupHistory(path.join(stateDirPath, 'history'), (_err, _) => { })

  replServer.on('exit', () => options.onExit?.())
  replServer.defineCommand('q', () => options.onExit?.())

  return {
    close: () => replServer.close(),
    attachContext: (withCtx: (c: Record<any, any>) => Record<any, any>) => withCtx(replServer.context),
  }
}
