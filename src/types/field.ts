import { z, ZodTypeAny } from 'zod'
import { Path } from 'react-hook-form'

type FieldType = 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'list'

type BaseFieldCommon<T extends ZodTypeAny> = {
  name: Path<z.infer<T>>
  label: string
  additionalLabel?: { text: string; link?: string }
  placeholder?: string
}

type NonSelectField<T extends ZodTypeAny> = BaseFieldCommon<T> & {
  type: Exclude<FieldType, 'select'>
}

type SelectField<T extends ZodTypeAny> = BaseFieldCommon<T> & {
  type: 'select'
  options: { value: string; label: string }[]
}

type ListField<T extends ZodTypeAny> = BaseFieldCommon<T> & {
  type: 'list'
  maxItems?: number
  allowDuplicates?: boolean
  itemValidator?: (item: string) => boolean | string
}

export type BaseField<T extends ZodTypeAny> = NonSelectField<T> | SelectField<T> | ListField<T>

export type NormalizedFieldGroup<Schema extends ZodTypeAny> =
  | { isGroup: false; fields: [BaseField<Schema>] }
  | { isGroup: true; fields: BaseField<Schema>[] }

export type SingleField<T extends ZodTypeAny> = BaseField<T> & {
  position: number
}

export type GroupedField<T extends ZodTypeAny> = {
  position: number
  fields: Array<BaseField<T>>
}

export type Field<T extends ZodTypeAny> = SingleField<T> | GroupedField<T>

export type formFields<T extends ZodTypeAny> = Field<T>[]