import chalk from "chalk"

export const createLogger = ({ scopes }) => {
  let spacingLength = Math.max(...scopes.map(scope => (scope.length)))

  const timeStamps = () => {
    return new Date().toLocaleTimeString('en-GB', { hour12: false })
  }

  const getLogPrefix = () => {
    return `${timeStamps()} `
  }

  const info = (msg, scope) => {
    console.log(`${getLogPrefix()} ${chalk.green('INFO ')} ${scope}: ${msg}`)
  }
  const warn = (msg, scope) => {
    console.log(`${getLogPrefix()} ${chalk.yellow('WARN ')} ${scope}: ${msg}`)
  }
  const error = (msg, scope) => {
    console.log(`${getLogPrefix()} ${chalk.red('ERROR')} ${scope}: ${msg}`)
  }

  const getLogger = (scopeStr) => {
    const scope = scopes.includes(scopeStr) ? scopeStr : null;


    if (!scope) throw new Error(`Scope named '${scopeStr}' not found`)
    const scopeWithSpace = `${" ".repeat(spacingLength - scope.length)}${scope} `

    return {
      info: (msg) => info(msg, scopeWithSpace),
      warn: (msg) => warn(msg, scopeWithSpace),
      error: (msg) => error(msg, scopeWithSpace),
      getLogger
    }
  }

  return {
    getLogger
  }
}
