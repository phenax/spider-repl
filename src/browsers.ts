import * as fs from 'node:fs/promises'
import { homedir } from 'node:os'
import * as path from 'node:path'
import {
  DevtoolsProtocolAdapter,
  type ProtocolAdapter,
  WebDriverBiDiProtocolAdapter,
} from './protocolAdapter.ts'
import { try_ } from './utils.ts'

export const browserNames = ['brave', 'chrome', 'chromium', 'firefox'] as const

export type Browser = (typeof browserNames)[number]

export const browsers = (): Record<Browser, ProtocolAdapter> => {
  const configDir = path.join(homedir(), '.local/state/spider-repl')
  const browserConfigDir = (b: string) => path.join(configDir, b)

  const setupConfigDir = async (browser: Browser) => {
    const dir = browserConfigDir(browser)
    const stat = await try_(() => fs.stat(dir))
    if (!stat?.isDirectory()) await fs.mkdir(dir, { recursive: true })
  }

  return {
    brave: new DevtoolsProtocolAdapter({
      command: 'brave',
      args: (args) => [...args, `--user-data-dir=${browserConfigDir('brave')}`],
      beforeStart: () => setupConfigDir('brave'),
    }),
    chrome: new DevtoolsProtocolAdapter({
      command: 'chrome',
      args: (args) => [
        ...args,
        `--user-data-dir=${browserConfigDir('chrome')}`,
      ],
      beforeStart: () => setupConfigDir('chrome'),
    }),
    chromium: new DevtoolsProtocolAdapter({
      command: 'chromium',
      args: (args) => [
        ...args,
        `--user-data-dir=${browserConfigDir('chromium')}`,
      ],
      beforeStart: () => setupConfigDir('chromium'),
    }),
    firefox: new WebDriverBiDiProtocolAdapter({
      command: 'firefox',
      args: (args) => [
        ...args,
        '--new-instance',
        '-P',
        'spider-repl',
        '--profile',
        browserConfigDir('firefox'),
      ],
      beforeStart: () => setupConfigDir('firefox'),
    }),
  }
}

export const protocols = {
  cdp: DevtoolsProtocolAdapter,
  webdriverbidi: WebDriverBiDiProtocolAdapter,
}

export type Protocol = keyof typeof protocols

export const protocolNames = Object.keys(protocols) as Protocol[]

export const makeCustomProtocolAdapter = ({
  cmd,
  protocol,
  host,
  port,
}: {
  protocol: Protocol
  cmd?: string
  host?: string
  port?: number
}) => {
  // TODO: Re-work custom commands to not depend on sh,tail
  return new protocols[protocol]({
    command: 'sh',
    args: (args) => [
      '-c',
      cmd ? `${cmd} ${args.join(' ')}` : 'tail -f /dev/null',
    ],
    host,
    port,
  })
}
