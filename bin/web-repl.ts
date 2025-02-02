#!/usr/bin/env node

import { makeBrowserManager, makeBrowserRepl } from '../src/index.ts'
import { ChromiumBrowserAdapter, FirefoxBrowserAdapter } from '../src/browserAdapter.ts'

const browsers = {
  brave: new ChromiumBrowserAdapter({ command: 'brave' }),
  firefox: new FirefoxBrowserAdapter,
}

const browserAdapter = browsers.firefox

const main = async () => {
  const browserManager = await makeBrowserManager(browserAdapter, {
    onExit: () => quit(),
  })

  const repl = await makeBrowserRepl({ onExit: () => quit() })

  repl.attachContext(ctx => {
    Object.assign(ctx, {
      $: browserManager.createWindowProxy(),
    })

    Object.defineProperties(ctx, {
      page: {
        get: () => browserManager.getPage(),
      },
      load: {
        get: () => browserManager.loadPage,
      },
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

main().catch(e => {
  console.error(e)
  process.exit(1)
})
