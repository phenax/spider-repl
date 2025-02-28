import { protocolNames, browserNames, type Browser, type Protocol } from './browsers.ts';
import * as cmd from 'cmd-ts'

type ReplOptions = {
  browser: Browser,
  protocol: Protocol,
}

export const parseArgs = () => new Promise<ReplOptions>(async (resolve, _reject) => {
  const cli = cmd.command({
    name: 'spider-repl',
    version: '0.0.0',
    description: 'Open up a repl to browser via puppeteer',
    args: {
      browser: cmd.option({
        type: cmd.oneOf(browserNames),
        long: 'browser',
        short: 'b',
        description: 'Browser to use',
        defaultValue: () => 'chromium' as const,
        defaultValueIsSerializable: true,
      }),
      protocol: cmd.option({
        type: cmd.oneOf(protocolNames),
        long: 'protocol',
        description: 'Protocol to use for ',
        defaultValue: () => 'cdp' as const,
        defaultValueIsSerializable: true,
      }),
    },
    handler: resolve,
  })

  await cmd.run(cmd.binary(cli), process.argv)
});
