'use client'

import GForm from '@/components/common/generic-form'
import { schema } from './schema'
import { ActionState, formFields } from '@/types'
import { useRouter } from 'next/navigation'
import AuthSection from '@/components/common/auth-section'
import { z } from 'zod'
import { authClient } from '@/lib/auth/auth-client'
import { authenticationMapping } from '@/lib/utils'

const SignInContent = () => {
  const router = useRouter()

  const fields: formFields<typeof schema> = [
    {
      position: 1,
      name: 'username',
      label: 'Benutzername',
      type: 'text'
    },
    {
      position: 2,
      name: 'password',
      label: 'Passwort',
      type: 'password',
      additionalLabel: { text: 'Passwort vergessen?', link: '/forgot-password' }
    }
  ]

  return (
    <AuthSection
      title="Willkommen zurück"
      description="Melde dich in deinen Account an."
    >
      <GForm
        schema={schema}
        fields={fields}
        defaultValues={{
          username: '',
          password: ''
        }}
        submitButton={{ label: 'Anmelden' }}
        onError={(_state, form) => {
          form.setValue('password', '')
        }}
        onSuccess={(_state, form) => {
          form.reset()
          router.push('/dashboard')
        }}
        actionConfig={{
          mode: 'client',
          action: async (
            values: z.infer<typeof schema>
          ): Promise<ActionState> => {
            const { error } = await authClient.signIn.username({
              username: values.username,
              password: values.password
            })
            if (error) {
              const errorMessage =
                authenticationMapping[
                  error.code as keyof typeof authenticationMapping
                ] || 'Ein unbekannter Fehler ist aufgetreten.'

              return { success: false, error: errorMessage }
            }
            return {
              success: true,
              message: 'Du wurdest erfolgreich angemeldet.'
            }
          }
        }}
      />
    </AuthSection>
  )
}

export default SignInContent
