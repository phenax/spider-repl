import puppeteer from 'puppeteer-core'
import type { ProtocolAdapter } from './protocolAdapter.ts'

export const makeBrowserManager = async (
  browserAdapter: ProtocolAdapter,
  options: { onExit?: () => void } = {},
) => {
  await browserAdapter.launch({
    onExit: () => options.onExit?.(),
  })

  const browser = await puppeteer.connect({
    ...browserAdapter.connectOptions,
    defaultViewport: { width: 0, height: 0 },
  })
  let page = await browser.newPage()

  // Close all tabs except for the current one
  const allPages = await browser.pages()
  if (allPages.length > 1) allPages.forEach((p) => page !== p && p.close())

  browser.on('disconnected', () => options.onExit?.())

  const loadPage = async (url: string) => {
    if (page.isClosed()) page = await browser.newPage()

    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      const win = window as any
      win.$expose = (name: string, obj: unknown) => {
        win[name] ||= {}
        Object.assign(win[name], obj)
      }
    })
  }

  type Prop =
    | { type: 'get'; name: string | symbol | number }
    | { type: 'call'; args: any[] }
  const createWindowProxy = (chain: Prop[] = []): any =>
    new Proxy(() => { }, {
      get: (_, name) => createWindowProxy([...chain, { type: 'get', name }]),
      apply: (_f, _this, args) => {
        const lastIndex = chain.findLastIndex((val) => val.type === 'get')
        const last = chain[lastIndex]
        if (last?.type === 'get' && last.name !== 'wait')
          return createWindowProxy([...chain, { type: 'call', args }])

        return page.evaluate(
          (ch) =>
            ch.reduce((obj, prop) => {
              if (prop.type === 'get') return obj?.[prop.name]
              return obj(...prop.args)
            }, window as any),
          chain.slice(0, lastIndex),
        )
      },
    })

  const screenshotView = (path: string) => page.screenshot({ path })
  const screenshot = Object.assign(screenshotView, {
    full: (path: string) => page.screenshot({ path, fullPage: true }),
    view: screenshotView,
  })

  const close = async () => {
    // await browser.disconnect();
    await browser.close()
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
