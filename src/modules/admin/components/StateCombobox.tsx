"use client"

import {
    Combobox,
    useListCollection,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import NaijaStates from 'naija-state-local-government'

// Get all Nigerian states
const nigerianStates = NaijaStates.states()

const StateCombobox = ({ value, onChange, invalid = false, disabled = false }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
}) => {
    const [inputValue, setInputValue] = useState("")

    const { collection, set } = useListCollection({
        initialItems: nigerianStates.map(state => ({ label: state, value: state })) as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    // Filter states based on input
    useEffect(() => {
        const filtered = nigerianStates
            .filter(state =>
                state.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map(state => ({ label: state, value: state }))

        set(filtered)
    }, [inputValue, set])

    const handleValueChange = (details: any) => {
        if (details.value && details.value.length > 0) {
            onChange(details.value[0])
        } else {
            onChange('')
        }
    }

    return (
        <Combobox.Root
            disabled={disabled}
            collection={collection}
            value={value ? [value] : []}
            onValueChange={handleValueChange}
            onInputValueChange={(e) => setInputValue(e.inputValue)}
            invalid={invalid}
            openOnClick
        >
            <Combobox.Label>State Name</Combobox.Label>
            <Combobox.Control>
                <Combobox.Input rounded="xl" placeholder="Select state" />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {collection.items.length === 0 ? (
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

export default StateCombobox