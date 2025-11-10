"use client"

import {
    Dialog,
    Portal,
    Field,
    Input,
    CloseButton,
    Button,
    VStack,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { stateSchema, type StateFormData } from "../../../schemas/states.schemas"
import type { State } from "../../../stores/states.store"
import { useCallback } from "react"

interface StateDialogProps {
    isOpen: boolean
    state?: State
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: StateFormData) => void
}

const StateDialog = ({ isOpen, state, mode, onClose, onSave }: StateDialogProps) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<StateFormData>({
        resolver: zodResolver(stateSchema),
        defaultValues: {
            stateName: state?.stateName || '',
            stateCode: state?.stateCode || '',
            leader: state?.leader || ''
        }
    })

    const onSubmit = (data: StateFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    const StateDialogForm = useCallback(() => {
        return (
            <Dialog.Root
                open={isOpen}
                onOpenChange={(e) => {
                    if (!e.open) {
                        handleClose()
                    }
                }}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content rounded="xl">
                            <Dialog.Header>
                                <Dialog.Title>
                                    {mode === 'add' ? 'Add New State' : 'Update State'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <form noValidate id="state-form" onSubmit={handleSubmit(onSubmit)}>
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
                            </Dialog.Body>

                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button rounded="xl" variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button rounded="xl" type="submit" form="state-form" colorPalette="accent">
                                    {mode === 'add' ? 'Add State' : 'Update State'}
                                </Button>
                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        )
    }, [state, mode, isOpen, errors, handleSubmit, onSubmit, register])

    return <StateDialogForm />
}

export default StateDialog;