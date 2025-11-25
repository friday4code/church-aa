// components/oldgroups/components/DistrictIdCombobox.tsx
"use client"

import type { District } from "@/types/districts.type";
import { Combobox, Field, useListCollection } from "@chakra-ui/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useMe } from "@/hooks/useMe"
import { adminApi } from "@/api/admin.api"

interface DistrictIdComboboxProps {
    value?: number
    onChange: (value?: number) => void
    required?: boolean
    invalid?: boolean
    disabled?: boolean
    stateId?: number
    regionId?: number
    oldGroupId?: number
    groupId?: number
    isGroupAdmin?: boolean
}

const DistrictIdCombobox = ({ required, value, onChange, invalid = false, disabled = false, stateId, regionId, oldGroupId, groupId, isGroupAdmin }: DistrictIdComboboxProps) => {
    const [inputValue, setInputValue] = useState("")
    const { user } = useMe()
    const [apiDistricts, setApiDistricts] = useState<District[]>([])
    const [apiLoading, setApiLoading] = useState(false)
    const [apiError, setApiError] = useState<string>("")

    useEffect(() => {
        const fetchDistricts = async () => {
            console.log("gropuid", groupId)
            if (typeof groupId !== "number" || groupId === 0) {
                setApiDistricts([])
                return
            }
            setApiLoading(true)
            try {
                const data = await adminApi.getDistrictsByGroupId(groupId)
                console.log("districts",data)
                const mapped: District[] = (data || []).map(d => ({
                    id: d.id,
                    name: d.name,
                    code: "",
                    leader: "",
                    state: "",
                    region: "",
                    group_id: groupId,
                }))
                setApiDistricts(mapped)
                setApiError("")
            } catch {
                setApiDistricts([])
                setApiError("Failed to load districts")
            } finally {
                setApiLoading(false)
            }
        }
        fetchDistricts()
    }, [groupId])

    

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
        const roles = user?.roles || []
        const isSuperAdmin = roles.includes("Super Admin")
        if (isSuperAdmin) {
            return apiDistricts || []
        }
        if (isGroupAdminEffective) {
            const sId = typeof stateId === "number" ? stateId : undefined
            const rId = typeof regionId === "number" ? regionId : undefined
            const ogId = typeof oldGroupId === "number" ? oldGroupId : undefined
            const gId = typeof groupId === "number" ? groupId : undefined
            const noScopeIds = sId == null && rId == null && ogId == null && gId == null
            if (noScopeIds) return []
            const source = apiDistricts || []
            return source.filter((d) => {
                const stateMatch = sId != null && d.state_id != null ? d.state_id === sId : true
                const regionMatch = rId != null && d.region_id != null ? d.region_id === rId : true
                const oldGroupMatch = ogId != null && d.old_group_id != null ? d.old_group_id === ogId : true
                const groupMatch = gId != null ? d.group_id === gId : true
                return stateMatch && regionMatch && oldGroupMatch && groupMatch
            })
        }
        return apiDistricts || []
    }, [user?.roles, isGroupAdminEffective, stateId, regionId, oldGroupId, groupId, apiDistricts])

    const districts: District[] = effectiveDistricts
    const shouldShowLoading = apiLoading

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const filteredItems = useMemo(() => {
        if (!districts || districts.length === 0) return []
        return districts
            .filter((district) => district.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((district) => ({ label: district.name, value: String(district.id) }))
    }, [districts, inputValue])

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
            return districts.find(d => d.id === value)?.name || ""
        }
        return ""
    }, [districts, value])
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
            <Combobox.Label>District Name
                <Field.RequiredIndicator />
            </Combobox.Label>
            <Combobox.Control>
                <Combobox.Input
                    rounded="xl"
                    placeholder={shouldShowLoading ? "Loading districts..." : (apiError ? apiError : "Select district")}
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
                    ) : apiError ? (
                        <Combobox.Empty>{apiError}</Combobox.Empty>
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
