import puppeteer from "puppeteer-core";
import type { ProtocolAdapter } from "./protocolAdapter.ts";

export const makeBrowserManager = async (
  browserAdapter: ProtocolAdapter,
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

  const allPages = await browser.pages()
  if (allPages.length > 1) {
    allPages.forEach(p => page !== p && p.close())
  }

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

  const screenshotView = (path: string) => page.screenshot({ path })
  const screenshot = Object.assign(screenshotView, {
    full: (path: string) => page.screenshot({ path, fullPage: true }),
    view: screenshotView,
  })

  const close = async () => {
    // await browser.disconnect();
    await browser.close();
  }

  return {
    browser,
    close,
    createWindowProxy,
    getPage: () => page,
    loadPage,
    screenshot,
  }
}

