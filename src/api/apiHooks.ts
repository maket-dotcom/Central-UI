import type { ApiEndpoint } from "./config/types"
import type { AxiosInstance, AxiosRequestConfig } from "axios"

export const useApi = (config: ApiEndpoint[], instance: AxiosInstance) => {
  const getEndpoint = (name: string): ApiEndpoint => {
    const endpoint = config.find((e) => e.name === name)
    if (!endpoint) throw new Error(`Endpoint "${name}" not found in config!`)
    return endpoint
  }

  const constructUrl = (
    endpoint: ApiEndpoint,
    pathParams?: Record<string, string>
  ): string => {
    let url = endpoint.path
    if (endpoint.hasPathParams && pathParams) {
      Object.keys(pathParams).forEach((param) => {
        url = url.replace(`{${param}}`, pathParams[param])
      })
    }
    return url
  }

  const get = async (
    name: string,
    params?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name)
    const url = constructUrl(endpoint, pathParams)
    const response = await instance.get(url, {
      params,
      headers,
    } as AxiosRequestConfig)
    return response
  }

  const post = async (
    name: string,
    data?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name)
    const url = constructUrl(endpoint, pathParams)
    const response = await instance.post(url, data, {
      headers,
    } as AxiosRequestConfig)
    return response
  }

  const patch = async (
    name: string,
    data?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name)
    const url = constructUrl(endpoint, pathParams)
    const response = await instance.patch(url, data, {
      headers,
    } as AxiosRequestConfig)
    return response
  }

  const put = async (
    name: string,
    data?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name)
    const url = constructUrl(endpoint, pathParams)
    const response = await instance.put(url, data, {
      headers,
    } as AxiosRequestConfig)
    return response
  }

  const del = async (
    name: string,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name)
    const url = constructUrl(endpoint, pathParams)
    const response = await instance.delete(url, {
      headers,
    } as AxiosRequestConfig)
    return response
  }

  return { get, post, patch, put, del }
}
