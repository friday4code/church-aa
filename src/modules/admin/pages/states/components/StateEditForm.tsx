"use client"

import {
    VStack,
    HStack,
    Field,
    Input,
    Button,
    Text,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { stateSchema, type StateFormData } from "../../../schemas/states.schemas"
import type { State } from "../../../stores/states.store"

interface StateEditFormProps {
    state: State
    onUpdate: (data: Partial<StateFormData>) => void
    onCancel: () => void
}

const StateEditForm = ({ state, onUpdate, onCancel }: StateEditFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<StateFormData>({
        resolver: zodResolver(stateSchema),
        defaultValues: {
            stateName: state.stateName,
            stateCode: state.stateCode,
            leader: state.leader
        }
    })

    const onSubmit = (data: StateFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{state.stateName}</strong>
            </Text>

            <form id={`state-form-${state.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <Field.Root required invalid={!!errors.stateName}>
                        <Field.Label>State Name
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter state name"
                            {...register('stateName')}
                        />
                        <Field.ErrorText>{errors.stateName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.stateCode}>
                        <Field.Label>State Code
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter state code"
                            {...register('stateCode')}
                        />
                        <Field.ErrorText>{errors.stateCode?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.leader}>
                        <Field.Label>State Leader
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter state leader name"
                            {...register('leader')}
                        />
                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                    </Field.Root>
                </VStack>
            </form>

            <HStack justify="flex-end" gap="2" mt="4">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Skip

                </Button>
                <Button
                    size="sm"
                    colorPalette="accent"
                    type="submit"
                    form={`state-form-${state.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default StateEditForm;