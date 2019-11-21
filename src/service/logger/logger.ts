import { IOContext } from '../../service/typings'
import { cleanError } from '../../utils/error'
import { logOnceToDevConsole } from './console'

const linked = !!process.env.VTEX_APP_LINK
const app = process.env.VTEX_APP_ID
const EMPTY_MESSAGE = 'Logger.log was called with null or undefined message'

export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export class Logger {
  private account: string
  private workspace: string
  private operationId: string
  private requestId: string
  private production: boolean

  constructor(ctx: Pick<IOContext, 'account'|'workspace'|'requestId'|'operationId'|'production'>) {
    this.account = ctx.account
    this.workspace = ctx.workspace
    this.requestId = ctx.requestId
    this.operationId = ctx.operationId
    this.production = ctx.production
  }

  public debug = (message: any) =>
    this.log(message, LogLevel.Debug)

  public info = (message: any) =>
    this.log(message, LogLevel.Info)

  public warn = (warning: any) =>
    this.log(warning, LogLevel.Warn)

  public error = (error: any) =>
    this.log(error, LogLevel.Error)

  public log = (message: any, level: LogLevel): void => {
    const data = message ? cleanError(message) : EMPTY_MESSAGE
    /* tslint:disable:object-literal-sort-keys */
    console.log(JSON.stringify({
      __VTEX_IO_LOG: true,
      level,
      app,
      account: this.account,
      workspace: this.workspace,
      production: this.production,
      data,
      operationId: this.operationId,
      requestId: this.requestId,
    }))

    // Warn the developer how to retrieve the error in splunk
    this.logSplunkQuery()
  }

  /**
   * Logs splunk query so the developer can search for the errors in splunk.
   * This function runs only once in the lifetime of the Logger class so we
   * don't mess up with the developer's terminal
   */
  private logSplunkQuery = () => {
    if (linked) {
      const message = `Try this query at Splunk to retrieve error log: 'index=io_vtex_logs app="${app}" account=${this.account} workspace=${this.workspace} level=error OR level=warn'`
      logOnceToDevConsole(message, LogLevel.Info)
    }
  }
}
