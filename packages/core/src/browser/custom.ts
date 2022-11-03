import type { Duration, ClocksState } from '../tools/timeUtils'
import { elapsed, timeStampNow, clocksNow } from '../tools/timeUtils'
import { normalizeUrl } from '../tools/urlPolyfill'

interface CustomContextBase {
  method: string
  startClocks: ClocksState
  input: RequestInfo
  init?: RequestInit
  url: string
}

export interface CustomStartContext extends CustomContextBase {
  state: 'start'
}

export interface CustomCompleteContext extends CustomContextBase {
  state: 'complete'
  duration: Duration
  status: number
  response?: Response
  responseType?: string
  isAborted: boolean
  error?: Error
}

export type CustomContext = CustomStartContext | CustomCompleteContext

export function startCustomTrace(input: RequestInfo, init?: RequestInit): CustomStartContext {
  const method = (init && init.method) || (typeof input === 'object' && input.method) || 'GET'
  const url = normalizeUrl((typeof input === 'object' && input.url) || (input as string))
  const startClocks = clocksNow()

  return {
    state: 'start',
    method,
    startClocks,
    input,
    init,
    url,
  }
}

export function completeCustomTrace(
  responsePromise: Promise<Response>,
  startContext: CustomStartContext
): Promise<CustomCompleteContext> {
  const reportFetch = (response: Response | Error) => {
    const context = startContext as unknown as CustomCompleteContext
    context.state = 'complete'
    context.duration = elapsed(context.startClocks.timeStamp, timeStampNow())

    if ('stack' in response || response instanceof Error) {
      context.status = 0
      context.isAborted = response instanceof DOMException && response.code === DOMException.ABORT_ERR
      context.error = response

      return context
    } else if ('status' in response) {
      context.response = response
      context.responseType = response.type
      context.status = response.status
      context.isAborted = false

      return context
    }
  }
}
