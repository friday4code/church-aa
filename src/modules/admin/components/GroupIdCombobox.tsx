// components/oldgroups/components/GroupIdCombobox.tsx
"use client"

import { useGroups } from "@/modules/admin/hooks/useGroup";
import type { Group } from "@/types/groups.type";
import { Combobox, Field, useListCollection } from "@chakra-ui/react"
import { useState, useEffect, useMemo, useCallback } from "react"

const GroupIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, items }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    items?: Group[];
}) => {
    const [inputValue, setInputValue] = useState("")
    const { groups: allGroups = [], isLoading } = useGroups()
    const groups: Group[] = items || allGroups || [];
    const shouldShowLoading = !items && isLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const filteredItems = useMemo(() => {
        if (!groups || groups.length === 0) return []
        return groups
            .filter((group) => group.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((group) => ({ label: group.name, value: group.name }))
    }, [groups, inputValue])

    useEffect(() => {
        set(filteredItems)
    }, [filteredItems, set])

    const handleValueChange = useCallback((details: { value: string[] }) => {
        if (details.value && details.value.length > 0) {
            onChange(details.value[0])
        } else {
            onChange('')
        }
    }, [onChange])

    // Sync the input value with the selected value
    useEffect(() => {
        if (value) {
            setInputValue(value)
        } else {
            setInputValue("")
        }
    }, [value])

    return (
        <Combobox.Root
            required={required}
            disabled={disabled || shouldShowLoading}
            collection={collection}
            value={value ? [value] : []}
            defaultInputValue={value ? value : ""}
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
                    placeholder={shouldShowLoading ? "Loading groups..." : "Select group"}
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