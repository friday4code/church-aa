// components/oldgroups/components/RegionIdCombobox.tsx
"use client"

import type { Region } from "@/types/regions.type";
import { Combobox, Field, useListCollection } from "@chakra-ui/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { adminApi } from "@/api/admin.api"

interface RegionIdComboboxProps {
    value?: number
    onChange: (value?: number) => void
    required?: boolean
    invalid?: boolean
    disabled?: boolean
    stateId?: number
}

const RegionIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, stateId }: RegionIdComboboxProps) => {
    const [inputValue, setInputValue] = useState("")
    const [apiRegions, setApiRegions] = useState<Region[]>([])
    const [apiLoading, setApiLoading] = useState(false)
    const [apiError, setApiError] = useState<string>("")

    useEffect(() => {
        const fetchRegions = async () => {
            if (typeof stateId !== "number" || stateId === 0) {
                setApiRegions([])
                return
            }
            setApiLoading(true)
            try {
                const data = await adminApi.getRegionsByStateId(stateId)
                const mapped: Region[] = (data || []).map(r => ({ id: r.id, name: r.name, code: "", leader: "", state: "", state_id: stateId }))
                setApiRegions(mapped)
                setApiError("")
            } catch (e) {
                setApiRegions([])
                setApiError("Failed to load regions")
            } finally {
                setApiLoading(false)
            }
        }
        fetchRegions()
    }, [stateId])

    const regions: Region[] = apiRegions
    const shouldShowLoading = apiLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const filteredItems = useMemo(() => {
        if (!regions || regions.length === 0) return []
        return regions
            .filter((region) => region.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((region) => ({ label: region.name, value: String(region.id) }))
    }, [regions, inputValue])

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
            return regions.find(r => r.id === value)?.name || ""
        }
        return ""
    }, [regions, value])
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
            defaultHighlightedValue={selectedLabel}
            onValueChange={handleValueChange}
            onInputValueChange={useCallback((e: { inputValue: string }) => setInputValue(e.inputValue), [])}
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
                    placeholder={shouldShowLoading ? "Loading regions..." : (apiError ? apiError : (stateId ? "Select region for state" : "Select region"))}
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
                    ) : apiError ? (
                        <Combobox.Empty>{apiError}</Combobox.Empty>
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
