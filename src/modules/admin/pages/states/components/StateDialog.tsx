"use client"

import {
    Dialog,
    Portal,
    Field,
    CloseButton,
    Button,
    VStack,
    Input,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { stateSchema, type StateFormData } from "../../../schemas/states.schemas"
import type { State } from "@/types/states.type"
import { useEffect, useRef } from "react"
import { useStates } from "@/modules/admin/hooks/useState"
import StateCombobox from "@/modules/admin/components/StateCombobox"

interface StateDialogProps {
    isLoading?: boolean
    isOpen: boolean
    state?: State
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: StateFormData) => void
}

const StateDialog = ({ isLoading, isOpen, state, mode, onClose, onSave }: StateDialogProps) => {
    const { states = [] } = useStates()
    const generatedCodesCache = useRef<Set<string>>(new Set())

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<StateFormData>({
        resolver: zodResolver(stateSchema),
        defaultValues: {
            stateName: state?.name || '',
            stateCode: state?.code || '',
            leader: state?.leader || '',
            leader_email: state?.leader_email || '',
            leader_phone: state?.leader_phone || ''
        }
    })

    const currentStateName = watch('stateName')
    console.log("current state name",currentStateName);
    
    const currentStateCode = watch('stateCode')

    const handleStateChange = (value: string) => {
        setValue('stateName', value)
        const stateCode = value ? generateStateCode(value) : ''
        setValue('stateCode', stateCode)
    }

    // Helper function to generate state code from state name
    const generateStateCode = (stateName: string): string => {
        const words = stateName.trim().split(/\s+/).filter(Boolean)
        const base = words.map(w => w.slice(0, 3).toUpperCase()).join('_')
        let code = base
        const existingCodes = (states || []).map((s: { code: any }) => s.code)
        let suffix = 1
        while (existingCodes.includes(code) || generatedCodesCache.current.has(code)) {
            code = `${base}_${suffix}`
            suffix++
            if (suffix > 99) break
        }
        generatedCodesCache.current.add(code)
        return code
    }

    const onSubmit = (data: StateFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with state data
    useEffect(() => {
        if (isOpen && state) {
            reset({
                stateName: state.name,
                stateCode: state.code,
                leader: state.leader,
                leader_email: state.leader_email || '',
                leader_phone: state.leader_phone || ''
            })
        }
    }, [isOpen, state, reset])

    return (
        <>
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
                        <Dialog.Content rounded="xl" maxW={{ base: "sm", sm: "sm", md: "md", lg: "2xl" }}>
                            <Dialog.Header>
                                <Dialog.Title>
                                    {mode === 'add' ? 'Add New State' : 'Update State'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <form noValidate id="state-form" onSubmit={handleSubmit(onSubmit)}>
                                    <VStack gap="4" colorPalette={"accent"}>
                                        <Field.Root required invalid={!!errors.stateName}>
                                            <StateCombobox
                                                value={currentStateName}
                                                onChange={handleStateChange}
                                                required
                                                invalid={!!errors.stateName}
                                            />
                                            <Field.ErrorText>{errors.stateName?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.stateCode}>
                                            <Field.Label>State Code
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="State code will be auto-generated"
                                                value={currentStateCode}
                                                // readOnly
                                                {...register('stateCode')}
                                            />
                                            <Field.HelperText>
                                                Auto-generated from state name
                                            </Field.HelperText>
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
                                                                                <Field.Root invalid={!!errors.leader_email}>
                                            <Field.Label>Leader Email</Field.Label>
                                            <Input
                                                rounded="lg"
                                                type="email"
                                                placeholder="Enter leader email address"
                                                {...register('leader_email')}
                                            />
                                            <Field.ErrorText>{errors.leader_email?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root invalid={!!errors.leader_phone}>
                                            <Field.Label>Leader Phone</Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="+234908877664"
                                                {...register('leader_phone')}
                                            />
                                            <Field.ErrorText>{errors.leader_phone?.message}</Field.ErrorText>
                                        </Field.Root>
                                        </Field.Root>
                                    </VStack>
                                </form>
                            </Dialog.Body>

                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button rounded="xl" variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>

                                <Button
                                    rounded="xl"
                                    type="submit"
                                    form="state-form"
                                    colorPalette="accent"
                                    loading={isLoading}
                                    loadingText={mode === 'add' ? 'Adding State' : 'Updating State'}
                                    disabled={isLoading}
                                >
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
        </>
    )
}

export default StateDialog;