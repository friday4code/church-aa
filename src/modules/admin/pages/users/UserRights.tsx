// components/userRights/UserRightsPage.tsx
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
import { copyUserRightsToClipboard, exportUserRightsToExcel, exportUserRightsToCSV, exportUserRightsToPDF } from "@/utils/userRights.utils"
import NaijaStates from 'naija-state-local-government'
import { userRightSchema, type UserRightFormData } from "../../schemas/userRights.scheme"
import { type UserRight, useUserRightsStore } from "../../stores/userRights.store"
import { useUsers } from "../../hooks/useUser"
import type { User } from "@/types/users.type"

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

// User Combobox Component
const UserCombobox = ({ users, value, onChange, invalid = false, isLoading = false }: {
    users: User[];
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
    isLoading?: boolean;
}) => {
    const [inputValue, setInputValue] = useState("")

    const { collection, set } = useListCollection({
        initialItems: [] as { label: string, value: string }[],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
    })

    // Populate and filter users based on input
    useEffect(() => {
        if (!users) {
            set([])
            return
        }

        const filtered = users
            .filter(user => {
                const fullName = user.name?.toLowerCase() || ''
                const email = user.email?.toLowerCase() || ''
                return fullName.includes(inputValue.toLowerCase()) || email.includes(inputValue.toLowerCase())
            })
            .map(user => ({
                label: user.name || user.email || `User ${user.id}`,
                value: user.id.toString()
            }))

        set(filtered)
    }, [inputValue, users, set])

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
            <Combobox.Label>Name</Combobox.Label>
            <Combobox.Control>
                <Combobox.Input rounded="xl" placeholder="Select user" />
                <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Combobox.Positioner>
                <Combobox.Content rounded="xl">
                    {isLoading ? (
                        <Combobox.Empty>Loading users...</Combobox.Empty>
                    ) : collection.items.length === 0 ? (
                        <Combobox.Empty>No users found</Combobox.Empty>
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

// Access Level Combobox Component
const AccessLevelCombobox = ({ value, onChange, invalid = false }: {
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    invalid?: boolean;
}) => {
    const accessLevels = [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Group Admin', value: 'group_admin' },
        { label: 'District Admin', value: 'district_admin' },
        { label: 'Region Admin', value: 'region_admin' },
        { label: 'State Admin', value: 'state_admin' }
    ]

    const { collection } = useListCollection({
        initialItems: accessLevels,
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
            <Combobox.Label>Access Level</Combobox.Label>
            <Combobox.Control>
                <Combobox.Input rounded="xl" placeholder="Select access level" />
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
    selectedUserRights: number[]
    userRights: UserRight[]
    users: User[]
    isUsersLoading: boolean
    onClose: () => void
    onUpdate: (id: number, data: Partial<UserRightFormData>) => void
}

const BulkEditDialog = ({ isOpen, selectedUserRights, userRights, users, isUsersLoading, onClose, onUpdate }: BulkEditDialogProps) => {
    const [tabs, setTabs] = useState<Array<{ id: string; userRight: UserRight; title: string }>>([])
    const [selectedTab, setSelectedTab] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && selectedUserRights.length > 0) {
            const initialTabs = selectedUserRights.map(userRightId => {
                const userRight = userRights.find(ur => ur.id === userRightId)
                return {
                    id: uuid(),
                    userRight: userRight!,
                    title: userRight?.userName || 'User Right'
                }
            })
            setTabs(initialTabs)
            setSelectedTab(initialTabs[0]?.id || null)
        }
    }, [isOpen, selectedUserRights, userRights])

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

    const handleTabUpdate = (tabId: string, data: Partial<UserRightFormData>) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            onUpdate(tab.userRight.id, data)
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
                            <Dialog.Title>Update User Rights</Dialog.Title>
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
                                            <UserRightEditForm
                                                userRight={tab.userRight}
                                                users={users}
                                                isUsersLoading={isUsersLoading}
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
    selectedUserRights: number[]
    userRights: UserRight[]
    onClose: () => void
    onConfirm: (ids: number[]) => void
}

const BulkDeleteDialog = ({ isOpen, selectedUserRights, userRights, onClose, onConfirm }: BulkDeleteDialogProps) => {
    const selectedUserRightNames = userRights
        .filter(userRight => selectedUserRights.includes(userRight.id))
        .map(userRight => userRight.userName)

    const handleConfirm = () => {
        onConfirm(selectedUserRights)
        onClose()
    }

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete Multiple User Rights</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack align="stretch" gap="3">
                                <Text>
                                    Are you sure you want to delete <strong>{selectedUserRights.length} user right(s)</strong>?
                                    This action cannot be undone.
                                </Text>

                                {selectedUserRightNames.length > 0 && (
                                    <Box>
                                        <Text fontWeight="medium" mb="2">User rights to be deleted:</Text>
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
                                                {selectedUserRightNames.map((name, index) => (
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
                                Delete {selectedUserRights.length} User Right{selectedUserRights.length > 1 ? 's' : ''}
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

// Individual User Right Edit Form
interface UserRightEditFormProps {
    userRight: UserRight
    onUpdate: (data: Partial<UserRightFormData>) => void
    onCancel: () => void
}

const UserRightEditForm = ({ userRight, onUpdate, onCancel }: UserRightEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UserRightFormData>({
        resolver: zodResolver(userRightSchema),
        defaultValues: {
            userId: userRight.userId.toString(),
            stateName: userRight.stateName,
            regionName: userRight.regionName,
            groupName: userRight.groupName,
            oldGroupName: userRight.oldGroupName,
            districtName: userRight.districtName,
            accessLevel: userRight.accessLevel
        }
    })

    const currentStateName = watch('stateName')

    const handleStateChange = (value: string) => {
        setValue('stateName', value)
        // Clear dependent fields when state changes
        setValue('regionName', '')
        setValue('groupName', '')
        setValue('districtName', '')
    }

    const handleLGAChange = (value: string) => {
        setValue('regionName', value)
    }

    const handleUserChange = (value: string) => {
        setValue('userId', value)
    }

    const handleAccessLevelChange = (value: string) => {
        setValue('accessLevel', value)
    }

    const onSubmit = (data: UserRightFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{userRight.userName}</strong>
            </Text>

            <form id={`user-right-form-${userRight.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <Field.Root required invalid={!!errors.userId}>
                        <UserCombobox
                            value={watch('userId')}
                            onChange={handleUserChange}
                            required
                            invalid={!!errors.userId}
                        />
                        <Field.ErrorText>{errors.userId?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.accessLevel}>
                        <AccessLevelCombobox
                            value={watch('accessLevel')}
                            onChange={handleAccessLevelChange}
                            required
                            invalid={!!errors.accessLevel}
                        />
                        <Field.ErrorText>{errors.accessLevel?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.stateName}>
                        <StateCombobox
                            value={currentStateName}
                            onChange={handleStateChange}
                            invalid={!!errors.stateName}
                        />
                        <Field.ErrorText>{errors.stateName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.regionName}>
                        <LGACombobox
                            stateName={currentStateName}
                            value={watch('regionName')}
                            onChange={handleLGAChange}
                            invalid={!!errors.regionName}
                        />
                        <Field.ErrorText>{errors.regionName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.groupName}>
                        <Field.Label>Select Group</Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter group name"
                            {...register('groupName')}
                        />
                        <Field.ErrorText>{errors.groupName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.oldGroupName}>
                        <Field.Label>Select Old Group</Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter old group name"
                            {...register('oldGroupName')}
                        />
                        <Field.ErrorText>{errors.oldGroupName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.districtName}>
                        <Field.Label>Select District</Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter district name"
                            {...register('districtName')}
                        />
                        <Field.ErrorText>{errors.districtName?.message}</Field.ErrorText>
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
                    form={`user-right-form-${userRight.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export const UserRights: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Users Rights | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage users rights and access levels"
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

export default UserRights;

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof UserRight>('userName')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [selectedUserRights, setSelectedUserRights] = useState<number[]>([])
    const [isActionBarOpen, setIsActionBarOpen] = useState(false)
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const { userRights, addUserRight, updateUserRight, deleteUserRight } = useUserRightsStore()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        userRight?: UserRight
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    const [deleteDialogState, setDeleteDialogState] = useState<{
        isOpen: boolean
        userRight?: UserRight
    }>({ isOpen: false })

    // Filter and sort user rights
    const filteredAndSortedUserRights = useMemo(() => {
        let filtered = userRights.filter(userRight =>
            userRight.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            userRight.accessLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
            userRight.accessScope.toLowerCase().includes(searchQuery.toLowerCase())
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
    }, [userRights, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedUserRights.length / pageSize)
    const paginatedUserRights = filteredAndSortedUserRights.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Selection logic
    const allIdsOnCurrentPage = paginatedUserRights.map(userRight => userRight.id)
    const allIds = filteredAndSortedUserRights.map(userRight => userRight.id)

    const isAllSelectedOnPage = paginatedUserRights.length > 0 &&
        paginatedUserRights.every(userRight => selectedUserRights.includes(userRight.id))

    const isAllSelected = filteredAndSortedUserRights.length > 0 &&
        filteredAndSortedUserRights.every(userRight => selectedUserRights.includes(userRight.id))

    const handleSelectAllOnPage = () => {
        if (isAllSelectedOnPage) {
            setSelectedUserRights(prev => prev.filter(id => !allIdsOnCurrentPage.includes(id)))
        } else {
            setSelectedUserRights(prev => [...new Set([...prev, ...allIdsOnCurrentPage])])
        }
    }

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedUserRights([])
        } else {
            setSelectedUserRights(allIds)
        }
    }

    const handleSelectUserRight = (userRightId: number) => {
        setSelectedUserRights(prev =>
            prev.includes(userRightId)
                ? prev.filter(id => id !== userRightId)
                : [...prev, userRightId]
        )
    }

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof UserRight) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const handleDeleteUserRight = (userRight: UserRight) => {
        setDeleteDialogState({ isOpen: true, userRight })
    }

    const confirmDelete = () => {
        if (deleteDialogState.userRight) {
            deleteUserRight(deleteDialogState.userRight.id)
            setDeleteDialogState({ isOpen: false })
        }
    }

    // Bulk actions
    const handleBulkDelete = () => {
        setIsBulkDeleteOpen(true)
    }

    const confirmBulkDelete = (ids: number[]) => {
        ids.forEach(id => deleteUserRight(id))
        setSelectedUserRights([])
        setIsActionBarOpen(false)
        setIsBulkDeleteOpen(false)
    }

    const handleBulkEdit = () => {
        setIsBulkEditOpen(true)
    }

    const handleBulkUpdate = (id: number, data: Partial<UserRightFormData>) => {
        updateUserRight(id, data)
        setSelectedUserRights(prev => prev.filter(userRightId => userRightId !== id))
    }

    const handleBulkEditClose = () => {
        setIsBulkEditOpen(false)
        if (selectedUserRights.length === 0) {
            setIsActionBarOpen(false)
        }
    }

    // Close action bar when no items are selected
    useEffect(() => {
        if (selectedUserRights.length === 0 && isActionBarOpen) {
            setIsActionBarOpen(false)
        } else if (selectedUserRights.length > 0 && !isActionBarOpen) {
            setIsActionBarOpen(true)
        }
    }, [selectedUserRights, isActionBarOpen])

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
                        <Heading size="3xl">Users Rights</Heading>
                        <Badge colorPalette={"accent"}>{userRights.length}</Badge>
                    </HStack>

                    <HStack gap="4">
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            onClick={() => setDialogState({ isOpen: true, mode: 'add' })}
                        >
                            <Add />
                            Add User Right
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
                                        onClick={async () => await copyUserRightsToClipboard(userRights)}
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
                                        onClick={() => exportUserRightsToExcel(userRights)}
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
                                        onClick={() => exportUserRightsToCSV(userRights)}
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
                                        onClick={() => exportUserRightsToPDF(userRights)}
                                    >
                                        <ReceiptText />
                                        PDF
                                    </Button>
                                </HStack>

                                {/* Search */}
                                <InputGroup bg="whiteAlpha.600" maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                                    <Input
                                        rounded="xl"
                                        placeholder="Search user rights..."
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
                                                onClick={() => handleSort('userName')}
                                            >
                                                Full Name {sortField === 'userName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('accessLevel')}
                                            >
                                                Access Level {sortField === 'accessLevel' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('accessScope')}
                                            >
                                                Access Scope {sortField === 'accessScope' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                textAlign="center">
                                                Action
                                            </Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {paginatedUserRights.map((userRight) => (
                                            <Table.Row key={userRight.id} bg="whiteAlpha.500">
                                                <Table.Cell>
                                                    <Checkbox.Root
                                                        colorPalette={"accent"}
                                                        checked={selectedUserRights.includes(userRight.id)}
                                                        onCheckedChange={() => handleSelectUserRight(userRight.id)}
                                                    >
                                                        <Checkbox.HiddenInput />
                                                        <Checkbox.Control cursor="pointer" rounded="md" />
                                                    </Checkbox.Root>
                                                </Table.Cell>
                                                <Table.Cell>{userRight.id}</Table.Cell>
                                                <Table.Cell fontWeight="medium">{userRight.userName}</Table.Cell>
                                                <Table.Cell>
                                                    <Badge
                                                        colorPalette={
                                                            userRight.accessLevel === 'super_admin' ? 'blue' :
                                                                userRight.accessLevel === 'group_admin' ? 'green' :
                                                                    userRight.accessLevel === 'district_admin' ? 'orange' :
                                                                        userRight.accessLevel === 'region_admin' ? 'purple' : 'gray'
                                                        }
                                                    >
                                                        {userRight.accessLevel.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </Table.Cell>
                                                <Table.Cell>{userRight.accessScope}</Table.Cell>
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
                                                                            userRight,
                                                                            mode: 'edit'
                                                                        })}
                                                                    >
                                                                        <Edit /> Edit
                                                                    </Menu.Item>
                                                                    <Menu.Item
                                                                        color="red"
                                                                        value="delete"
                                                                        colorPalette="red"
                                                                        onClick={() => handleDeleteUserRight(userRight)}
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
                        setSelectedUserRights([]);
                    }
                }}
                closeOnInteractOutside={false}
            >
                <ActionBar.Positioner>
                    <ActionBar.Content rounded="xl" shadow="2xl">
                        <ActionBar.SelectionTrigger>
                            {selectedUserRights.length} selected
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
                <UserRightDialog
                    {...dialogState}
                    onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                    onSave={(data) => {
                        if (dialogState.mode === 'add') {
                            addUserRight(data)
                        } else if (dialogState.userRight) {
                            updateUserRight(dialogState.userRight.id, data)
                        }
                        setDialogState({ isOpen: false, mode: 'add' })
                    }}
                />

                {/* Single Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={deleteDialogState.isOpen}
                    userRight={deleteDialogState.userRight}
                    onClose={() => setDeleteDialogState({ isOpen: false })}
                    onConfirm={confirmDelete}
                />

                {/* Bulk Delete Dialog */}
                <BulkDeleteDialog
                    isOpen={isBulkDeleteOpen}
                    selectedUserRights={selectedUserRights}
                    userRights={userRights}
                    onClose={() => setIsBulkDeleteOpen(false)}
                    onConfirm={confirmBulkDelete}
                />

                {/* Bulk Edit Dialog */}
                <BulkEditDialog
                    isOpen={isBulkEditOpen}
                    selectedUserRights={selectedUserRights}
                    userRights={userRights}
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
    userRight?: UserRight
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationDialog = ({ isOpen, userRight, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl">
                        <Dialog.Header>
                            <Dialog.Title>Delete User Right</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Are you sure you want to delete user right for <strong>{userRight?.userName}</strong>?
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

// User Right Form Dialog Component
interface UserRightDialogProps {
    isOpen: boolean
    userRight?: UserRight
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: UserRightFormData) => void
}

const UserRightDialog = ({ isOpen, userRight, mode, onClose, onSave }: UserRightDialogProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<UserRightFormData>({
        resolver: zodResolver(userRightSchema),
        defaultValues: {
            userId: userRight?.userId.toString() || '',
            stateName: userRight?.stateName || '',
            regionName: userRight?.regionName || '',
            groupName: userRight?.groupName || '',
            oldGroupName: userRight?.oldGroupName || '',
            districtName: userRight?.districtName || '',
            accessLevel: userRight?.accessLevel || ''
        }
    })

    const currentStateName = watch('stateName')

    const handleStateChange = (value: string) => {
        setValue('stateName', value)
        // Clear dependent fields when state changes
        setValue('regionName', '')
        setValue('groupName', '')
        setValue('districtName', '')
    }

    const handleLGAChange = (value: string) => {
        setValue('regionName', value)
    }

    const handleUserChange = (value: string) => {
        setValue('userId', value)
    }

    const handleAccessLevelChange = (value: string) => {
        setValue('accessLevel', value)
    }

    const onSubmit = (data: UserRightFormData) => {
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
                                {mode === 'add' ? 'Add User Right' : 'Update User Right'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="user-right-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <Field.Root required invalid={!!errors.userId}>
                                        <UserCombobox
                                            value={watch('userId')}
                                            onChange={handleUserChange}
                                            required
                                            invalid={!!errors.userId}
                                        />
                                        <Field.ErrorText>{errors.userId?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.accessLevel}>
                                        <AccessLevelCombobox
                                            value={watch('accessLevel')}
                                            onChange={handleAccessLevelChange}
                                            required
                                            invalid={!!errors.accessLevel}
                                        />
                                        <Field.ErrorText>{errors.accessLevel?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.stateName}>
                                        <StateCombobox
                                            value={currentStateName}
                                            onChange={handleStateChange}
                                            invalid={!!errors.stateName}
                                        />
                                        <Field.ErrorText>{errors.stateName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.regionName}>
                                        <LGACombobox
                                            stateName={currentStateName}
                                            value={watch('regionName')}
                                            onChange={handleLGAChange}
                                            invalid={!!errors.regionName}
                                        />
                                        <Field.ErrorText>{errors.regionName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.groupName}>
                                        <Field.Label>Select Group</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter group name"
                                            {...register('groupName')}
                                        />
                                        <Field.ErrorText>{errors.groupName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.oldGroupName}>
                                        <Field.Label>Select Old Group</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter old group name"
                                            {...register('oldGroupName')}
                                        />
                                        <Field.ErrorText>{errors.oldGroupName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.districtName}>
                                        <Field.Label>Select District</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district name"
                                            {...register('districtName')}
                                        />
                                        <Field.ErrorText>{errors.districtName?.message}</Field.ErrorText>
                                    </Field.Root>
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button rounded="xl" type="submit" form="user-right-form" colorPalette="accent">
                                {mode === 'add' ? 'Add User Right' : 'Update User Right'}
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