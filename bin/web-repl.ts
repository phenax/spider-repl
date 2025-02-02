import { makeBrowserManager, makeBrowserRepl } from '../src/index.ts';
import { FirefoxBrowserAdapter } from '../src/browserAdapter.ts';

const quit = async () => {
  await browserManager.close();
  repl.close()
  console.log('bye bye')
  process.exit(0);
}

const browserManager = await makeBrowserManager(new FirefoxBrowserAdapter(9222), {
  onExit: quit,
});

const repl = await makeBrowserRepl({ onExit: quit });

repl.attachContext(ctx => Object.assign(ctx, {
  quit,
  $: browserManager.createWindowProxy(),
  load: browserManager.loadPage,
  page: browserManager.page,
}))
