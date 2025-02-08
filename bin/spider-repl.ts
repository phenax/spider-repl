#!/usr/bin/env node

import { initApp } from '../src/index.ts'

initApp().catch(e => {
  console.error(e)
  process.exit(1)
})
