/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getUniqueId } from 'react-native-device-info'

import { navigationRef, isNavigationReadyRef } from 'features/navigation/navigationRef'
import { Headers, FailedToRefreshAccessTokenError } from 'libs/fetch'
import { decodeAccessToken } from 'libs/jwt'
import { clearRefreshToken, getRefreshToken } from 'libs/keychain'
import { storage } from 'libs/storage'

import Package from '../../../package.json'

import { DefaultApi } from '../gen'
import { t } from '@lingui/macro'

export function navigateToLogin() {
  if (isNavigationReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate('Login')
  }
}

export async function getAuthenticationHeaders(options?: RequestInit): Promise<Headers> {
  const accessToken = await storage.readString('access_token')
  const shouldAuthenticate = accessToken && (!options || options.credentials !== 'omit')
  if (shouldAuthenticate) {
    return { Authorization: `Bearer ${accessToken}` }
  }
  return {}
}

// HOT FIX waiting for a better strategy
const NotAuthenticatedCalls = [
  'native/v1/account',
  'native/v1/refresh_access_token',
  'native/v1/request_password_reset',
  'native/v1/resend_email_validation',
  'native/v1/reset_password',
  'native/v1/settings',
  'native/v1/signin',
  'native/v1/validate_email',
  'native/v1/offer',
]

/**
 * For each http calls to the api, retrieves the access token and fetchs.
 * Ignores native/v1/refresh_access_token.
 *
 * First decodes the local access token:
 * on success: continue to the call
 * on error (401): try to refresh the access token
 * on error (other): propagates error
 */
export const safeFetch = async (
  url: string,
  options: RequestInit,
  api: DefaultApi
): Promise<Response> => {
  let runtimeOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'device-id': getUniqueId(),
      'app-version': Package.version,
    },
  }

  // dont ask a new token for this specific api call
  for (const apiRoute of NotAuthenticatedCalls) {
    if (url.includes(apiRoute)) {
      return await fetch(url, runtimeOptions)
    }
  }

  // @ts-expect-error
  const authorizationHeader: string = options.headers?.['Authorization'] || ''
  const token = authorizationHeader.replace('Bearer ', '')
  const tokenContent = decodeAccessToken(token)

  if (!tokenContent) {
    return Promise.reject(navigateToLogin())
  }

  if (tokenContent.exp * 1000 <= new Date().getTime()) {
    try {
      const newAccessToken = await refreshAccessToken(api)

      runtimeOptions = {
        ...runtimeOptions,
        headers: {
          ...runtimeOptions.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      }
    } catch (error) {
      return Promise.reject(navigateToLogin())
    }
  }

  return await fetch(url, runtimeOptions)
}

/**
 * Calls Api to refresh the access token using the in-keychain stored refresh token
 * - on success: Stores the new access token
 * - on error : clear storage propagates error
 */
export const refreshAccessToken = async (api: DefaultApi): Promise<string | null> => {
  const refreshToken = await getRefreshToken()

  // if not connected, we also redirect to the login page
  if (refreshToken == null) {
    throw new FailedToRefreshAccessTokenError()
  }
  try {
    const response = await api.postnativev1refreshAccessToken({
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    await storage.saveString('access_token', response.accessToken)

    return await storage.readString('access_token')
  } catch {
    await clearRefreshToken()
    await storage.clear('access_token')
    throw new FailedToRefreshAccessTokenError()
  }
}

const mustUpdateApp = (response: Response) => {
  return response.status === 403 && response.statusText === 'UPGRADE_REQUIRED'
}

// In this case, the following `any` is not that much of a problem in the context of usage
// with the autogenerated files of swagger-codegen.
// !!! Not encouraging to use `any` anywhere else !!!
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleGeneratedApiResponse(response: Response): Promise<any | void> {
  if (response.status === 204) {
    return {}
  }

  if (mustUpdateApp(response)) {
    global.setMustUpdateApp && global.setMustUpdateApp(true)
    return {}
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      await response.json(),
      `Échec de la requête ${response.url}, code: ${response.status}`
    )
  }

  return await response.json()
}

export function isApiError(error: ApiError | unknown): error is ApiError {
  return (error as ApiError).name === 'ApiError'
}

export class ApiError extends Error {
  name = 'ApiError'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  statusCode: number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(statusCode: number, content: any, message?: string) {
    super(message)
    this.content = content
    this.statusCode = statusCode
  }
}

export function extractApiErrorMessage(error: unknown) {
  let message = t`Une erreur est survenue`
  if (isApiError(error)) {
    const { content } = error as { content: { code: string; message: string } }
    if (content && content.code && content.message) {
      message = content.message
    }
  }
  return message
}
