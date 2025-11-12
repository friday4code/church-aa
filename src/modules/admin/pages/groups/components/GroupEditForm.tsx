// components/groups/components/GroupEditForm.tsx
"use client"

import {
    VStack,
    HStack,
    Field,
    Input,
    Button,
    Text,
    Select,
    createListCollection,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormData } from "../../../schemas/group.schema"
import type { Group } from "@/types/groups.type"

interface GroupEditFormProps {
    group: Group
    onUpdate: (data: Partial<GroupFormData>) => void
    onCancel: () => void
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

const GroupEditForm = ({ group, onUpdate, onCancel }: GroupEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            group_name: group.group_name,
            leader: group.leader,
            access_level: group.access_level,
            state_id: group.state_id,
            region_id: group.region_id,
            district_id: group.district_id,
        }
    })

    const currentAccessLevel = watch('access_level')

    const handleAccessLevelChange = (value: string[]) => {
        if (value.length > 0) {
            setValue('access_level', value[0], { shouldValidate: true })
        }
    }

    const onSubmit = (data: GroupFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{group.group_name}</strong>
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
                            <Select.Label>Select Access Level</Select.Label>
                            <Select.Control>
                                <Select.Trigger rounded="lg">
                                    <Select.ValueText placeholder="Select access level" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                                <Select.Content>
                                    {ACCESS_LEVELS.items.map((level) => (
                                        <Select.Item item={level} key={level.value}>
                                            {level.label}
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Select.Root>
                        <Field.ErrorText>{errors.access_level?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.state_id}>
                        <Field.Label>State ID
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            type="number"
                            rounded="lg"
                            placeholder="Enter state ID"
                            {...register('state_id', { valueAsNumber: true })}
                        />
                        <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.region_id}>
                        <Field.Label>Region ID
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            type="number"
                            rounded="lg"
                            placeholder="Enter region ID"
                            {...register('region_id', { valueAsNumber: true })}
                        />
                        <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.district_id}>
                        <Field.Label>District ID
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            type="number"
                            rounded="lg"
                            placeholder="Enter district ID"
                            {...register('district_id', { valueAsNumber: true })}
                        />
                        <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
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
                    form={`group-form-${group.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default GroupEditForm;