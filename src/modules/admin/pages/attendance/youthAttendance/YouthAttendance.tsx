// components/youth-attendance/YouthAttendancePage.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
    Box,
    Heading,
    HStack,
    VStack,
    Button,
    Input,
    InputGroup, Table,
    IconButton,
    Menu,
    Portal, Dialog,
    CloseButton,
    Field,
    Flex, Pagination,
    ButtonGroup,
    Checkbox,
    ActionBar,
    Tabs,
    Text,
    Badge,
    Combobox,
    Spinner,
    useListCollection,
    NumberInput,
    Drawer,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add, ArrowLeft3, ArrowRight3, Copy, DocumentDownload, DocumentText, Edit, More, MoreSquare, ReceiptText, SearchNormal1, Trash } from "iconsax-reactjs"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import NaijaStates from 'naija-state-local-government'

import { youthAttendanceLocalSchema, type YouthAttendanceLocalFormData } from "@/modules/admin/schemas/youthMinistry/youthAttendanceLocal.schema"
import { useYouthAttendance, useCreateYouthAttendance, useUpdateYouthAttendance, useDeleteYouthAttendance } from "@/modules/admin/hooks/useYouthAttendance"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { YouthAttendanceDialog } from "./components/YouthAttendanceDialog"
import { copyYouthAttendanceToClipboard, exportYouthAttendanceToExcel, exportYouthAttendanceToCSV, exportYouthAttendanceToPDF } from "@/utils/youthMinistry/youthAttendance.utils"
import type { YouthAttendance } from "@/types/youthAttendance.type"
import { Toaster } from "@/components/ui/toaster"
import { useStates } from "@/modules/admin/hooks/useState"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { useRegions } from "@/modules/admin/hooks/useRegion"

// UUID generator function
const uuid = () => {
    return Math.random().toString(36).substring(2, 15)
}

// Get all Nigerian states
const nigerianStates = NaijaStates.states()

// Get LGAs for a state
const getLgasForState = (stateName: string) => {
    try {
        return NaijaStates.lgas(stateName);
    } catch (error) {
        return [];
    }
}

// Months array
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Years array (last 10 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

// State Combobox Component
const StateCombobox = ({ value, onChange, invalid = false }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
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
            collection={collection}
            value={value ? [value] : []}
            onValueChange={handleValueChange}
            onInputValueChange={(e) => setInputValue(e.inputValue)}
            invalid={invalid}
        >
            <Combobox.Label>State</Combobox.Label>
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

// LGA Combobox Component
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
        set(lgaItems)
        setIsLoading(false)
    }, [stateName, set])

    // Filter LGAs based on input
    useEffect(() => {
        if (!stateName) return

        const filtered = getLgasForState(stateName)?.lgas
            .filter(lga => lga.toLowerCase().includes(inputValue.toLowerCase()))
            .map(lga => ({ label: lga, value: lga }))

        set(filtered)
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
            <Combobox.Label>Select Region (LGA)</Combobox.Label>
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

// Month Combobox Component
const MonthCombobox = ({ value, onChange, invalid = false }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
}) => {
    const { collection } = useListCollection({
        initialItems: months.map(month => ({ label: month, value: month })) as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

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
            invalid={invalid}
        >
            <Combobox.Label>Month</Combobox.Label>
            <Combobox.Control>
                <Combobox.Input rounded="xl" placeholder="Select month" />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {collection.items.map((item) => (
                        <Combobox.Item key={item.value} item={item}>
                            {item.label}
                            <Combobox.ItemIndicator />
                        </Combobox.Item>
                    ))}
                </Combobox.Content>
            </Combobox.Positioner>
        </Combobox.Root>
    )
}

// Year Combobox Component
const YearCombobox = ({ value, onChange, invalid = false }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
}) => {
    const { collection } = useListCollection({
        initialItems: years.map(year => ({ label: year, value: year })) as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

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
            invalid={invalid}
        >
            <Combobox.Label>Year</Combobox.Label>
            <Combobox.Control>
                <Combobox.Input rounded="xl" placeholder="Select year" />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {collection.items.map((item) => (
                        <Combobox.Item key={item.value} item={item}>
                            {item.label}
                            <Combobox.ItemIndicator />
                        </Combobox.Item>
                    ))}
                </Combobox.Content>
            </Combobox.Positioner>
        </Combobox.Root>
    )
}

// Bulk Edit Dialog Component
interface BulkEditDialogProps {
    isOpen: boolean
    selectedAttendance: number[]
    youthAttendance: YouthAttendance[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<YouthAttendanceLocalFormData>) => void
}

const BulkEditDialog = ({ isOpen, selectedAttendance, youthAttendance, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; attendance: YouthAttendance; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && selectedAttendance.length > 0) {
            const initialTabs = selectedAttendance.map(attendanceId => {
                const attendance = youthAttendance.find(a => a.id === attendanceId)
                return {
                    id: uuid(),
                    attendance: attendance!,
                    title: attendance?.group_id || 'Attendance'
                }
            })
            setTabs(initialTabs as any)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedAttendance, youthAttendance])

    const removeTab = (id: string) => {
        if (tabs.length > 1) {
            const newTabs = tabs.filter(tab => tab.id !== id) as any
            setTabs(newTabs)

            if (selectedTab === id) {
                setSelectedTab(newTabs[0]?.id || null)
            }
        } else {
            onClose()
        }
    }

    const handleTabUpdate = (tabId: string, data: Partial<YouthAttendanceLocalFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.attendance.id, data)
            removeTab(tabId)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW={{ base: "sm", md: "md", lg: "3xl" }} w="full">
                        <Dialog.Header>
                            <Dialog.Title>Update Youth Attendance</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Tabs.Root
                                value={selectedTab}
                                variant="outline"
                                size="sm"
                                onValueChange={(e) => setSelectedTab(e.value)}
                            >
                                <Tabs.List flex="1 1 auto" overflowX="auto">
                                    {tabs.map((tab) => (
                                        <Tabs.Trigger value={tab.id} key={tab.id}>
                                            {tab.title}{" "}
                                            <CloseButton
                                                as="span"
                                                role="button"
                                                size="2xs"
                                                me="-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeTab(tab.id)
                                                }}
                                            />
                                        </Tabs.Trigger>
                                    ))}
                                </Tabs.List>

                                <Tabs.ContentGroup>
                                    {tabs.map((tab) => (
                                        <Tabs.Content value={tab.id} key={tab.id}>
                                            <YouthAttendanceEditForm
                                                attendance={tab.attendance}
                                                onUpdate={(data) => handleTabUpdate(tab.id, data)}
                                                onCancel={() => removeTab(tab.id)}
                                            />
                                        </Tabs.Content>
                                    ))}
                                </Tabs.ContentGroup>
                            </Tabs.Root>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Close</Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

// Bulk Delete Dialog Component
interface BulkDeleteDialogProps {
    isOpen: boolean
    selectedAttendance: number[]
    youthAttendance: YouthAttendance[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedAttendance, youthAttendance, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedAttendanceNames = youthAttendance
        .filter(attendance => selectedAttendance.includes(attendance.id))
        .map(attendance => `${attendance.group_id} - ${attendance.month} ${attendance.year}`)

    const handleConfirm = () => {
        onConfirm(selectedAttendance)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW={{ base: "sm", md: "md", lg: "3xl" }} rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple Attendance Records</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedAttendance.length} attendance record(s)</strong>?
                                    This action cannot be undone.
                                </Text>

                                {selectedAttendanceNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Records to be deleted:</Text>
                                        <Box
                                            maxH="200px"
                                            overflowY="auto"
                                            border="1px"
                                            borderColor="gray.200"
                                            rounded="md"
                                            p="3"
                                            bg="gray.50"
                                        >
                                            <VStack align="start" gap="1">
                                                {selectedAttendanceNames.map((name, index) => (
                                                    <Text key={index} fontSize="sm">• {name}</Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    </Box>
                                )}
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" rounded="xl" onClick={handleConfirm}>
                                Delete {selectedAttendance.length} Record{selectedAttendance.length > 1 ? 's' : ''}
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

// Individual Youth Attendance Edit Form
interface YouthAttendanceEditFormProps {
    attendance: YouthAttendance
    onUpdate: (data: Partial<YouthAttendanceLocalFormData>) => void
    onCancel: () => void
}

const YouthAttendanceEditForm = ({ attendance, onUpdate, onCancel }: YouthAttendanceEditFormProps) => {
    const { states } = useStates();
    const { regions } = useRegions();
    const { oldGroups } = useOldGroups()
    const { groups } = useGroups()
    const { districts } = useDistricts();

    const stateName = states.find(s => s.id == attendance.state_id)?.name || ""
    const regionName = regions.find(r => r.id == attendance.region_id)?.name || ""
    const districtName = districts.find(d => d.id == attendance.district_id)?.name || ""
    const oldGroupName = oldGroups.find(g => g.id == attendance.old_group_id)?.name || ""
    const groupName = groups.find(g => g.id == attendance.group_id)?.name || ""


    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<YouthAttendanceLocalFormData>({
        resolver: zodResolver(youthAttendanceLocalSchema),
        defaultValues: {
            stateName: stateName,
            regionName: regionName,
            oldGroupName: oldGroupName,
            groupName: groupName,
            month: attendance.month.toString(),
            year: attendance.year.toString(),
            yhsfMale: attendance.member_boys,
            yhsfFemale: attendance.member_girls
        }
    })

    const currentStateName = watch('stateName')

    const handleStateChange = (value: string) => {
        setValue('stateName', value)
        // Clear LGA when state changes
        setValue('regionName', '')
    }

    const handleLGAChange = (value: string) => {
        setValue('regionName', value)
    }

    const handleMonthChange = (value: string) => {
        setValue('month', value)
    }

    const handleYearChange = (value: string) => {
        setValue('year', value)
    }

    const onSubmit = (data: YouthAttendanceLocalFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{groupName} - {attendance.month} {attendance.year}</strong>
            </Text>

            <form id={`attendance-form-${attendance.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <Field.Root required invalid={!!errors.stateName}>
                        <StateCombobox
                            value={currentStateName}
                            onChange={handleStateChange}
                            required
                            invalid={!!errors.stateName}
                        />
                        <Field.ErrorText>{errors.stateName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.regionName}>
                        <LGACombobox
                            stateName={currentStateName}
                            value={watch('regionName')}
                            onChange={handleLGAChange}
                            required
                            invalid={!!errors.regionName}
                        />
                        <Field.ErrorText>{errors.regionName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.oldGroupName}>
                        <Field.Label>Select Old Group</Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter old group name (optional)"
                            {...register('oldGroupName')}
                        />
                        <Field.ErrorText>{errors.oldGroupName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.groupName}>
                        <Field.Label>Select Group
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter group name"
                            {...register('groupName')}
                        />
                        <Field.ErrorText>{errors.groupName?.message}</Field.ErrorText>
                    </Field.Root>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.month} flex="1">
                            <MonthCombobox
                                value={watch('month')}
                                onChange={handleMonthChange}
                                required
                                invalid={!!errors.month}
                            />
                            <Field.ErrorText>{errors.month?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.year} flex="1">
                            <YearCombobox
                                value={watch('year')}
                                onChange={handleYearChange}
                                required
                                invalid={!!errors.year}
                            />
                            <Field.ErrorText>{errors.year?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>

                    <HStack gap="4" w="full">
                        <Field.Root required invalid={!!errors.yhsfMale} flex="1">
                            <Field.Label>Enter YHSF Male
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={watch('yhsfMale').toString()}
                                onValueChange={(e) => setValue('yhsfMale', e.valueAsNumber)}
                            >
                                <NumberInput.Input
                                    rounded="lg"
                                    placeholder="Enter YHSF Male count"
                                />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.yhsfMale?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root required invalid={!!errors.yhsfFemale} flex="1">
                            <Field.Label>Enter YHSF Female
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <NumberInput.Root
                                min={0}
                                value={watch('yhsfFemale').toString()}
                                onValueChange={(e) => setValue('yhsfFemale', e.valueAsNumber)}
                            >
                                <NumberInput.Input
                                    rounded="lg"
                                    placeholder="Enter YHSF Female count"
                                />
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.yhsfFemale?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>
                </VStack>
            </form>

            <HStack justify="flex-end" gap="2" mt="4">
                <Button rounded="xl" variant="outline" size="sm" onClick={onCancel}>
                    Skip
                </Button>
                <Button
                    rounded="xl"
                    size="sm"
                    colorPalette="accent"
                    type="submit"
                    form={`attendance-form-${attendance.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export const YouthAttendancePage: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Youth Attendance Data | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage youth attendance data"
            />
            <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary, error }) => (
                    <ErrorFallback {...{ resetErrorBoundary, error }} />
                )}
            >
                <Content />
            </ErrorBoundary>
        </>
    );
};

export default YouthAttendancePage;

type DisplayAttendance = {
    id: number
    groupName: string
    month: string
    yhsfMale: number
    yhsfFemale: number
    attendance_type: 'weekly' | 'revival'
}

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof YouthAttendance>('groupName')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedAttendance, setSelectedAttendance] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
    const navigate = useNavigate();

    const { data: weeklyRes } = useYouthAttendance({ attendance_type: 'weekly' })
    const { data: revivalRes } = useYouthAttendance({ attendance_type: 'revival' })
    const weekly = weeklyRes?.data ?? []
    const revival = revivalRes?.data ?? []

    const { groups } = useGroups()

    const normalizedAttendance: DisplayAttendance[] = useMemo(() => {
        const getGroupNameById = (id?: number | null) => {
            if (!id) return ''
            return groups?.find(g => g.id === id)?.name || `Group #${id}`
        }
        const weeklyRows = weekly.map(att => ({
            id: att.id,
            groupName: getGroupNameById(att.group_id),
            month: att.month,
            yhsfMale: (att.member_boys || 0) + (att.visitor_boys || 0),
            yhsfFemale: (att.member_girls || 0) + (att.visitor_girls || 0),
            attendance_type: 'weekly' as const,
        }))
        const revivalRows = revival.map(att => ({
            id: att.id,
            groupName: getGroupNameById(att.group_id),
            month: att.month,
            yhsfMale: att.male || 0,
            yhsfFemale: att.female || 0,
            attendance_type: 'revival' as const,
        }))
        return [...weeklyRows, ...revivalRows]
    }, [weekly, revival, groups])

    const allAttendance = useMemo(() => [...weekly, ...revival], [weekly, revival])

    const { mutate: createYA } = useCreateYouthAttendance()
    const { mutate: updateYA } = useUpdateYouthAttendance()
    const { mutate: deleteYA } = useDeleteYouthAttendance()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        attendance?: YouthAttendance
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        attendance?: YouthAttendance
    }>({ isOpen: false })

    // Filter and sort youth attendance
    const filteredAndSortedAttendance = useMemo(() => {
        let filtered = normalizedAttendance.filter(attendance =>
            attendance.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attendance.yhsfMale.toString().includes(searchQuery.toLowerCase()) ||
            attendance.yhsfFemale.toString().includes(searchQuery.toLowerCase())
        )

        // Sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            // Safely handle undefined/null values
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sortOrder === 'asc' ? -1 : 1
            if (bValue == null) return sortOrder === 'asc' ? 1 : -1

            const aStr = String(aValue).toLowerCase()
            const bStr = String(bValue).toLowerCase()

            if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1
            if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [normalizedAttendance, searchQuery, sortField, sortOrder])

    const filteredFullAttendance = useMemo(() => {
        const visibleIds = new Set(filteredAndSortedAttendance.map(a => a.id))
        return allAttendance.filter(a => visibleIds.has(a.id))
    }, [allAttendance, filteredAndSortedAttendance])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedAttendance.length / pageSize)
    const paginatedAttendance = filteredAndSortedAttendance.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedAttendance.map(attendance => attendance.id)
    const allIds = filteredAndSortedAttendance.map(attendance => attendance.id)

    const isAllSelectedOnPage = paginatedAttendance.length > 0 &&
        paginatedAttendance.every(attendance => selectedAttendance.includes(attendance.id))

    const isAllSelected = filteredAndSortedAttendance.length > 0 &&
        filteredAndSortedAttendance.every(attendance => selectedAttendance.includes(attendance.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedAttendance(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedAttendance(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedAttendance([])
        } else {
            setSelectedAttendance(allIds)
        }
    }

    const handleSelectAttendance = (attendanceId: number) => {
        setSelectedAttendance(prev =>
            prev.includes(attendanceId)
                ? prev.filter(id => id !== attendanceId)
                : [...prev, attendanceId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof YouthAttendance) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteAttendance = (attendance: DisplayAttendance) => {
        const fullAttendance = allAttendance.find(a => a.id === attendance.id)
        if (fullAttendance) {
            setDeleteDialogState({ isOpen: true, attendance: fullAttendance })
        }
    }

    const confirmDelete = () => {
        if (deleteDialogState.attendance) {
            deleteYA(deleteDialogState.attendance.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteYA(id))
        setSelectedAttendance([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => { }
    const handleBulkUpdate = (id: number, data: Partial<YouthAttendanceLocalFormData>) => { }
    const handleBulkEditClose = () => { }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedAttendance.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedAttendance.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedAttendance, isActionBarOpen])

    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <HStack justify={"space-between"}>
                    <HStack>
                        <IconButton size="sm" rounded="xl" colorPalette={"accent"} onClick={() => navigate(-1)}>
                            <ArrowLeft3 />
                        </IconButton>
                        <HStack>
                            <Heading size={{ base: "2xl", md: "3xl" }}>Youth Attendance Data</Heading>
                            <Badge colorPalette={"accent"}>{normalizedAttendance.length}</Badge>
                        </HStack>
                    </HStack>

                    <Button
                        hideBelow={"md"}
                        colorPalette={"accent"}
                        rounded="xl"
                        onClick={() => setDialogState({ isOpen: true, mode: 'add' })}
                    >
                        <Add />
                        Add Attendance
                    </Button>

                    {/* Mobile Drawer - only on mobile */}
                    <Drawer.Root placement="bottom" size="full">
                        <Drawer.Trigger asChild>
                            <IconButton
                                aria-label="More options"
                                variant="ghost"
                                rounded="xl"
                                size="md"
                                hideFrom={"md"}
                            >
                                <MoreSquare variant="Outline" />
                            </IconButton>
                        </Drawer.Trigger>
                        <Portal>
                            <Drawer.Backdrop />
                            <Drawer.Positioner>
                                <Drawer.Content h='fit' bg="bg" borderTopRadius="xl">
                                    <Drawer.Header p={4} borderBottom="1px solid" borderColor="border">
                                        <Flex justify="space-between" align="center">
                                            <Heading size="lg">Actions</Heading>
                                            <Drawer.CloseTrigger asChild>
                                                <IconButton
                                                    aria-label="Close drawer"
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <CloseButton />
                                                </IconButton>
                                            </Drawer.CloseTrigger>
                                        </Flex>
                                    </Drawer.Header>
                                    <Drawer.Body p={4}>
                                        <VStack gap={4} align="stretch">
                                            <Button
                                                colorPalette={"accent"}
                                                rounded="xl"
                                                size="lg"
                                                w="full"
                                                onClick={() => setDialogState({ isOpen: true, mode: 'add' })}
                                            >
                                                <Add />
                                                Add Attendance
                                            </Button>

                                            {/* Export Button */}
                                            <VStack gap={3} align="stretch">
                                                <Heading size="sm" color="fg.muted">Export Data</Heading>
                                                <Button
                                                    rounded="xl"
                                                    variant="solid"
                                                    bg="bg"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    color="accent"
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    onClick={async () => await copyYouthAttendanceToClipboard(filteredFullAttendance as any[])}
                                                >
                                                    <DocumentDownload />
                                                    Copy
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    bg="bg"
                                                    color="accent"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    rounded="xl"
                                                    onClick={() => exportYouthAttendanceToExcel(filteredFullAttendance as any[])}
                                                >
                                                    <DocumentDownload />
                                                    Excel
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    bg="bg"
                                                    color="accent"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    rounded="xl"
                                                    onClick={() => exportYouthAttendanceToCSV(filteredFullAttendance as any[])}
                                                >
                                                    <DocumentDownload />
                                                    CSV
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    bg="bg"
                                                    color="accent"
                                                    w={{ base: "full", md: "auto" }}
                                                    justifyContent={{ base: "start", md: "center" }}
                                                    _hover={{ bg: "bg.muted" }}
                                                    size="sm"
                                                    rounded="xl"
                                                    onClick={() => exportYouthAttendanceToPDF(filteredFullAttendance as any[])}
                                                >
                                                    <DocumentDownload />
                                                    PDF
                                                </Button>
                                            </VStack>
                                        </VStack>
                                    </Drawer.Body>
                                </Drawer.Content>
                            </Drawer.Positioner>
                        </Portal>
                    </Drawer.Root>

                </HStack>

                {/* Export Buttons */}
                <HStack justify="space-between" w="full">
                    {/* Search */}
                    <InputGroup colorPalette={"accent"} startElement={<SearchNormal1 />}>
                        <Input
                            bg="bg"
                            rounded="xl"
                            placeholder="Search attendance..."
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </InputGroup>

                    <HStack hideBelow={"md"}>
                        <Button
                            rounded="xl"
                            variant="solid"
                            bg="bg"
                            color="accent"
                            size="sm"
                            onClick={async () => await copyYouthAttendanceToClipboard(normalizedAttendance as any[])}
                        >
                            <Copy />
                            Copy
                        </Button>
                        <Button
                            variant="solid"
                            bg="bg"
                            color="accent"
                            size="sm"
                            rounded="xl"
                            onClick={() => exportYouthAttendanceToExcel(normalizedAttendance as any[])}
                        >
                            <DocumentDownload />
                            Excel
                        </Button>
                        <Button
                            variant="solid"
                            bg="bg"
                            color="accent"
                            size="sm"
                            rounded="xl"
                            onClick={() => exportYouthAttendanceToCSV(normalizedAttendance as any[])}
                        >
                            <DocumentText />
                            CSV
                        </Button>
                        <Button
                            variant="solid"
                            bg="bg"
                            color="accent"
                            size="sm"
                            rounded="xl"
                            onClick={() => exportYouthAttendanceToPDF(normalizedAttendance as any[])}
                        >
                            <ReceiptText />
                            PDF
                        </Button>
                    </HStack>
                </HStack>

                {/* Table */}
                <Table.ScrollArea borderWidth="1px" maxW={{ base: "full", lg: "calc(100vw - 18rem)" }} w="full" rounded="xl">
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row fontSize={"md"}>
                                <Table.ColumnHeader w="50px">
                                    <Checkbox.Root
                                        colorPalette={"accent"}
                                        checked={isAllSelectedOnPage}
                                        onCheckedChange={handleSelectAllOnPage}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control rounded="md" cursor={"pointer"} />
                                    </Checkbox.Root>
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    fontWeight={"bold"}
                                    cursor="pointer"
                                    onClick={() => handleSort('id')}
                                >
                                    S/N {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    fontWeight={"bold"}
                                    cursor="pointer"
                                    onClick={() => handleSort('groupName')}
                                >
                                    Group {sortField === 'groupName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    fontWeight={"bold"}
                                    cursor="pointer"
                                    onClick={() => handleSort('month')}
                                >
                                    Month {sortField === 'month' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    fontWeight={"bold"}
                                    cursor="pointer"
                                    onClick={() => handleSort('yhsfMale')}
                                >
                                    YHSF Male {sortField === 'yhsfMale' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    fontWeight={"bold"}
                                    cursor="pointer"
                                    onClick={() => handleSort('yhsfFemale')}
                                >
                                    YHSF Female {sortField === 'yhsfFemale' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </Table.ColumnHeader>
                                <Table.ColumnHeader
                                    fontWeight={"bold"}
                                    textAlign="center">
                                    Action
                                </Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {paginatedAttendance.map((attendance) => (
                                <Table.Row key={attendance.id} bg="bg">
                                    <Table.Cell>
                                        <Checkbox.Root
                                            colorPalette={"accent"}
                                            checked={selectedAttendance.includes(attendance.id)}
                                            onCheckedChange={() => handleSelectAttendance(attendance.id)}
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control cursor="pointer" rounded="md" />
                                        </Checkbox.Root>
                                    </Table.Cell>
                                    <Table.Cell>{attendance.id}</Table.Cell>
                                    <Table.Cell fontWeight="medium">{attendance.groupName}</Table.Cell>
                                    <Table.Cell fontWeight="medium">{attendance.month}</Table.Cell>
                                    <Table.Cell>{attendance.yhsfMale}</Table.Cell>
                                    <Table.Cell>{attendance.yhsfFemale}</Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <IconButton rounded="xl" variant="ghost" size="sm">
                                                    <More />
                                                </IconButton>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content rounded="lg">
                                                        <Menu.Item
                                                            value="edit"
                                                            onClick={() => setDialogState({
                                                                isOpen: true,
                                                                attendance: attendance as any,
                                                                mode: 'edit'
                                                            })}
                                                        >
                                                            <Edit /> Edit
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            color="red"
                                                            value="delete"
                                                            colorPalette="red"
                                                            onClick={() => handleDeleteAttendance(attendance)}
                                                        >
                                                            <Trash /> Delete
                                                        </Menu.Item>
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination.Root
                        colorPalette={"accent"}
                        count={totalPages}
                        pageSize={1}
                        page={currentPage}
                        onPageChange={(d) => setCurrentPage(d.page)}
                    >
                        <ButtonGroup variant="outline" size="sm">
                            <Pagination.PrevTrigger asChild>
                                <IconButton rounded="xl">
                                    <ArrowLeft3 />
                                </IconButton>
                            </Pagination.PrevTrigger>

                            <Pagination.Items
                                render={(page) => (
                                    <IconButton rounded="xl" variant={{ base: "outline", _selected: "solid" }}>
                                        {page.value}
                                    </IconButton>
                                )}
                            />

                            <Pagination.NextTrigger asChild>
                                <IconButton rounded="xl">
                                    <ArrowRight3 />
                                </IconButton>
                            </Pagination.NextTrigger>
                        </ButtonGroup>
                    </Pagination.Root>
                )}
            </VStack>

            {/* Action Bar for selected items */}
            <ActionBar.Root
                open={isActionBarOpen}
                onOpenChange={(s) => {
                    setIsActionBarOpen(s.open)
                    if (!s.open) {
                        setSelectedAttendance([]);
                    }
                }}
                closeOnInteractOutside={false}
            >
                <ActionBar.Positioner>
                    <ActionBar.Content rounded="xl" shadow="2xl">
                        <ActionBar.SelectionTrigger>
                            {selectedAttendance.length} selected
                        </ActionBar.SelectionTrigger>
                        <ActionBar.Separator />
                        <Button
                            rounded="xl"
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                        <Button
                            variant="outline"
                            rounded="xl"
                            size="sm"
                            onClick={handleBulkEdit}
                        >
                            <Edit />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            rounded="xl"
                            colorPalette="red"
                            onClick={handleBulkDelete}
                        >
                            <Trash />
                            Delete
                        </Button>
                        <ActionBar.CloseTrigger asChild>
                            <CloseButton size="sm" rounded="xl" />
                        </ActionBar.CloseTrigger>
                    </ActionBar.Content>
                </ActionBar.Positioner>
            </ActionBar.Root >

            <Box>
                {/* Add/Edit Dialog */}
                <YouthAttendanceDialog
                    isOpen={dialogState.isOpen}
                    mode={dialogState.mode}
                    attendanceType={dialogState.attendance?.attendance_type || 'weekly'}
                    onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                    onSave={(data) => {
                        if (dialogState.mode === 'add') {
                            createYA(data)
                        } else if (dialogState.attendance) {
                            updateYA({ yaId: dialogState.attendance.id, data })
                        }
                        // setDialogState({ isOpen: false, mode: 'add' })
                    }}
                />

                {/* Single Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={deleteDialogState.isOpen}
                    attendance={deleteDialogState.attendance}
                    onClose={() => setDeleteDialogState({ isOpen: false })}
                    onConfirm={confirmDelete}
                />

                {/* Bulk Delete Dialog */}
                <BulkDeleteDialog
                    isOpen={isBulkDeleteOpen}
                    selectedAttendance={selectedAttendance}
                    youthAttendance={allAttendance}
                    onClose={() => setIsBulkDeleteOpen(false)}
                    onConfirm={confirmBulkDelete}
                />

                {/* Bulk Edit Dialog */}
                <BulkEditDialog
                    isOpen={isBulkEditOpen}
                    selectedAttendance={selectedAttendance}
                    youthAttendance={allAttendance}
                    onClose={() => setIsBulkEditOpen(false)}
                    onUpdate={() => null}
                // onConfirm={confirmBulkEdit}
                />



            </Box >
        </>
    )
}

// Delete Confirmation Dialog Component
interface DeleteConfirmationDialogProps {
    isOpen: boolean
    attendance?: YouthAttendance
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationDialog = ({ isOpen, attendance, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW={{ base: "sm", md: "md", lg: "3xl" }} rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Attendance Record</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Are you sure you want to delete attendance record for <strong>{attendance?.groupName} - {attendance?.month} {attendance?.year}</strong>?
                                This action cannot be undone.
                            </p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" rounded="xl" onClick={onConfirm}>
                                Delete
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

// Youth Attendance Form Dialog Component
interface YouthAttendanceDialogProps {
    isOpen: boolean
    attendance?: YouthAttendance
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: YouthAttendanceLocalFormData) => void
}

// removed local dialog in favor of shared YouthAttendanceDialog component