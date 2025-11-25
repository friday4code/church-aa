// components/oldgroups/components/GroupIdCombobox.tsx
"use client"

import type { Group } from "@/types/groups.type";
import { Combobox, Field, useListCollection } from "@chakra-ui/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { adminApi } from "@/api/admin.api"

interface GroupIdComboboxProps {
    value?: number
    onChange: (value?: number) => void
    required?: boolean
    invalid?: boolean
    disabled?: boolean
    oldGroupId?: number
}

const GroupIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, oldGroupId }: GroupIdComboboxProps) => {
    const [inputValue, setInputValue] = useState("")
    const [apiGroups, setApiGroups] = useState<Group[]>([])
    const [apiLoading, setApiLoading] = useState(false)
    const [apiError, setApiError] = useState<string>("")

    useEffect(() => {
        const fetchGroups = async () => {
            if (typeof oldGroupId !== "number" || oldGroupId === 0) {
                setApiGroups([])
                return
            }
            setApiLoading(true)
            try {
                const data = await adminApi.getGroupsByOldGroupId(oldGroupId)
                const mapped: Group[] = (data || []).map(g => ({
                    id: g.id,
                    name: g.name,
                    code: "",
                    leader: null,
                    state: "",
                    region: "",
                    district: "",
                    old_group_id: oldGroupId,
                    old_group: "",
                }))
                setApiGroups(mapped)
                setApiError("")
            } catch (e) {
                setApiGroups([])
                setApiError("Failed to load groups")
            } finally {
                setApiLoading(false)
            }
        }
        fetchGroups()
    }, [oldGroupId])

    const groups: Group[] = apiGroups
    const shouldShowLoading = apiLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const filteredItems = useMemo(() => {
        if (!groups || groups.length === 0) return []
        return groups
            .filter((group) => group.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((group) => ({ label: group.name, value: String(group.id) }))
    }, [groups, inputValue])

    useEffect(() => {
        set(filteredItems)
    }, [filteredItems, set])

    const handleValueChange = useCallback((details: { value: string[] }) => {
        if (details.value && details.value.length > 0) {
            const id = parseInt(details.value[0], 10)
            onChange(Number.isNaN(id) ? undefined : id)
        } else {
            onChange(undefined)
        }
    }, [onChange])

    const selectedLabel = useMemo(() => {
        if (typeof value === 'number' && value > 0) {
            return groups.find(g => g.id === value)?.name || ""
        }
        return ""
    }, [groups, value])
    useEffect(() => {
        setInputValue(selectedLabel)
    }, [selectedLabel])

    return (
        <Combobox.Root
            required={required}
            disabled={disabled || shouldShowLoading}
            collection={collection}
            value={typeof value === 'number' && value > 0 ? [String(value)] : []}
            defaultInputValue={selectedLabel}
            onValueChange={handleValueChange}
            onInputValueChange={useCallback((e: { inputValue: string }) => setInputValue(e.inputValue), [])}
            invalid={invalid}
            closeOnSelect={true}
            openOnClick
        >
            <Combobox.Label>Group Name
                <Field.RequiredIndicator />
            </Combobox.Label>
            <Combobox.Control>
                <Combobox.Input
                    rounded="xl"
                    placeholder={shouldShowLoading ? "Loading groups..." : (apiError ? apiError : "Select group")}
                />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {shouldShowLoading ? (
                        <Combobox.Empty>Loading groups...</Combobox.Empty>
                    ) : apiError ? (
                        <Combobox.Empty>{apiError}</Combobox.Empty>
                    ) : collection.items.length === 0 ? (
                        <Combobox.Empty>No groups found</Combobox.Empty>
                    ) : (
                        collection.items.map((item) => (
                            <Combobox.Item key={item.value} item={item}>
                                {item.label}
                                <Combobox.ItemIndicator />
                            </Combobox.Item>
                        ))
                    )}
                </Combobox.Content>
            </Combobox.Positioner>
        </Combobox.Root>
    )
}

export default GroupIdCombobox
