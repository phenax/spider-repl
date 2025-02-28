import { protocolNames, browserNames, type Browser, type Protocol } from './browsers.ts';
import * as cmd from 'cmd-ts'
import * as cmdUrl from 'cmd-ts/dist/cjs/batteries/url.js'

type ReplOptions = {
  browser: Browser;
  protocol?: Protocol;
  browserCmd?: string;
  host?: string;
  port?: number;
  startUrl?: URL;
}

const cliArgs = {
  startUrl: cmd.positional({
    type: cmd.optional(cmdUrl.Url),
    description: 'Url of page to load on startup',
    displayName: 'Start URL',
  }),
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
} as const

export const parseArgs = () => new Promise<ReplOptions>(async (resolve, _reject) => {
  const cli = cmd.command({
    name: 'spider-repl',
    version: '0.0.0',
    description: 'Open up a repl to browser via puppeteer',
    args: cliArgs,
    handler: resolve,
  })

  await cmd.run(cmd.binary(cli), process.argv)
});
