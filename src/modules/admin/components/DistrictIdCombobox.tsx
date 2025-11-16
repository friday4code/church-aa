// components/oldgroups/components/DistrictIdCombobox.tsx
"use client"

import { useDistricts } from "@/modules/admin/hooks/useDistrict";
import type { District } from "@/types/districts.type";
import {
    Combobox,
    Field,
    useListCollection,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"

const DistrictIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, items }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    items?: District[];
}) => {
    const [inputValue, setInputValue] = useState("")
    const { districts: allDistricts = [], isLoading } = useDistricts()
    const districts: District[] = items || allDistricts || [];
    const shouldShowLoading = !items && isLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    // Update collection when districts data loads or input changes
    useEffect(() => {
        if (!districts || districts.length === 0) return

        const filteredDistricts = districts
            .filter(district =>
                district.name.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map(district => ({
                label: district.name,
                value: district.name
            }))

        set(filteredDistricts)
       }, [districts, inputValue, set, items])

    const handleValueChange = (details: any) => {
        if (details.value && details.value.length > 0) {
            const selectedDistrict = details.value[0]
            onChange(selectedDistrict)
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
            <Combobox.Label>District Name
                <Field.RequiredIndicator />
            </Combobox.Label>
            <Combobox.Control>
                <Combobox.Input
                    rounded="xl"
                    placeholder={shouldShowLoading ? "Loading districts..." : "Select district"}
                />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {shouldShowLoading ? (
                        <Combobox.Empty>Loading districts...</Combobox.Empty>
                    ) : collection.items.length === 0 ? (
                        <Combobox.Empty>No districts found</Combobox.Empty>
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

export default DistrictIdCombobox