# spider-repl
A repl to interact with web browsers during development via puppeteer.


## Features
- Repl/live-environment workflow
- Screenshots
- Record videos
- Interact with page programmatically
- Run javascript on the page
- Use any browser
- ...everything puppeteer can do


## Motivations
It's an experiment. I want to see how the repl workflow to interact with browsers feel and what can be improved.


## Requirements
- nodejs >= 22.6
- Any browser that supports devtools protocol or webdriver bidi: chrome, chromium, brave, firefox, etc.


## Install
Install it globally via npm
```js
npm i -g spider-repl
```

Or run it directly with `npx spider-repl`


## Usage

### Start the repl
Running `spider-repl` will open a new browser window (on your existing session) and start the repl.
```sh
spider-repl
```

By default this will use chromium.


### Use a different browser
```sh
# Supports chrome, chromium, brave, firefox
spider-repl -b firefox
```

For a custom browser, you can specify the command and the dev tools protocol used. (May or may not work)
```sh
spider-repl --protocol cdp --browser-cmd 'some-browser --remote-debugging-port=9999' --port 9999
```

Or if the browser instance is already running with a debugger on port `9999`, you can connect to it using...
```sh
spider-repl --protocol cdp --port 9999
```


### Load a page
Directly load a page
```sh
spider-repl 'https://example.com'
```

Interactively in the repl
```js
load('https://example.com')
```


### Do all the puppeteering
Puppeteer apis are accessible via `browser` & `page`
```js
page.locate('button[data-testid="foobar"]').click()

page.evaluate('someJSFunctionInsideTheWebpage()')
```


### Interact with apps in development

In your app (example using react)
```js
const Component = () => {
  const [state, setState] = useState(0)
  $expose('comp', { state, setState })
}
```

In repl
```js
await $.comp.state // returns the state
$.comp.setState(20) // updates state inside the component
```

