import { DevtoolsProtocolBrowserAdapter, WebDriverBiDiBrowserAdapter } from './browserAdapter.ts';

export const browsers = {
  brave: new DevtoolsProtocolBrowserAdapter({ command: 'brave' }),
  chrome: new DevtoolsProtocolBrowserAdapter({ command: 'chrome' }),
  chromium: new DevtoolsProtocolBrowserAdapter({ command: 'chromium' }),
  firefox: new WebDriverBiDiBrowserAdapter({ command: 'firefox' }),
}

export const protocols = {
  cdp: DevtoolsProtocolBrowserAdapter,
  webdriver: WebDriverBiDiBrowserAdapter,
}
