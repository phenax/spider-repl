import { DevtoolsProtocolAdapter, ProtocolAdapter, WebDriverBiDiProtocolAdapter } from './protocolAdapter.ts';

export const browserNames = ['brave', 'chrome', 'chromium', 'firefox'] as const

export type Browser = (typeof browserNames)[number];

export const browsers = (): Record<Browser, ProtocolAdapter> => ({
  brave: new DevtoolsProtocolAdapter({
    command: 'brave',
    args: args => [...args, '--user-data-dir=/home/imsohexy/.local/state/spider-repl/brave'],
  }),
  chrome: new DevtoolsProtocolAdapter({
    command: 'chrome',
    args: args => [...args, '--user-data-dir=/home/imsohexy/.local/state/spider-repl/chrome'],
  }),
  chromium: new DevtoolsProtocolAdapter({
    command: 'chromium',
    args: args => [...args, '--user-data-dir=/home/imsohexy/.local/state/spider-repl/chromium'],
  }),
  firefox: new WebDriverBiDiProtocolAdapter({
    command: 'firefox',
    args: args => [...args, '--new-instance', '-P', 'spider-repl', '--profile', '/home/imsohexy/.local/state/spider-repl/firefox'],
  }),
})

export const protocols = {
  cdp: DevtoolsProtocolAdapter,
  webdriverbidi: WebDriverBiDiProtocolAdapter,
}

export type Protocol = keyof typeof protocols

export const protocolNames = Object.keys(protocols) as Protocol[]

export const makeBrowser = ({ cmd, protocol }: { cmd: string, protocol: Protocol }) => {
  return new protocols[protocol]({
    command: 'sh',
    args: args => ['-c', `${cmd} ${args.join(' ')}`],
  })
}
