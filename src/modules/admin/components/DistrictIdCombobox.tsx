// components/oldgroups/components/DistrictIdCombobox.tsx
"use client"

import { useDistricts } from "@/modules/admin/hooks/useDistrict";
import type { District } from "@/types/districts.type";
import { Combobox, Field, useListCollection } from "@chakra-ui/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useMe } from "@/hooks/useMe"

interface DistrictIdComboboxProps {
    value?: string
    onChange: (value: string) => void
    required?: boolean
    invalid?: boolean
    disabled?: boolean
    items?: District[]
    stateId?: number
    regionId?: number
    oldGroupId?: number
    groupId?: number
    isGroupAdmin?: boolean
}

const DistrictIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, items, stateId, regionId, oldGroupId, groupId, isGroupAdmin }: DistrictIdComboboxProps) => {
    const [inputValue, setInputValue] = useState("")
    const { districts: allDistricts = [], isLoading } = useDistricts()
    const { user } = useMe()

    console.log(items, stateId, regionId, oldGroupId, groupId, isGroupAdmin)

    const isGroupAdminEffective = useMemo(() => {
        if (typeof isGroupAdmin === "boolean") return isGroupAdmin
        const roles = user?.roles || []
        return roles.includes("Group Admin")
    }, [isGroupAdmin, user?.roles])

    const errorMessage = useMemo(() => {
        const roles = user?.roles || []
        const isSuperAdmin = roles.includes("Super Admin")
        if (isSuperAdmin) return ""
        if (isGroupAdminEffective) {
            const sId = typeof stateId === "number" ? stateId : undefined
            const rId = typeof regionId === "number" ? regionId : undefined
            const ogId = typeof oldGroupId === "number" ? oldGroupId : undefined
            const gId = typeof groupId === "number" ? groupId : undefined
            const noScopeIds = sId == null && rId == null && ogId == null && gId == null
            return noScopeIds ? "Missing user scope: state/region/group ids not provided" : ""
        }
        return ""
    }, [user?.roles, isGroupAdminEffective, stateId, regionId, oldGroupId, groupId])

    const effectiveDistricts: District[] = useMemo(() => {
        // Super Admin: preserve existing behavior using passed-in items or all districts
        const roles = user?.roles || []
        const isSuperAdmin = roles.includes("Super Admin")
        if (isSuperAdmin) {
            return items || allDistricts || []
        }

        // Group Admin: use provided scope IDs exclusively
        if (isGroupAdminEffective) {
            const sId = typeof stateId === "number" ? stateId : undefined
            const rId = typeof regionId === "number" ? regionId : undefined
            const ogId = typeof oldGroupId === "number" ? oldGroupId : undefined
            const gId = typeof groupId === "number" ? groupId : undefined

            const noScopeIds = sId == null && rId == null && ogId == null && gId == null
            if (noScopeIds) return []
            const source = allDistricts || []
            return source.filter((d) => {
                const stateMatch = sId != null ? d.state_id === sId : true
                const regionMatch = rId != null ? d.region_id === rId : true
                const oldGroupMatch = ogId != null ? d.old_group_id === ogId : true
                const groupMatch = gId != null ? d.group_id === gId : true
                return stateMatch && regionMatch && oldGroupMatch && groupMatch
            })
        }

        // Other roles: preserve existing behavior using passed-in items or all districts
        return items || allDistricts || []
    }, [user?.roles, isGroupAdminEffective, stateId, regionId, oldGroupId, groupId, items, allDistricts])

    const districts: District[] = effectiveDistricts
    const shouldShowLoading = !items && isLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const filteredItems = useMemo(() => {
        if (!districts || districts.length === 0) return []
        return districts
            .filter((district) => district.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((district) => ({ label: district.name, value: district.name }))
    }, [districts, inputValue])

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
                    ) : errorMessage ? (
                        <Combobox.Empty>{errorMessage}</Combobox.Empty>
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
