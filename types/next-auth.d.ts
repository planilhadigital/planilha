import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      empresasCount?: number
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
  }
}
