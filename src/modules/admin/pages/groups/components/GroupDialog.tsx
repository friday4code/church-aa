// components/groups/components/GroupDialog.tsx
"use client"

import {
    Dialog,
    Portal,
    Field,
    CloseButton,
    Button,
    VStack,
    Input,
    Select,
    createListCollection,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormData } from "../../../schemas/group.schema"
import type { Group } from "@/types/groups.type"
import { useEffect } from "react"
import { useMe } from "@/hooks/useMe"

interface GroupDialogProps {
    isLoading?: boolean
    isOpen: boolean
    group?: Group
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: GroupFormData) => void
}

// Access level options
const ACCESS_LEVELS = createListCollection({
    items: [
        { label: 'State Admin', value: 'state-admin' },
        { label: 'Region Admin', value: 'region-admin' },
        { label: 'District Admin', value: 'district-admin' },
        { label: 'Group Admin', value: 'group-admin' },
        { label: 'User', value: 'user' },
    ],
})

const GroupDialog = ({ isLoading, isOpen, group, mode, onClose, onSave }: GroupDialogProps) => {
    const { user } = useMe()

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            group_name: group?.name || '',
            leader: group?.leader || '',
            access_level: 'user',
            state_id: group?.state_id || 0,
            region_id: group?.region_id || 0,
        }
    })

    const currentAccessLevel = watch('access_level')

    const handleAccessLevelChange = (value: string[]) => {
        if (value.length > 0) {
            setValue('access_level', value[0], { shouldValidate: true })
        }
    }

    const onSubmit = (data: GroupFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with group data or set from logged in user
    useEffect(() => {
        if (isOpen) {
            if (group) {
                reset({
                    group_name: group.name,
                    leader: group.leader || '',
                    access_level: group.access_level || 'user',
                    state_id: group.state_id || 0,
                    region_id: group.region_id || 0,
                })
            } else {
                // For new groups, use logged in user's state_id and region_id
                reset({
                    group_name: '',
                    leader: '',
                    access_level: 'user',
                    state_id: user?.state_id || 0,
                    region_id: user?.region_id || 0,
                })
            }
        }
    }, [isOpen, group, reset, user])

    return (
        <Dialog.Root
            role="alertdialog"
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
                    <Dialog.Content rounded="xl" maxW="2xl">
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add New Group' : 'Update Group'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="group-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <Field.Root required invalid={!!errors.group_name}>
                                        <Field.Label>Group Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter group name"
                                            {...register('group_name')}
                                        />
                                        <Field.ErrorText>{errors.group_name?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.leader}>
                                        <Field.Label>Group Leader
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter group leader name"
                                            {...register('leader')}
                                        />
                                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.access_level}>
                                        <Field.Label>Access Level
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Select.Root
                                            collection={ACCESS_LEVELS}
                                            value={currentAccessLevel ? [currentAccessLevel] : []}
                                            onValueChange={(e) => handleAccessLevelChange(e.value)}
                                            size="md"
                                        >
                                            <Select.HiddenSelect {...register('access_level')} />
                                            <Select.Control>
                                                <Select.Trigger cursor={"pointer"} rounded="lg">
                                                    <Select.ValueText placeholder="Select access level" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            {/* <Portal> */}
                                            <Select.Positioner>
                                                <Select.Content rounded="xl">
                                                    {ACCESS_LEVELS.items.map((level) => (
                                                        <Select.Item cursor="pointer" item={level} key={level.value}>
                                                            {level.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                            {/* </Portal> */}
                                        </Select.Root>
                                        <Field.ErrorText>{errors.access_level?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* Hidden inputs for state_id and region_id from logged in user */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
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
                                form="group-form"
                                colorPalette="accent"
                                loading={isLoading}
                                loadingText={mode === 'add' ? 'Adding Group' : 'Updating Group'}
                                disabled={isLoading}
                            >
                                {mode === 'add' ? 'Add Group' : 'Update Group'}
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
}

export default GroupDialog;