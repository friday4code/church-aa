"use client"

import {
    Combobox,
    Spinner,
    useListCollection,
    HStack,
    Text,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import NaijaStates from 'naija-state-local-government'

// Get LGAs for a state
const getLgasForState = (stateName: string) => {
    try {
        return NaijaStates.lgas(stateName);
    } catch (error) {
        return { lgas: [] };
    }
}

const LGACombobox = ({ stateName, value, onChange, invalid = false }: {
    stateName?: string;
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
}) => {
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    // Load LGAs when state changes
    useEffect(() => {
        if (!stateName) {
            set([])
            return
        }

        setIsLoading(true)
        const lgas = getLgasForState(stateName)
        const lgaItems = lgas?.lgas?.map(lga => ({ label: lga, value: lga }))
        set(lgaItems || [])
        setIsLoading(false)
    }, [stateName, set])

    // Filter LGAs based on input
    useEffect(() => {
        if (!stateName) return

        const filtered = getLgasForState(stateName)?.lgas
            ?.filter(lga => lga.toLowerCase().includes(inputValue.toLowerCase()))
            .map(lga => ({ label: lga, value: lga }))

        set(filtered || [])
    }, [inputValue, stateName, set])

    const handleValueChange = (details: any) => {
        if (details.value && details.value.length > 0) {
            onChange(details.value[0])
        } else {
            onChange('')
        }
    }

    return (
        <Combobox.Root
            collection={collection}
            value={value ? [value] : []}
            onValueChange={handleValueChange}
            onInputValueChange={(e) => setInputValue(e.inputValue)}
            invalid={invalid}
            disabled={!stateName}
        >
            <Combobox.Label>State Code (LGA)</Combobox.Label>
            <Combobox.Control>
                <Combobox.Input
                    rounded="xl"
                    placeholder={stateName ? "Select LGA" : "Select state first"}
                />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {!stateName ? (
                        <Combobox.Empty>Select a state first</Combobox.Empty>
                    ) : isLoading ? (
                        <HStack p="2">
                            <Spinner size="xs" borderWidth="1px" />
                            <Text>Loading LGAs...</Text>
                        </HStack>
                    ) : collection.items.length === 0 ? (
                        <Combobox.Empty>No LGAs found</Combobox.Empty>
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

export default LGACombobox