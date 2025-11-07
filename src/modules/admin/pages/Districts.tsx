// components/districts/DistrictsPage.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router"
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
    Card,
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
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add, ArrowLeft3, ArrowRight3, Copy, DocumentDownload, DocumentText, Edit, More, ReceiptText, SearchNormal1, Trash } from "iconsax-reactjs"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import UploadDistrictsFromFile from "../components/PortingFile"
import NaijaStates from 'naija-state-local-government'
import { districtSchema, type DistrictFormData } from "../schemas/districts.schema"
import { type District, useDistrictsStore } from "../stores/districts.store"
import { copyDistrictsToClipboard, exportDistrictsToExcel, exportDistrictsToCSV, exportDistrictsToPDF } from "@/utils/districts.utils"

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

// Bulk Edit Dialog Component
interface BulkEditDialogProps {
    isOpen: boolean
    selectedDistricts: number[]
    districts: District[]
    onClose: () => void
    onUpdate: (id: number, data: Partial<DistrictFormData>) => void
}

const BulkEditDialog = ({ isOpen, selectedDistricts, districts, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; district: District; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && selectedDistricts.length > 0) {
            const initialTabs = selectedDistricts.map(districtId => {
                const district = districts.find(d => d.id === districtId)
                return {
                    id: uuid(),
                    district: district!,
                    title: district?.districtName || 'District'
                }
            })
            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedDistricts, districts])

    const removeTab = (id: string) => {
        if (tabs.length > 1) {
            const newTabs = tabs.filter(tab => tab.id !== id)
            setTabs(newTabs)

            if (selectedTab === id) {
                setSelectedTab(newTabs[0]?.id || null)
            }
        } else {
            onClose()
        }
    }

    const handleTabUpdate = (tabId: string, data: Partial<DistrictFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.district.id, data)
            removeTab(tabId)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW="4xl" w="full">
                        <Dialog.Header>
                            <Dialog.Title>Update Districts</Dialog.Title>
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
                                            <DistrictEditForm
                                                district={tab.district}
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
    selectedDistricts: number[]
    districts: District[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedDistricts, districts, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedDistrictNames = districts
        .filter(district => selectedDistricts.includes(district.id))
        .map(district => district.districtName)

    const handleConfirm = () => {
        onConfirm(selectedDistricts)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple Districts</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedDistricts.length} district(s)</strong>?
                                    This action cannot be undone.
                                </Text>

                                {selectedDistrictNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">Districts to be deleted:</Text>
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
                                                {selectedDistrictNames.map((name, index) => (
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
                                Delete {selectedDistricts.length} District{selectedDistricts.length > 1 ? 's' : ''}
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

// Individual District Edit Form
interface DistrictEditFormProps {
    district: District
    onUpdate: (data: Partial<DistrictFormData>) => void
    onCancel: () => void
}

const DistrictEditForm = ({ district, onUpdate, onCancel }: DistrictEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            stateName: district.stateName,
            regionName: district.regionName,
            oldGroupName: district.oldGroupName,
            groupName: district.groupName,
            districtName: district.districtName,
            leader: district.leader
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

    const onSubmit = (data: DistrictFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{district.districtName}</strong>
            </Text>

            <form id={`district-form-${district.id}`} onSubmit={handleSubmit(onSubmit)}>
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
                        <Field.Label>Old-group Name</Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter old group name (optional)"
                            {...register('oldGroupName')}
                        />
                        <Field.ErrorText>{errors.oldGroupName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.groupName}>
                        <Field.Label>Group Name
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter group name"
                            {...register('groupName')}
                        />
                        <Field.ErrorText>{errors.groupName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.districtName}>
                        <Field.Label>District Name
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter district name"
                            {...register('districtName')}
                        />
                        <Field.ErrorText>{errors.districtName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.leader}>
                        <Field.Label>District Leader
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter district leader name"
                            {...register('leader')}
                        />
                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                    </Field.Root>
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
                    form={`district-form-${district.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export const Districts: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Districts Data | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage districts data"
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

export default Districts;

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof District>('districtName')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedDistricts, setSelectedDistricts] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const { districts, addDistrict, updateDistrict, deleteDistrict } = useDistrictsStore()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        district?: District
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        district?: District
    }>({ isOpen: false })

    // Filter and sort districts
    const filteredAndSortedDistricts = useMemo(() => {
        let filtered = districts.filter(district =>
            district.districtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.oldGroupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (district.leader && district.leader.toLowerCase().includes(searchQuery.toLowerCase()))
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
    }, [districts, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedDistricts.length / pageSize)
    const paginatedDistricts = filteredAndSortedDistricts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedDistricts.map(district => district.id)
    const allIds = filteredAndSortedDistricts.map(district => district.id)

    const isAllSelectedOnPage = paginatedDistricts.length > 0 &&
        paginatedDistricts.every(district => selectedDistricts.includes(district.id))

    const isAllSelected = filteredAndSortedDistricts.length > 0 &&
        filteredAndSortedDistricts.every(district => selectedDistricts.includes(district.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedDistricts(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedDistricts(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedDistricts([])
        } else {
            setSelectedDistricts(allIds)
        }
    }

    const handleSelectDistrict = (districtId: number) => {
        setSelectedDistricts(prev =>
            prev.includes(districtId)
                ? prev.filter(id => id !== districtId)
                : [...prev, districtId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof District) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteDistrict = (district: District) => {
        setDeleteDialogState({ isOpen: true, district })
    }

    const confirmDelete = () => {
        if (deleteDialogState.district) {
            deleteDistrict(deleteDialogState.district.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteDistrict(id))
        setSelectedDistricts([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: Partial<DistrictFormData>) => {
        updateDistrict(id, data)
        setSelectedDistricts(prev => prev.filter(districtId => districtId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        if (selectedDistricts.length === 0) {
            setIsActionBarOpen(false)
        }
    }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedDistricts.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedDistricts.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedDistricts, isActionBarOpen])

    return (
        <>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Flex
                    justify="space-between"
                    align="center"
                    pos="sticky"
                    top={6}
                    zIndex={"sticky"}
                    backdropFilter={"blur(20px)"}
                >
                    <HStack>
                        <Heading size="3xl">Districts Data</Heading>
                        <Badge colorPalette={"accent"}>{districts.length}</Badge>
                    </HStack>

                    <HStack gap="4">
                        <UploadDistrictsFromFile />
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            onClick={() => setDialogState({ isOpen: true, mode: 'add' })}
                        >
                            <Add />
                            Add District
                        </Button>
                    </HStack>
                </Flex>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Export Buttons */}
                            <HStack justify="space-between" w="full">
                                <HStack>
                                    <Button
                                        rounded="xl"
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        onClick={async () => await copyDistrictsToClipboard(districts)}
                                    >
                                        <Copy />
                                        Copy
                                    </Button>
                                    <Button
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        rounded="xl"
                                        onClick={() => exportDistrictsToExcel(districts)}
                                    >
                                        <DocumentDownload />
                                        Excel
                                    </Button>
                                    <Button
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        rounded="xl"
                                        onClick={() => exportDistrictsToCSV(districts)}
                                    >
                                        <DocumentText />
                                        CSV
                                    </Button>
                                    <Button
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        rounded="xl"
                                        onClick={() => exportDistrictsToPDF(districts)}
                                    >
                                        <ReceiptText />
                                        PDF
                                    </Button>
                                </HStack>

                                {/* Search */}
                                <InputGroup bg="whiteAlpha.600" maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                                    <Input
                                        rounded="xl"
                                        placeholder="Search districts..."
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </InputGroup>
                            </HStack>

                            {/* Table */}
                            <Table.ScrollArea borderWidth="1px" maxW="full" w="full" rounded="xl">
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
                                                onClick={() => handleSort('districtName')}
                                            >
                                                District Name {sortField === 'districtName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('groupName')}
                                            >
                                                Group Name {sortField === 'groupName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('leader')}
                                            >
                                                District Leader {sortField === 'leader' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                textAlign="center">
                                                Action
                                            </Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {paginatedDistricts.map((district) => (
                                            <Table.Row key={district.id} bg="whiteAlpha.500">
                                                <Table.Cell>
                                                    <Checkbox.Root
                                                        colorPalette={"accent"}
                                                        checked={selectedDistricts.includes(district.id)}
                                                        onCheckedChange={() => handleSelectDistrict(district.id)}
                                                    >
                                                        <Checkbox.HiddenInput />
                                                        <Checkbox.Control cursor="pointer" rounded="md" />
                                                    </Checkbox.Root>
                                                </Table.Cell>
                                                <Table.Cell>{district.id}</Table.Cell>
                                                <Table.Cell fontWeight="medium">{district.districtName}</Table.Cell>
                                                <Table.Cell fontWeight="medium">{district.groupName}</Table.Cell>
                                                <Table.Cell>{district.leader || '-'}</Table.Cell>
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
                                                                            district,
                                                                            mode: 'edit'
                                                                        })}
                                                                    >
                                                                        <Edit /> Edit
                                                                    </Menu.Item>
                                                                    <Menu.Item
                                                                        color="red"
                                                                        value="delete"
                                                                        colorPalette="red"
                                                                        onClick={() => handleDeleteDistrict(district)}
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
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* Action Bar for selected items */}
            <ActionBar.Root
                open={isActionBarOpen}
                onOpenChange={(s) => {
                    setIsActionBarOpen(s.open)
                    if (!s.open) {
                        setSelectedDistricts([]);
                    }
                }}
                closeOnInteractOutside={false}
            >
                <ActionBar.Positioner>
                    <ActionBar.Content rounded="xl" shadow="2xl">
                        <ActionBar.SelectionTrigger>
                            {selectedDistricts.length} selected
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
            </ActionBar.Root>

            <Box>
                {/* Add/Edit Dialog */}
                <DistrictDialog
                    {...dialogState}
                    onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                    onSave={(data) => {
                        if (dialogState.mode === 'add') {
                            addDistrict(data)
                        } else if (dialogState.district) {
                            updateDistrict(dialogState.district.id, data)
                        }
                        setDialogState({ isOpen: false, mode: 'add' })
                    }}
                />

                {/* Single Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={deleteDialogState.isOpen}
                    district={deleteDialogState.district}
                    onClose={() => setDeleteDialogState({ isOpen: false })}
                    onConfirm={confirmDelete}
                />

                {/* Bulk Delete Dialog */}
                <BulkDeleteDialog
                    isOpen={isBulkDeleteOpen}
                    selectedDistricts={selectedDistricts}
                    districts={districts}
                    onClose={() => setIsBulkDeleteOpen(false)}
                    onConfirm={confirmBulkDelete}
                />

                {/* Bulk Edit Dialog */}
                <BulkEditDialog
                    isOpen={isBulkEditOpen}
                    selectedDistricts={selectedDistricts}
                    districts={districts}
                    onClose={handleBulkEditClose}
                    onUpdate={handleBulkUpdate}
                />
            </Box >
        </>
    )
}

// Delete Confirmation Dialog Component
interface DeleteConfirmationDialogProps {
    isOpen: boolean
    district?: District
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationDialog = ({ isOpen, district, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete District</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Are you sure you want to delete <strong>{district?.districtName}</strong>?
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

// District Form Dialog Component
interface DistrictDialogProps {
    isOpen: boolean
    district?: District
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: DistrictFormData) => void
}

const DistrictDialog = ({ isOpen, district, mode, onClose, onSave }: DistrictDialogProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            stateName: district?.stateName || '',
            regionName: district?.regionName || '',
            oldGroupName: district?.oldGroupName || '',
            groupName: district?.groupName || '',
            districtName: district?.districtName || '',
            leader: district?.leader || ''
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

    const onSubmit = (data: DistrictFormData) => {
        onSave(data)
        reset()
    }

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => {
                if (!e.open) {
                    onClose()
                    reset();
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add District' : 'Update District'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="district-form" onSubmit={handleSubmit(onSubmit)}>
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
                                        <Field.Label>Old-group Name</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter old group name (optional)"
                                            {...register('oldGroupName')}
                                        />
                                        <Field.ErrorText>{errors.oldGroupName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.groupName}>
                                        <Field.Label>Group Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter group name"
                                            {...register('groupName')}
                                        />
                                        <Field.ErrorText>{errors.groupName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.districtName}>
                                        <Field.Label>District Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district name"
                                            {...register('districtName')}
                                        />
                                        <Field.ErrorText>{errors.districtName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.leader}>
                                        <Field.Label>District Leader
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district leader name"
                                            {...register('leader')}
                                        />
                                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                    </Field.Root>
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button rounded="xl" type="submit" form="district-form" colorPalette="accent">
                                {mode === 'add' ? 'Add District' : 'Update District'}
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