"use client"

import { useOldGroups } from "@/modules/admin/hooks/useOldGroup";
import type { OldGroup } from "@/types/oldGroups.type";
import {
    Combobox,
    Field,
    useListCollection,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"


const OldGroupIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, items }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    items?: OldGroup[];
}) => {
    const [inputValue, setInputValue] = useState("")
    const { oldGroups: data = [], isLoading } = useOldGroups()
    const oldGroups: OldGroup[] = items || data || [];
    const shouldShowLoading = !items && isLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    // Update collection when oldGroups data loads or input changes
    useEffect(() => {
        if (!oldGroups || oldGroups.length === 0) {
            set([])
            return
        }

        const filtered = oldGroups
            .filter(g => g.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map(g => ({ label: g.name, value: g.name }))

        set(filtered)
    }, [oldGroups, inputValue, set])

    const handleValueChange = (details: any) => {
        if (details.value && details.value.length > 0) {
            const selected = details.value[0]
            onChange(selected)
        } else {
            onChange('')
        }
    }

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
            onInputValueChange={(e) => setInputValue(e.inputValue)}
            invalid={invalid}
            closeOnSelect={true}
            openOnClick
        >
            <Combobox.Label>Old Group Name
                <Field.RequiredIndicator />
            </Combobox.Label>
            <Combobox.Control>
                <Combobox.Input
                    rounded="xl"
                    placeholder={shouldShowLoading ? "Loading old groups..." : "Select old group"}
                />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {shouldShowLoading ? (
                        <Combobox.Empty>Loading old groups...</Combobox.Empty>
                    ) : collection.items.length === 0 ? (
                        <Combobox.Empty>No old groups found</Combobox.Empty>
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

export default OldGroupIdCombobox
