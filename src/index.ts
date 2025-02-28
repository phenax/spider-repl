import { browsers, makeBrowser } from '../src/browsers.ts'
import { makeBrowserManager } from './browserManager.ts'
import { makeBrowserRepl } from './repl.ts'

import { parseArgs } from './cli.ts'

// TODO: Create empty dir for browser profiles
export const initApp = async () => {
  const options = await parseArgs();
  const browserAdapter = options.protocol
    ? makeBrowser({ protocol: options.protocol, cmd: options.browserCmd ?? 'chromium' })
    : browsers()[options.browser];

  const browserManager = await makeBrowserManager(browserAdapter, {
    onExit: () => quit(),
  })

  const repl = await makeBrowserRepl({ onExit: () => quit() })

  repl.attachContext(ctx => {
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

  const quit = async () => {
    console.log('killing myself...')
    await browserManager.close()
    repl.close()
    console.log('bye bye')
    process.exit(0)
  }
}
