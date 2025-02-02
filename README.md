# web-repl
A repl to interact with web apps during development via puppeteer

> Supports chromium and firefox browsers.


## Usage

Run `web-repl`. This will open a new browser window (on your existing session) and start the repl.

#### Load a page
```js
load('https://example.com')
```

#### Click on a button
```js
page.locate('button[data-testid="foobar"]').click()
```

#### Interact with apps in development

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


## Building

With nodejs installed on your system, you can build it with `npm run build`.
This'll package web-repl into an executable using [node sea](https://nodejs.org/api/single-executable-applications.html).

