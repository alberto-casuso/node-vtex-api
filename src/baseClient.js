/* @flow */
import type {AxiosInstance} from 'axios'
import axios from 'axios'

export const DEFAULT_TIMEOUT_MS = 10000

const handleResponse = ({data, headers, config: {responseType}}) =>
  (responseType !== 'arraybuffer') ? data : { data, headers }

export type InstanceOptions = {
  authToken: string,
  userAgent: string,
  account?: string,
  workspace?: string,
  region?: string,
  endpoint?: string,
  timeout?: number,
}

export type ClientOptions = {
  baseURL: string,
  authToken: string,
  userAgent: string,
  timeout?: number,
}

export function createClient (opts: ClientOptions): AxiosInstance {
  const {baseURL, authToken, userAgent, timeout = DEFAULT_TIMEOUT_MS} = opts

  const headers = {
    'Authorization': `token ${authToken}`,
    'User-Agent': userAgent,
  }

  const http = axios.create({
    baseURL,
    headers,
    timeout,
  })

  http.interceptors.response.use(handleResponse, (err) => {
    try {
      delete err.response.request
      delete err.response.config
      delete err.config.res
      delete err.config.data
    } catch (e) {}
    return Promise.reject(err)
  })

  return http
}

export function createWorkspaceURL (service: string, opts: InstanceOptions): string {
  const {account, workspace} = opts
  if (!account || !workspace) {
    throw new Error('Missing required arguments: {account, workspace}')
  }
  return createRootURL(service, opts) + `/${account}/${workspace}`
}

export function createRootURL (service: string, opts: InstanceOptions): string {
  const {region, endpoint} = opts
  if (endpoint) {
    return 'http://' + endpoint
  }

  if (region) {
    return `http://${service}.${region}.vtex.io`
  }

  throw new Error('Missing required: should specify either {region} or {endpoint}')
}

export const noTransforms = [(data: any) => data]

export default {
  createClient,
  createWorkspaceURL,
  createRootURL,
  noTransforms,
}

