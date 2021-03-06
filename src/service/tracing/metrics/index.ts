import { Counter, Gauge, Histogram } from 'prom-client'
import {
  CONCURRENT_REQUESTS,
  REQUEST_RESPONSE_SIZES,
  REQUEST_TIMINGS,
  REQUESTS_ABORTED,
  REQUESTS_TOTAL,
} from './MetricNames'
export { MetricLabels } from './MetricNames'

export const createTotalRequestsInstrument = () => new Counter(REQUESTS_TOTAL)
export const createTotalAbortedRequestsInstrument = () => new Counter(REQUESTS_ABORTED)
export const createRequestsTimingsInstrument = () => new Histogram(REQUEST_TIMINGS)
export const createRequestsResponseSizesInstrument = () => new Histogram(REQUEST_RESPONSE_SIZES)
export const createConcurrentRequestsInstrument = () => new Gauge(CONCURRENT_REQUESTS)
