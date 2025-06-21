import { TournamentTeamSchema } from '@/lib/schemas'
import { ActionConfig, FormCallback, formFields } from '@/types'
import { SubmitButtonConfig } from '@/components/common/generic-form'
import FormWrapper from '@/components/common/form-wrapper'
import { DefaultValues } from 'react-hook-form'
import { z } from 'zod'

type TournamentTeamFormProps = {
  defaultValues: DefaultValues<z.infer<typeof TournamentTeamSchema>>
  submitButton: SubmitButtonConfig
  actionConfig: ActionConfig<typeof TournamentTeamSchema>
  onSuccess?: FormCallback
}

const TournamentTeamForm = ({
  defaultValues,
  submitButton,
  actionConfig,
  onSuccess
}: TournamentTeamFormProps) => {
  const fields: formFields<typeof TournamentTeamSchema> = [
    {
      position: 1,
      name: 'name',
      label: 'Teamname',
      type: 'text',
      placeholder: 'Name des Teams'
    },
    {
      position: 2,
      name: 'captain',
      label: 'Kapitän (optional)',
      type: 'text',
      placeholder: 'Name des Teamkapitäns'
    },
    {
      position: 3,
      name: 'members',
      label: 'Teammitglieder (optional)',
      type: 'list',
      placeholder: 'Name der Teammitglieder'
    }
  ]

  return (
    <FormWrapper
      schema={TournamentTeamSchema}
      defaultValues={defaultValues}
      fields={fields}
      submitButton={submitButton}
      actionConfig={actionConfig}
      onSuccess={onSuccess}
    />
  )
}

export default TournamentTeamForm
