import { useFetch } from 'atomic-utils'
import { Session } from 'next-auth'

export function useGoogleSession() {
  return useFetch<Session>('/auth/session')
}
