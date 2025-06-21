import GForm, { SubmitButtonConfig } from '@/components/common/generic-form'
import React, { useCallback, useRef } from 'react'
import { ActionConfig, ActionState, FormCallback, formFields } from '@/types'
import { z, ZodTypeAny } from 'zod'
import { DefaultValues, useForm } from 'react-hook-form'

type FormWrapperFormProps<TSchema extends ZodTypeAny> = {
  schema: TSchema
  defaultValues: DefaultValues<z.infer<TSchema>>
  fields: formFields<TSchema>
  submitButton: SubmitButtonConfig
  actionConfig: ActionConfig<TSchema>
  onSuccess?: FormCallback
}

const FormWrapper = <TSchema extends ZodTypeAny>({
  schema,
  defaultValues,
  fields,
  submitButton,
  actionConfig,
  onSuccess
}: FormWrapperFormProps<TSchema>) => {
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  const memoizedOnSuccess = useCallback(
    (actionState: ActionState, form: ReturnType<typeof useForm>) => {
      onSuccessRef.current?.(actionState, form)
    },
    []
  )

  return (
    <GForm
      defaultValues={defaultValues}
      schema={schema}
      fields={fields}
      onSuccess={memoizedOnSuccess}
      submitButton={submitButton}
      actionConfig={actionConfig}
    />
  )
}

export default FormWrapper
