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
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import type { State } from "@/types/states.type"
import type { Region } from "@/types/regions.type"
import type { OldGroup } from "@/types/oldGroups.type"

interface GroupEditFormProps {
    group: Group;
    onUpdate: (data: Partial<GroupFormData>) => void;
    onCancel: () => void;
}

const GroupEditForm = ({ group, onUpdate, onCancel }: GroupEditFormProps) => {
    const { user } = useMe();

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<GroupFormData>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            group_name: group.name,
            leader: group.leader || '',
            leader_email: group.leader_email || '',
            leader_phone: group.leader_phone || '',
            state_id: group.state_id || 0,
            region_id: group.region_id || 0,
            old_group_id: undefined,
            old_group_name: group.old_group || '',
        }
    });

    const { states } = useStates();
    const { regions } = useRegions();
    const { oldGroups } = useOldGroups();
    const isSuperAdmin = user?.roles?.some((role) => role.toLowerCase() === 'super admin') ?? false;
    const watchedStateId = watch('state_id');
    const watchedRegionId = watch('region_id');
    const selectedOldGroupName = watch('old_group_name');

    const selectedStateName = states?.find((st: { id: number }) => st.id === watchedStateId)?.name || '';
    const setSelectedStateName = (v: string) => setValue('state_id', (states?.find((st: State) => st.name === v)?.id ?? 0), { shouldValidate: true });

    const selectedRegionName = regions?.find((reg: Region) => reg.id === watchedRegionId)?.name || '';
    const setSelectedRegionName = (v: string) => setValue('region_id', (regions?.find((reg: Region) => reg.name === v)?.id ?? 0), { shouldValidate: true });

    const filteredRegions = (regions || []).filter((region: Region) => {
        if (region.state_id != null && watchedStateId) {
            return Number(region.state_id) === Number(watchedStateId);
        }
        const stateName = states?.find((st: State) => st.id === watchedStateId)?.name;
        if (stateName && region.state) {
            return region.state.toLowerCase() === stateName.toLowerCase();
        }
        return false;
    });

    const handleOldGroupChange = (oldGroupName: string) => {
        if (oldGroupName) {
            const oldGroup = oldGroups?.find((og: OldGroup) => og.name === oldGroupName);
            if (oldGroup) {
                setValue('old_group_id', oldGroup.id, { shouldValidate: true });
                setValue('old_group_name', oldGroupName);
            }
        } else {
            setValue('old_group_id', undefined);
            setValue('old_group_name', '');
        }
    };

    useEffect(() => {
        reset({
            group_name: group.name,
            leader: group.leader || '',
            leader_email: group.leader_email || '',
            leader_phone: group.leader_phone || '',
            state_id: group.state_id || 0,
            region_id: group.region_id || 0,
            old_group_id: ((): number | undefined => {
                if (group.old_group && oldGroups) {
                    const found = oldGroups.find((og: OldGroup) => og.name === group.old_group);
                    return found?.id;
                }
                return undefined;
            })(),
            old_group_name: group.old_group || '',
        });
    }, [group, reset, oldGroups]);

    const onSubmit = (data: GroupFormData) => {
        onUpdate(data);
    };

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
                            placeholder="Enter leader phone number"
                            {...register('leader_phone')}
                        />
                        <Field.ErrorText>{errors.leader_phone?.message}</Field.ErrorText>
                    </Field.Root>

                    {isSuperAdmin && (
                        <Field.Root required invalid={!!errors.state_id}>
                            <StateIdCombobox
                                required
                                value={selectedStateName}
                                onChange={setSelectedStateName}
                                invalid={!!errors.state_id}
                            />
                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                        </Field.Root>
                    )}

                    {isSuperAdmin && (
                        <Field.Root required invalid={!!errors.region_id}>
                            <RegionIdCombobox
                                required
                                value={selectedRegionName}
                                onChange={(v?: number) => setSelectedRegionName(v ? v.toString() : "")}
                                invalid={!!errors.region_id}
                                // items={filteredRegions}
                            />
                            <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                        </Field.Root>
                    )}

                    <Field.Root invalid={!!errors.old_group_id}>
                        <OldGroupIdCombobox
                            value={Number(selectedOldGroupName)}
                            onChange={(v?: number) => handleOldGroupChange(v ? v.toString() : "")}
                            invalid={!!errors.old_group_id}
                        />
                        <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                    </Field.Root>

                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('old_group_name')} />
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
    );
};

export default GroupEditForm;