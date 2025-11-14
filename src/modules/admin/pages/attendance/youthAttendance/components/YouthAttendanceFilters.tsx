// components/YouthAttendanceFilters.tsx
"use client"

import { HStack, Field, Button, Select, useListCollection, Portal } from "@chakra-ui/react"
import { useState } from "react"
import type { YouthAttendanceFilters as YouthAttendanceFiltersType } from "@/types/youthAttendance.type"

interface YouthAttendanceFiltersProps {
    onFilter: (filters: YouthAttendanceFiltersType) => void
    attendanceType: 'weekly' | 'revival'
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

export const YouthAttendanceFilter = ({ onFilter, attendanceType }: YouthAttendanceFiltersProps) => {
    const [year, setYear] = useState<string>('')
    const [month, setMonth] = useState<string>('')

    // collections for Chakra Select
    const { collection: monthsCollection } = useListCollection({
        initialItems: months.map(m => ({ label: m, value: m })),
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const { collection: yearsCollection } = useListCollection({
        initialItems: years.map(y => ({ label: String(y), value: String(y) })),
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    const handleFilter = () => {
        onFilter({
            attendance_type: attendanceType,
            year: year ? parseInt(year) : undefined,
            month: month || undefined,
        })
    }

    const handleReset = () => {
        setYear('')
        setMonth('')
        onFilter({
            attendance_type: attendanceType,
        })
    }

    return (
        <HStack gap="4" flexWrap="wrap">
            <Field.Root flex="1" minW="200px">
                <Field.Label>Month</Field.Label>
                <Select.Root collection={monthsCollection} size="sm">
                    <Select.HiddenSelect value={month} onChange={(e) => setMonth(e.target.value)} />
                    <Select.Control>
                        <Select.Trigger rounded="lg">
                            <Select.ValueText placeholder="All Months" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {monthsCollection.items.map(m => (
                                    <Select.Item item={m} key={m.value}>
                                        {m.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
            </Field.Root>

            <Field.Root flex="1" minW="200px">
                <Field.Label>Year</Field.Label>
                <Select.Root collection={yearsCollection} size="sm">
                    <Select.HiddenSelect value={year} onChange={(e) => setYear(e.target.value)} />
                    <Select.Control>
                        <Select.Trigger rounded="lg">
                            <Select.ValueText placeholder="All Years" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {yearsCollection.items.map(y => (
                                    <Select.Item item={y} key={y.value}>
                                        {y.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
            </Field.Root>

            <HStack pt="6">
                <Button size="sm" colorPalette="accent" onClick={handleFilter}>
                    Filter
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                    Reset
                </Button>
            </HStack>
        </HStack>
    )
}
