import { protocolNames, browserNames, type Browser, type Protocol } from './browsers.ts';
import * as cmd from 'cmd-ts'

type ReplOptions = {
  browser: Browser,
  protocol?: Protocol,
  browserCmd?: string,
  host?: string,
  port?: number,
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
        description: `Name of the browser to use. Supports: ${browserNames.join(', ')}`,
        defaultValue: () => 'chromium' as const,
        defaultValueIsSerializable: true,
      }),
      protocol: cmd.option({
        type: cmd.optional(cmd.oneOf(protocolNames)),
        long: 'protocol',
        description: `Debugging protocol to use to connect with browser. Supports ${protocolNames.join(', ')} (Overrides --browser option)`,
      }),
      browserCmd: cmd.option({
        type: cmd.optional(cmd.string),
        long: 'browser-cmd',
        description: 'Command to run browser (Only used with --protocol)',
      }),
      port: cmd.option({
        type: cmd.optional(cmd.number),
        long: 'port',
        description: 'Port number for remote debugging (Only used with --protocol)',
      }),
      host: cmd.option({
        type: cmd.optional(cmd.string),
        long: 'host',
        description: 'Hostname for remote debugging (Only used with --protocol)',
      }),
    },
    handler: resolve,
  })

  await cmd.run(cmd.binary(cli), process.argv)
});
