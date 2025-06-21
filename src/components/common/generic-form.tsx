'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DefaultValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z, ZodTypeAny } from 'zod'
import { VariantProps } from 'class-variance-authority'

import {
  ActionConfig,
  ActionState,
  BaseField,
  Field,
  FormCallback,
  INITIAL_ACTION_STATE
} from '@/types'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { ErrorNotification } from '@/components/common/notifications/error-notification'
import { SuccessNotification } from '@/components/common/notifications/success-notification'
import { normalizeFieldsToGroups, sortFieldsByPosition } from '@/lib/utils'
import { useHybridAction } from '@/hooks/useHybridAction'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface ListInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

const ListInput: React.FC<ListInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Elemente eingeben und mit Komma trennen...',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('')

  const addItems = useCallback(
    (items: string[]) => {
      const trimmedItems = items
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      if (trimmedItems.length === 0) return

      const newItems = [...value]

      for (const item of trimmedItems) {
        newItems.push(item)
      }

      onChange(newItems)
    },
    [value, onChange]
  )

  const removeItem = useCallback(
    (index: number) => {
      const newItems = value.filter((_, i) => i !== index)
      onChange(newItems)
    },
    [value, onChange]
  )

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        if (inputValue.trim()) {
          const items = inputValue.split(',')
          addItems(items)
          setInputValue('')
        }
      }
    },
    [inputValue, addItems]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)

      if (newValue.includes(',')) {
        const items = newValue.split(',')
        const lastItem = items.pop() || ''

        if (items.length > 0) {
          addItems(items)
          setInputValue(lastItem)
        }
      }
    },
    [addItems]
  )

  const handleInputBlur = useCallback(() => {
    if (inputValue.trim()) {
      addItems([inputValue])
      setInputValue('')
    }
  }, [inputValue, addItems])

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
      />

      <p className="text-xs text-muted-foreground">
        Elemente mit Komma trennen oder Enter drücken zum Hinzufügen
      </p>
    </div>
  )
}

interface BaseButtonConfig {
  label: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  icon?: React.ReactNode
  className?: string
}

export type SubmitButtonConfig = BaseButtonConfig

interface AdditionalButtonConfig extends BaseButtonConfig {
  action: () => void
}

type NotificationState =
  | { type: 'none' }
  | { type: 'error'; message: string }
  | { type: 'success'; message: string }

interface GFormProps<Schema extends ZodTypeAny> {
  schema: Schema
  fields: Field<Schema>[]
  defaultValues?: DefaultValues<z.infer<Schema>>

  actionConfig: ActionConfig<Schema>
  beforeActionConfig?: ActionConfig<Schema>

  submitButton?: SubmitButtonConfig
  additionalButton?: AdditionalButtonConfig
  customSubmit?: React.ReactNode
  customAdditionalButton?: React.ReactNode
  formStyle?: string
  formItemStyle?: string
  fieldLabelStyle?: string

  onError?: FormCallback
  onSuccess?: FormCallback
  onBeforeActionError?: FormCallback
  onBeforeActionSuccess?: FormCallback
}

const DEFAULT_SUBMIT_CONFIG: SubmitButtonConfig = {
  label: 'Submit',
  variant: 'default',
  size: 'default'
}

const INITIAL_NOTIFICATION_STATE: NotificationState = { type: 'none' }

const GForm = <Schema extends ZodTypeAny>({
  schema,
  fields,
  defaultValues,
  actionConfig,
  beforeActionConfig,

  submitButton = DEFAULT_SUBMIT_CONFIG,
  additionalButton,
  customSubmit,
  customAdditionalButton,
  formStyle,
  formItemStyle,
  fieldLabelStyle,

  onError,
  onSuccess,
  onBeforeActionError,
  onBeforeActionSuccess
}: GFormProps<Schema>) => {
  const router = useRouter()

  const form = useForm<z.infer<Schema>>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const [notificationState, setNotificationState] = useState<NotificationState>(
    INITIAL_NOTIFICATION_STATE
  )

  const pendingFormValuesRef = useRef<z.infer<Schema> | null>(null)

  const {
    state: mainActionState,
    isPending: isMainActionPending,
    executeAction: executeMainAction
  } = useHybridAction(actionConfig)

  const executeMainActionRef = useRef(executeMainAction)

  const defaultBeforeActionConfig: ActionConfig<Schema> = useMemo(
    () => ({
      mode: 'client',
      action: async () => ({ success: true, message: 'SUCCESS' })
    }),
    []
  )

  const {
    state: beforeActionState,
    isPending: isBeforeActionPending,
    executeAction: executeBeforeAction
  } = useHybridAction(beforeActionConfig ?? defaultBeforeActionConfig)

  const isPending = isMainActionPending || isBeforeActionPending

  const setNotification = useCallback((newState: NotificationState) => {
    setNotificationState((prevState) => {
      if (JSON.stringify(prevState) === JSON.stringify(newState)) {
        return prevState
      }
      return newState
    })
  }, [])

  const clearMessages = useCallback(() => {
    setNotification({ type: 'none' })
  }, [setNotification])

  const hasStateChanged = useCallback((state: ActionState) => {
    return JSON.stringify(state) !== JSON.stringify(INITIAL_ACTION_STATE)
  }, [])

  const handleAdditionalLabelClick = useCallback(
    (link?: string) => {
      if (link) {
        router.push(link)
      }
    },
    [router]
  )

  const processedFields = useMemo(() => {
    const sortedFields = sortFieldsByPosition(fields)
    return normalizeFieldsToGroups(sortedFields)
  }, [fields])

  const handleFormSubmit = useCallback(
    async (formValues: z.infer<Schema>) => {
      pendingFormValuesRef.current = formValues

      if (!formValues || typeof formValues !== 'object') {
        setNotification({ type: 'error', message: 'Invalid form data' })
        return
      }

      try {
        if (beforeActionConfig) {
          await executeBeforeAction(formValues)
        } else {
          await executeMainAction(formValues)
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred'
        setNotification({ type: 'error', message: errorMessage })
      }
    },
    [
      beforeActionConfig,
      executeBeforeAction,
      executeMainAction,
      setNotification
    ]
  )

  useEffect(() => {
    if (!hasStateChanged(mainActionState)) return

    if (mainActionState.error && !mainActionState.success) {
      setNotification({ type: 'error', message: mainActionState.error })
      onError?.(mainActionState, form)
    } else if (mainActionState.success) {
      if (mainActionState.message) {
        setNotification({ type: 'success', message: mainActionState.message })
      } else {
        clearMessages()
      }

      onSuccess?.(mainActionState, form)
    }
  }, [
    mainActionState,
    onError,
    onSuccess,
    form,
    hasStateChanged,
    setNotification,
    clearMessages
  ])

  useEffect(() => {
    if (!beforeActionConfig || !hasStateChanged(beforeActionState)) return

    const handleBeforeActionResult = async () => {
      if (beforeActionState.error && !beforeActionState.success) {
        setNotification({ type: 'error', message: beforeActionState.error })
        onBeforeActionError?.(beforeActionState, form)
        pendingFormValuesRef.current = null
      } else if (beforeActionState.success) {
        onBeforeActionSuccess?.(beforeActionState, form)

        const formValuesToSubmit = pendingFormValuesRef.current

        if (!formValuesToSubmit || typeof formValuesToSubmit !== 'object') {
          return
        }

        pendingFormValuesRef.current = null

        try {
          await executeMainActionRef.current(formValuesToSubmit)
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Error executing main action'
          setNotification({ type: 'error', message: errorMessage })
        }
      }
    }

    handleBeforeActionResult()
  }, [
    beforeActionState,
    beforeActionConfig,
    onBeforeActionError,
    onBeforeActionSuccess,
    form,
    hasStateChanged,
    setNotification
  ])

  useEffect(() => {
    clearMessages()
  }, [clearMessages])

  const [popoverOpen, setPopoverOpen] = useState(false)

  const renderFormField = useCallback(
    (fieldConfig: BaseField<Schema>) => {
      return (
        <FormField
          key={fieldConfig.name as string}
          control={form.control}
          name={fieldConfig.name}
          render={({ field }) => (
            <FormItem className={formItemStyle}>
              <div className="flex justify-between items-center">
                <FormLabel
                  className={cn('font-bold text-primary', fieldLabelStyle)}
                >
                  {fieldConfig.label}
                </FormLabel>

                {fieldConfig.additionalLabel && (
                  <button
                    type="button"
                    onClick={() =>
                      handleAdditionalLabelClick(
                        fieldConfig.additionalLabel?.link
                      )
                    }
                    className="text-sm text-primary hover:underline cursor-pointer underline-offset-5 bg-transparent border-none p-0"
                    disabled={isPending}
                  >
                    {fieldConfig.additionalLabel.text}
                  </button>
                )}
              </div>

              {(() => {
                switch (fieldConfig.type) {
                  case 'text':
                  case 'email':
                  case 'password':
                    const { onChange, value, ...rest } = field;
                    return (
                      <FormControl>
                        <Input
                          type={fieldConfig.type}
                          autoComplete={
                            fieldConfig.type === 'password'
                              ? 'current-password'
                              : fieldConfig.type === 'email'
                                ? 'email'
                                : undefined
                          }
                          placeholder={fieldConfig.placeholder}
                          disabled={isPending}
                          value={value ?? ''}
                          onChange={onChange}
                          {...rest}
                        />
                      </FormControl>
                    )
                  case 'textarea':
                    return (
                      <FormControl>
                        <Textarea
                          placeholder={fieldConfig.placeholder}
                          className="resize-none"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                    )
                  case 'select':
                    return (
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={fieldConfig.placeholder}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldConfig.options.map((option) => {
                            return (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )
                  case 'date':
                    return (
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={isPending}
                              variant={'outline'}
                              className={cn(
                                'flex-1 pl-3 text-left font-normal rounded-md',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: de })
                              ) : (
                                <span>{fieldConfig.placeholder}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)
                              setPopoverOpen(false)
                            }}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    )
                  case 'list':
                    return (
                      <FormControl>
                        <ListInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder={fieldConfig.placeholder}
                          disabled={isPending}
                        />
                      </FormControl>
                    )
                  default:
                    return null
                }
              })()}

              <FormMessage />
            </FormItem>
          )}
        />
      )
    },
    [
      form.control,
      formItemStyle,
      fieldLabelStyle,
      isPending,
      handleAdditionalLabelClick,
      popoverOpen
    ]
  )

  const renderButtons = useMemo(() => {
    return (
      <div className="flex flex-col md:flex-row gap-4">
        {customSubmit ? (
          React.isValidElement<{ disabled?: boolean }>(customSubmit) ? (
            React.cloneElement(customSubmit, { disabled: isPending })
          ) : (
            customSubmit
          )
        ) : (
          <Button
            type="submit"
            variant={submitButton.variant}
            size={submitButton.size}
            className={cn(submitButton.className, 'flex-1')}
            disabled={isPending}
          >
            {submitButton.icon}
            {submitButton.label}
          </Button>
        )}

        {additionalButton && (
          <Button
            type="button"
            variant={additionalButton.variant}
            size={additionalButton.size}
            className={cn(additionalButton.className, 'flex-1')}
            disabled={isPending}
            onClick={additionalButton.action}
          >
            {additionalButton.icon}
            {additionalButton.label}
          </Button>
        )}

        {customAdditionalButton &&
          (React.isValidElement<{ disabled?: boolean }>(customAdditionalButton)
            ? React.cloneElement(customAdditionalButton, {
                disabled: isPending
              })
            : customAdditionalButton)}
      </div>
    )
  }, [
    customSubmit,
    customAdditionalButton,
    isPending,
    submitButton,
    additionalButton
  ])

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className={cn('flex flex-col gap-6', formStyle)}
        >
          {processedFields.map((fieldGroup, groupIndex) =>
            fieldGroup.isGroup ? (
              <div key={`field-group-${groupIndex}`} className="flex gap-4">
                {fieldGroup.fields.map((fieldConfig, fieldIndex) => (
                  <div
                    key={`${fieldConfig.name as string}-${fieldIndex}`}
                    className="flex-1"
                  >
                    {renderFormField(fieldConfig)}
                  </div>
                ))}
              </div>
            ) : (
              <div key={`single-field-${fieldGroup.fields[0].name as string}`}>
                {renderFormField(fieldGroup.fields[0])}
              </div>
            )
          )}

          {notificationState.type === 'error' && (
            <ErrorNotification message={notificationState.message} />
          )}
          {notificationState.type === 'success' && (
            <SuccessNotification message={notificationState.message} />
          )}

          {renderButtons}
        </form>
      </Form>
    </div>
  )
}

export default GForm
