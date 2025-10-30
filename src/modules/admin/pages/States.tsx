// components/states/StatesPage.tsx
"use client"

import { useState, useMemo, useCallback } from "react"
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
    DownloadTrigger
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { exportToExcel, exportToCSV, exportToPDF } from "@/utils/export.utils"
import { Add, Copy, DocumentDownload, DocumentText, Edit, More, ReceiptText, SearchNormal1, Trash } from "iconsax-reactjs"
import { useStatesStore, type State } from "../stores/states.store"
import { stateSchema, type StateFormData } from "../schemas/states.schemas"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"



export const States: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>States | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="track your States"
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

export default States;

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sortField, setSortField] = useState<keyof State>('stateName')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const { states, addState, updateState, deleteState } = useStatesStore()

    const searchQuery = searchParams.get('search') || ''
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean
        state?: State
        mode: 'add' | 'edit'
    }>({ isOpen: false, mode: 'add' })

    // Filter and sort states
    const filteredAndSortedStates = useMemo(() => {
        let filtered = states.filter(state =>
            state.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            state.stateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            state.leader.toLowerCase().includes(searchQuery.toLowerCase())
        )

        // Sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
            }
        })

        return filtered
    }, [states, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedStates.length / pageSize)
    const paginatedStates = filteredAndSortedStates.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    const handleSearch = (value: string) => {
        setSearchParams(s => (s.set("search", value), s))
        setCurrentPage(1)
    }

    const handleSort = (field: keyof State) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    return (
        <Box>
            <VStack gap="6" align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Heading size="3xl">All States</Heading>
                    <Button
                        colorPalette="accent"
                        rounded="xl"
                        onClick={() => setDialogState({ isOpen: true, mode: 'add' })}
                    >
                        <Add />
                        Add State
                    </Button>
                </Flex>

                <Card.Root bg="transparent" border={"none"}>
                    <Card.Body p={0}>
                        <VStack gap="4">
                            {/* Export Buttons */}
                            <HStack justify="space-between" w="full">
                                <HStack>
                                    <DownloadTrigger
                                        data={JSON.stringify(states)}
                                        fileName="states"
                                        mimeType="application/json"
                                        asChild
                                    >
                                        <Button rounded="xl" variant="solid"
                                            bg="whiteAlpha.500"
                                            color="accent"
                                            _hover={{ bg: "white" }} size="sm">
                                            <Copy />
                                            Copy
                                        </Button>
                                    </DownloadTrigger>
                                    <Button
                                        variant="solid"
                                        bg="whiteAlpha.500"
                                        color="accent"
                                        _hover={{ bg: "white" }}
                                        size="sm"
                                        rounded="xl"
                                        onClick={() => exportToExcel(states)}
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
                                        onClick={() => exportToCSV(states)}
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
                                        onClick={() => exportToPDF(states)}
                                    >
                                        <ReceiptText />
                                        PDF
                                    </Button>
                                </HStack>

                                {/* Search */}
                                <InputGroup bg="whiteAlpha.600" maxW="300px" colorPalette={"accent"} startElement={<SearchNormal1 />}>
                                    <Input
                                        rounded="xl"
                                        placeholder="Search states..."
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </InputGroup>
                            </HStack>

                            {/* Table */}
                            <Table.ScrollArea borderWidth="1px" maxW="full" w="full" rounded="xl">
                                <Table.Root size="sm">
                                    <Table.Header>
                                        <Table.Row fontSize={"md"}>
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
                                                onClick={() => handleSort('stateName')}
                                            >
                                                State Name {sortField === 'stateName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('stateCode')}
                                            >
                                                State Code {sortField === 'stateCode' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                cursor="pointer"
                                                onClick={() => handleSort('leader')}
                                            >
                                                State Leader {sortField === 'leader' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                fontWeight={"bold"}
                                                textAlign="center">
                                                Action
                                            </Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {paginatedStates.map((state) => (
                                            <Table.Row key={state.id} bg="whiteAlpha.500">
                                                <Table.Cell>{state.id}</Table.Cell>
                                                <Table.Cell fontWeight="medium">{state.stateName}</Table.Cell>
                                                <Table.Cell>{state.stateCode}</Table.Cell>
                                                <Table.Cell>{state.leader}</Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <Menu.Root>
                                                        <Menu.Trigger asChild>
                                                            <IconButton variant="ghost" size="sm">
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
                                                                            state,
                                                                            mode: 'edit'
                                                                        })}
                                                                    >
                                                                        <Edit /> Edit
                                                                    </Menu.Item>
                                                                    <Menu.Item
                                                                        color="red"
                                                                        value="delete"
                                                                        colorPalette="red"
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to delete this state?')) {
                                                                                deleteState(state.id)
                                                                            }
                                                                        }}
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
                                    count={totalPages}
                                    pageSize={1}
                                    page={currentPage}
                                    onPageChange={(d) => setCurrentPage(d.page)}
                                >
                                    <ButtonGroup variant="outline" size="sm">
                                        <Pagination.PrevTrigger asChild>
                                            <IconButton>
                                                ←
                                            </IconButton>
                                        </Pagination.PrevTrigger>

                                        <Pagination.Items
                                            render={(page) => (
                                                <IconButton variant={{ base: "outline", _selected: "solid" }}>
                                                    {page.value}
                                                </IconButton>
                                            )}
                                        />

                                        <Pagination.NextTrigger asChild>
                                            <IconButton>
                                                →
                                            </IconButton>
                                        </Pagination.NextTrigger>
                                    </ButtonGroup>
                                </Pagination.Root>
                            )}
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* Add/Edit Dialog */}
            <StateDialog
                {...dialogState}
                onClose={() => setDialogState({ isOpen: false, mode: 'add' })}
                onSave={(data) => {
                    if (dialogState.mode === 'add') {
                        addState(data)
                    } else if (dialogState.state) {
                        updateState(dialogState.state.id, data)
                    }
                    setDialogState({ isOpen: false, mode: 'add' })
                }}
            />
        </Box>
    )
}

// State Form Dialog Component
interface StateDialogProps {
    isOpen: boolean
    state?: State
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: StateFormData) => void
}

const StateDialog = ({ isOpen, state, mode, onClose, onSave }: StateDialogProps) => {
    console.log("state", state);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<StateFormData>({
        resolver: zodResolver(stateSchema)
    })

    const onSubmit = (data: StateFormData) => {
        onSave(data)
        reset()
    }
    const StateDialogForm = useCallback(() => {
        return <Dialog.Root
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
                                {mode === 'add' ? 'Add New State' : 'Update State'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="state-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <Field.Root required invalid={!!errors.stateName}>
                                        <Field.Label>State Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter state name"
                                            {...register('stateName')}
                                            defaultValue={state?.stateName}
                                        />
                                        <Field.ErrorText>{errors.stateName?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.stateCode}>
                                        <Field.Label>State
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter state code"
                                            {...register('stateCode')}
                                            defaultValue={state?.stateCode}

                                        />
                                        <Field.ErrorText>{errors.stateCode?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.leader}>
                                        <Field.Label>State Leader
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter state leader name"
                                            {...register('leader')}
                                            defaultValue={state?.leader}
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
                            <Button rounded="xl" type="submit" form="state-form" colorPalette="accent">
                                {mode === 'add' ? 'Add State' : 'Update State'}
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    }, [state, mode, isOpen]);

    return <StateDialogForm />
}
