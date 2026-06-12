import type { ApiResponse } from './types'

export const unwrapApiResponse = <T>(payload: ApiResponse<T> | T): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    'success' in payload
  ) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}
