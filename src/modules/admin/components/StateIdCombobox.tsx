"use client"

import { useStates } from "@/modules/admin/hooks/useState";
import type { States } from "@/types/states.type";
import {
    Combobox,
    Field,
    useListCollection,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"


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

    // Update collection when states data loads or input changes
    useEffect(() => {
        if (!states || states.length === 0) {
            // Allow custom value even when no states are loaded
            if (inputValue.trim()) {
                set([{
                    label: inputValue,
                    value: inputValue
                }])
            } else {
                set([])
            }
            return
        }

        const filteredStates = states
            .filter(state =>
                state.name.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map(state => ({
                label: state.name,
                value: state.name
            }))

        // Add custom value if input doesn't match any existing state
        if (inputValue.trim() && !filteredStates.some(s => s.value.toLowerCase() === inputValue.toLowerCase())) {
            filteredStates.push({
                label: inputValue,
                value: inputValue
            })
        }

        set(filteredStates)
    }, [states, inputValue, set])

    const handleValueChange = (details: any) => {
        if (details.value && details.value.length > 0) {
            const selectedState = details.value[0]
            onChange(selectedState)
        } else {
            onChange('')
        }
    }

    // Handle blur to accept custom value
    const handleBlur = () => {
        if (inputValue.trim() && inputValue !== value) {
            onChange(inputValue.trim())
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
            disabled={disabled || isLoading}
            collection={collection}
            value={value ? [value] : []}
            defaultInputValue={value ? value : ""}
            onValueChange={handleValueChange}
            onInputValueChange={(e) => setInputValue(e.inputValue)}
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