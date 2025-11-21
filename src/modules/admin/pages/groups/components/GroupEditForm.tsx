// components/groups/components/GroupEditForm.tsx
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
import { useEffect } from "react"
import { groupSchema, type GroupFormData } from "../../../schemas/group.schema"
import type { Group } from "@/types/groups.type"
import { useMe } from "@/hooks/useMe"

interface GroupEditFormProps {
    group: Group
    onUpdate: (data: Partial<GroupFormData>) => void
    onCancel: () => void
}

const GroupEditForm = ({ group, onUpdate, onCancel }: GroupEditFormProps) => {
    const { user } = useMe()
    
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            group_name: group.name,
            leader: group.leader || '',
            state_id: user?.state_id || group.state_id || 0,
            region_id: user?.region_id || group.region_id || 0,
        }
    })

    // Set state_id and region_id from logged in user when form initializes
    useEffect(() => {
        if (user) {
            setValue('state_id', user.state_id || 0)
            setValue('region_id', user.region_id || 0)
        }
    }, [user, setValue])

    const onSubmit = (data: GroupFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{group.name}</strong>
            </Text>

            <form id={`group-form-${group.id}`} onSubmit={handleSubmit(onSubmit)}>
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

                    {/* Hidden inputs for state_id and region_id from logged in user */}
                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
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
                    form={`group-form-${group.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default GroupEditForm;