import { browsers, makeCustomProtocolAdapter } from '../src/browsers.ts'
import { makeBrowserManager } from './browserManager.ts'
import { makeBrowserRepl } from './repl.ts'

import { parseArgs } from './cli.ts'

export const initApp = async () => {
  const options = await parseArgs()
  const browserAdapter = options.protocol
    ? makeCustomProtocolAdapter({
        protocol: options.protocol,
        cmd: options.browserCmd,
        port: options.port,
        host: options.host,
      })
    : browsers()[options.browser]

  const browserManager = await makeBrowserManager(browserAdapter, {
    onExit: () => quit(),
  })

  const repl = await makeBrowserRepl({ onExit: () => quit() })

  repl.attachContext((ctx) => {
    Object.assign(ctx, {
      $: browserManager.createWindowProxy(),
    })

    Object.defineProperties(ctx, {
      browser: { get: () => browserManager.browser },
      page: { get: () => browserManager.getPage() },
      load: { get: () => browserManager.loadPage },
      screenshot: { get: () => browserManager.screenshot },
    })

    return ctx
  })

  if (options.startUrl)
    browserManager.loadPage(options.startUrl.toString()).catch(console.error)

  const quit = async () => {
    console.log('killing myself...')
    await browserManager.close()
    repl.close()
    console.log('bye bye')
    process.exit(0)
  }
}
