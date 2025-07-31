'use client'

import { signOut, useSession } from 'next-auth/react'

export default function SignOutButton() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
    >
      Sign Out
    </button>
  )
}
