import { TournamentSchema } from '@/lib/schemas'
import { SubmitButtonConfig } from '@/components/common/generic-form'
import { ActionConfig, FormCallback, formFields } from '@/types'
import FormWrapper from '@/components/common/form-wrapper'
import { DefaultValues } from 'react-hook-form'
import { z } from 'zod'

type TournamentFormProps = {
  defaultValues: DefaultValues<z.infer<typeof TournamentSchema>>
  submitButton: SubmitButtonConfig
  actionConfig: ActionConfig<typeof TournamentSchema>
  onSuccess?: FormCallback
}

const TournamentForm = ({
  defaultValues,
  submitButton,
  actionConfig,
  onSuccess
}: TournamentFormProps) => {
  const fields: formFields<typeof TournamentSchema> = [
    {
      position: 1,
      name: 'name',
      label: 'Turniername',
      type: 'text',
      placeholder: 'Name des Turniers, z.B. "Winter 2022" oder "Sommer 2022"'
    },
    {
      position: 2,
      fields: [
        {
          name: 'date',
          label: 'Startdatum',
          type: 'date'
        },
        {
          name: 'location',
          label: 'Ort',
          type: 'text',
          placeholder: 'Ort des Turniers'
        }
      ]
    },
    {
      position: 3,
      name: 'type',
      label: 'Turnierform',
      type: 'select',
      placeholder: 'Wähle eine Turnierform',
      options: [
        { label: 'Turnierbaum', value: 'bracket' },
        { label: 'Tabelle', value: 'table' }
      ]
    },
    {
      position: 4,
      name: 'description',
      label: 'Beschreibung',
      type: 'textarea'
    }
  ]

  return (
    <FormWrapper
      schema={TournamentSchema}
      defaultValues={defaultValues}
      fields={fields}
      submitButton={submitButton}
      actionConfig={actionConfig}
      onSuccess={onSuccess}
    />
  )
}

export default TournamentForm
