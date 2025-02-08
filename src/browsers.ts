import { DevtoolsProtocolAdapter, WebDriverBiDiProtocolAdapter } from './protocolAdapter.ts';

export const browsers = () => ({
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
