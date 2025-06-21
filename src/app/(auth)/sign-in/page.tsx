"use server";

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SignInContent from '@/app/(auth)/sign-in/content'

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if(session) {
    return redirect('/')
  }

  return <SignInContent />
}

export default Page