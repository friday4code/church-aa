// components/oldgroups/components/RegionIdCombobox.tsx
"use client"

import { useRegions } from "@/modules/admin/hooks/useRegion";
import type { Region } from "@/types/regions.type";
import {
    Combobox,
    Field,
    useListCollection,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"

const RegionIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, items }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    items?: Region[];
}) => {
    const [inputValue, setInputValue] = useState("")
    const { regions: allRegions = [], isLoading } = useRegions()
    const regions: Region[] = items || allRegions || [];
    const shouldShowLoading = !items && isLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    // Update collection when regions data loads or input changes
    useEffect(() => {
        if (!regions || regions.length === 0) {
            set([])
            return
        }

        const filteredRegions = regions
            .filter(region =>
                region.name.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map(region => ({
                label: region.name,
                value: region.name
            }))

        set(filteredRegions)
    }, [regions, inputValue, set, items])

    const handleValueChange = (details: any) => {
        if (details.value && details.value.length > 0) {
            const selectedRegion = details.value[0]
            onChange(selectedRegion)
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
            <Combobox.Label>Region Name
                <Field.RequiredIndicator />
            </Combobox.Label>
            <Combobox.Control>
                <Combobox.Input
                    rounded="xl"
                    placeholder={shouldShowLoading ? "Loading regions..." : "Select region"}
                />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {shouldShowLoading ? (
                        <Combobox.Empty>Loading regions...</Combobox.Empty>
                    ) : collection.items.length === 0 ? (
                        <Combobox.Empty>No regions found</Combobox.Empty>
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

export default RegionIdCombobox