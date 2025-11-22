"use client"

import { useStates } from "@/modules/admin/hooks/useState";
import type { States } from "@/types/states.type";
import {
    Combobox,
    Field,
    useListCollection,
} from "@chakra-ui/react"
import { useState, useEffect, useMemo, useCallback } from "react"


const StateIdCombobox = ({ required, value, onChange, invalid = false, disabled = false }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
}) => {
    const [inputValue, setInputValue] = useState("")
    const { states: data, isLoading } = useStates()
    const states: States = data;

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const filteredItems = useMemo(() => {
        if (!states || states.length === 0) {
            return inputValue.trim()
                ? [{ label: inputValue, value: inputValue }]
                : []
        }
        const base = states
            .filter((state) => state.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((state) => ({ label: state.name, value: state.name }))
        if (inputValue.trim() && !base.some((s) => s.value.toLowerCase() === inputValue.toLowerCase())) {
            base.push({ label: inputValue, value: inputValue })
        }
        return base
    }, [states, inputValue])

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

    // Handle blur to accept custom value
    const handleBlur = useCallback(() => {
        if (inputValue.trim() && inputValue !== value) {
            onChange(inputValue.trim())
        }
    }, [inputValue, value, onChange])

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
            disabled={disabled || isLoading}
            collection={collection}
            value={value ? [value] : []}
            defaultInputValue={value ? value : ""}
            onValueChange={handleValueChange}
            onInputValueChange={useCallback((e: { inputValue: string }) => setInputValue(e.inputValue), [])}
            onInteractOutside={handleBlur}
            invalid={invalid}
            closeOnSelect={true}
            openOnClick
        >
            <Combobox.Label>State Name
                <Field.RequiredIndicator />
            </Combobox.Label>
            <Combobox.Control>
                <Combobox.Input
                    rounded="xl"
                    placeholder={isLoading ? "Loading states..." : "Select state"}
                />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {isLoading ? (
                        <Combobox.Empty>Loading states...</Combobox.Empty>
                    ) : collection.items.length === 0 ? (
                        <Combobox.Empty>No states found</Combobox.Empty>
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

export default StateIdCombobox