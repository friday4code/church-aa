"use client"

import type { OldGroup } from "@/types/oldGroups.type";
import { Combobox, Field, useListCollection } from "@chakra-ui/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useMe } from "@/hooks/useMe"
import { adminApi } from "@/api/admin.api";





interface OldGroupIdComboboxProps {
    value?: number
    onChange: (value?: number) => void
    required?: boolean
    invalid?: boolean
    disabled?: boolean
    stateId?: number
    regionId?: number
    isRegionAdmin?: boolean
}

const OldGroupIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, stateId, regionId, isRegionAdmin }: OldGroupIdComboboxProps) => {
    const [inputValue, setInputValue] = useState("")
    const { user } = useMe()
    const [apiOldGroups, setApiOldGroups] = useState<OldGroup[]>([])
    const [apiLoading, setApiLoading] = useState(false)

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    useEffect(() => {
        const fetchOldGroups = async () => {
            if (typeof regionId !== "number" || regionId === 0) {
                setApiOldGroups([])
                return
            }
            setApiLoading(true)
            try {
                const data = await adminApi.getOldGroupsByRegionId(regionId)
                const mapped: OldGroup[] = (data || []).map(g => ({ id: g.id, name: g.name, code: "", leader: "", state: "", region: "", state_id: undefined, region_id: regionId }))
                setApiOldGroups(mapped)
            } finally {
                setApiLoading(false)
            }
        }
        fetchOldGroups()
    }, [regionId])


    const isRegionAdminEffective = useMemo(() => {
        if (typeof isRegionAdmin === "boolean") return isRegionAdmin
        const roles = user?.roles || []
        return roles.includes("Region Admin")
    }, [isRegionAdmin, user?.roles])

    const errorMessage = useMemo(() => {
        const roles = user?.roles || []
        const isSuperAdmin = roles.includes("Super Admin")
        if (isSuperAdmin) return ""
        if (isRegionAdminEffective) {
            const missingIds = stateId == null || regionId == null
            if (missingIds) {
                return "Missing user scope: state/region ids not provided"
            }
            return ""
        }
        return ""
    }, [user?.roles, isRegionAdminEffective, stateId, regionId])



    const computedOldGroups: OldGroup[] = useMemo(() => {
        const roles = user?.roles || []
        const isSuperAdmin = roles.includes("Super Admin")
        const source = apiOldGroups

        if (isSuperAdmin) {
            return source || []
        }
        if (isRegionAdminEffective) {
            return source || []
        }
        return source || []
    }, [user?.roles, isRegionAdminEffective, apiOldGroups])

    const oldGroups: OldGroup[] = computedOldGroups
    const shouldShowLoading = apiLoading

    const filteredItems = useMemo(() => {
        if (!oldGroups || oldGroups.length === 0) return []
        return oldGroups
            .filter((g) => g.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((g) => ({ label: g.name, value: String(g.id) }))
    }, [oldGroups, inputValue])

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
            return oldGroups.find(g => g.id === value)?.name || ""
        }
        return ""
    }, [oldGroups, value])
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
                    ) : errorMessage ? (
                        <Combobox.Empty>{errorMessage}</Combobox.Empty>
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
