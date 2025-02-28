import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import repl from 'node:repl'

export const makeBrowserRepl = async (
  options: { onExit?: () => void } = {},
) => {
  const replServer = repl.start({
    prompt: 'web > ',
    preview: true,
    useGlobal: false,
    breakEvalOnSigint: true,
  })

  const stateDirPath = path.join(
    process.env.HOME ?? '',
    '.local/state/spider-repl',
  )
  await mkdir(stateDirPath, { recursive: true })

  // Dont care if the history setup failed
  replServer.setupHistory(path.join(stateDirPath, 'history'), (_err, _) => {})

  replServer.on('exit', () => options.onExit?.())
  replServer.defineCommand('q', () => options.onExit?.())

  return {
    close: () => replServer.close(),
    attachContext: (
      withCtx: (c: NodeJS.Dict<unknown>) => NodeJS.Dict<unknown>,
    ) => withCtx(replServer.context),
  }
}
