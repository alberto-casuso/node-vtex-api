import { ClientRequestWithTimings } from '@tiagonapoli/http-timer-shim'
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import buildFullPath from 'axios/lib/core/buildFullPath'
import { Span } from 'opentracing'
import { ROUTER_CACHE_HEADER } from '../../../../../../constants'
import { Tags } from '../../../../../../tracing/Tags'

export const injectRequestInfoOnSpan = (span: Span, http: AxiosInstance, config: AxiosRequestConfig) => {
  let fullUrl = null

  const spanContext: any = span.context()
  if (spanContext.isSampled == null || spanContext.isSampled()) {
    fullUrl = buildFullPath(config.baseURL, http.getUri(config))
  }

  span.addTags({
    [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_CLIENT,
    [Tags.HTTP_METHOD]: config.method,
    [Tags.HTTP_URL]: fullUrl,
    [Tags.HTTP_RETRY_COUNT]: (config as any).retryCount || 0,
  })

  span.log({ event: 'request-headers', headers: config.headers })
}

export const injectRequestTimingsOnSpan = (span: Span, request: any) => {
  if (!request) {
    return
  }

  const timings = request.timings || request._currentRequest?.timings
  if (timings) {
    span.log({ event: 'timings', phases: timings.phases })
  }
}

// Response may be undefined in case of client timeout, invalid URL, ...
export const injectResponseInfoOnSpan = (span: Span, response: AxiosResponse | null) => {
  if (!response) {
    span.setTag(Tags.HTTP_NO_RESPONSE, 'true')
    return
  }

  span.log({ event: 'response-headers', headers: response.headers })
  span.setTag(Tags.HTTP_STATUS_CODE, response.status)
  if (response.headers[ROUTER_CACHE_HEADER]) {
    span.setTag(Tags.HTTP_ROUTER_CACHE, response.headers[ROUTER_CACHE_HEADER])
  }
}
