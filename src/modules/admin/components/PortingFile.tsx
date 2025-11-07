import { useState } from "react"
import { utils, read, writeFile } from "xlsx" // Import writeFile from xlsx
import {
    Box,
    VStack,
    HStack,
    Button,
    Card,
    Text,
    Alert,
    Badge,
    FileUpload,
    Input,
    InputGroup,
    CloseButton,
    Dialog,
    Portal,
    useDisclosure,
} from "@chakra-ui/react"
import { useStatesStore } from "../stores/states.store"
import { DocumentDownload, DocumentUpload, TickCircle, Warning2 } from "iconsax-reactjs"

interface PortingResult {
    success: boolean
    added: number
    updated: number
    errors: string[]
    totalProcessed: number
}

const UploadStatesFromFile = () => {
    const { open, onOpen, onClose } = useDisclosure()
    const [isProcessing, setIsProcessing] = useState(false)
    const [portingResult, setPortingResult] = useState<PortingResult | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)


    const { states, addState, updateState } = useStatesStore()

    // Download template function - CORRECTED
    const calculateColumnWidths = (data: any[]) => {
        const headers = Object.keys(data[0])
        const widths = headers.map(header => {
            // Start with header length
            let maxLength = header.length

            // Check data lengths for this column
            data.forEach(row => {
                const value = String(row[header] || '')
                if (value.length > maxLength) {
                    maxLength = value.length
                }
            })

            // Add some padding
            return { wch: Math.min(maxLength + 2, 50) } // Cap at 50 characters
        })

        return widths
    }

    const downloadTemplate = () => {
        const templateData = states.map(s => ({
            "STATE NAME": s.stateName,
            "STATE CODE": s.stateCode,
            "LEADER": s.leader
        }))

        const worksheet = utils.json_to_sheet(templateData)

        // Auto-calculate column widths based on content
        worksheet['!cols'] = calculateColumnWidths(templateData)

        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, "States Template")

        writeFile(workbook, "states_template.xlsx")
    }

    const processFile = async (files: File[]) => {
        const file = files[0]
        if (!file) return

        setSelectedFile(file)
        setIsProcessing(true)
        setPortingResult(null)

        try {
            const arrayBuffer = await file.arrayBuffer()
            const workbook = read(arrayBuffer)
            const worksheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[worksheetName]
            const jsonData = utils.sheet_to_json(worksheet) as any[]

            const result: PortingResult = {
                success: true,
                added: 0,
                updated: 0,
                errors: [],
                totalProcessed: jsonData.length
            }

            // Process each row
            jsonData.forEach((row, index) => {
                try {
                    const stateName = row['State Name'] || row['stateName'] || row['STATE_NAME']
                    const stateCode = row['State Code'] || row['stateCode'] || row['STATE_CODE']
                    const leader = row['State Leader'] || row['leader'] || row['LEADER'] || row['State Leader']

                    if (!stateName || !stateCode) {
                        result.errors.push(`Row ${index + 1}: Missing state name or code`)
                        return
                    }

                    // Check if state already exists (by code or name)
                    const existingState = states.find(
                        state => state.stateCode === stateCode.toUpperCase() ||
                            state.stateName.toLowerCase() === stateName.toLowerCase()
                    )

                    if (existingState) {
                        // Update existing state
                        updateState(existingState.id, {
                            stateName: stateName.toUpperCase(),
                            stateCode: stateCode.toUpperCase(),
                            leader: leader?.toUpperCase() || existingState.leader
                        })
                        result.updated++
                    } else {
                        // Add new state
                        addState({
                            stateName: stateName.toUpperCase(),
                            stateCode: stateCode.toUpperCase(),
                            leader: leader?.toUpperCase() || ''
                        })
                        result.added++
                    }
                } catch (error) {
                    result.errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
            })

            if (result.errors.length > 0) {
                result.success = false
            }

            setPortingResult(result)
        } catch (error) {
            setPortingResult({
                success: false,
                added: 0,
                updated: 0,
                errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`],
                totalProcessed: 0
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const clearFile = () => {
        setSelectedFile(null)
        setPortingResult(null)
    }

    const handleClose = () => {
        clearFile()
        onClose()
    }

    return (
        <>
            {/* Trigger Button */}
            <Button
                variant="outline"
                onClick={onOpen}
                rounded="xl"
            >
                <DocumentUpload />
                Upload From CSV/EXCEL File
            </Button>

            {/* Dialog */}
            <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner >
                        <Dialog.Content rounded="xl">
                            <Dialog.Header>
                                <Dialog.Title>Upload States From File</Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <VStack gap="4" align="stretch">
                                    {/* Download Template */}
                                    <Card.Root variant="outline">
                                        <Card.Body>
                                            <VStack gap="3">
                                                <HStack justify="space-between" w="full">
                                                    <Text fontWeight="medium">Download Template</Text>
                                                    <Button
                                                        rounded="xl"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={downloadTemplate}
                                                    >
                                                        <DocumentDownload />
                                                        Download
                                                    </Button>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.600">
                                                    Download the Excel template to ensure proper formatting
                                                </Text>
                                            </VStack>
                                        </Card.Body>
                                    </Card.Root>

                                    {/* File Upload */}
                                    <FileUpload.Root
                                        onFileAccept={(fd) => processFile(fd.files)}
                                        accept=".xlsx,.xls,.csv"
                                        disabled={isProcessing}
                                    >
                                        <FileUpload.HiddenInput />

                                        <InputGroup
                                            startElement={<DocumentUpload />}
                                            endElement={
                                                selectedFile && (
                                                    <FileUpload.ClearTrigger asChild>
                                                        <CloseButton
                                                            me="-1"
                                                            size="xs"
                                                            variant="plain"
                                                            focusVisibleRing="inside"
                                                            focusRingWidth="2px"
                                                            pointerEvents="auto"
                                                            onClick={clearFile}
                                                        />
                                                    </FileUpload.ClearTrigger>
                                                )
                                            }
                                        >
                                            <Input asChild>
                                                <FileUpload.Trigger rounded="xl">
                                                    <FileUpload.FileText lineClamp={1}>
                                                        {selectedFile ? selectedFile.name : "Choose Excel or CSV file"}
                                                    </FileUpload.FileText>
                                                </FileUpload.Trigger>
                                            </Input>
                                        </InputGroup>

                                        <FileUpload.Label>
                                            Upload Excel or CSV file with state data
                                        </FileUpload.Label>
                                    </FileUpload.Root>

                                    {/* Processing State */}
                                    {isProcessing && (
                                        <Alert.Root status="info" rounded="md">
                                            <DocumentUpload />
                                            <Box>
                                                <Text fontWeight="medium">Processing file...</Text>
                                                <Text fontSize="sm">Please wait while we import your data</Text>
                                            </Box>
                                        </Alert.Root>
                                    )}

                                    {/* Results */}
                                    {portingResult && (
                                        <Alert.Root status={portingResult.success ? "success" : "warning"} rounded="md">
                                            {portingResult.success ? <TickCircle /> : <Warning2 />}
                                            <Box>
                                                <Text fontWeight="medium">
                                                    {portingResult.success ? "Import Successful" : "Import Completed with Issues"}
                                                </Text>
                                                <VStack align="start" gap="1" mt="1">
                                                    <HStack>
                                                        <Badge colorPalette="green">{portingResult.added} added</Badge>
                                                        <Badge colorPalette="blue">{portingResult.updated} updated</Badge>
                                                        <Badge colorPalette="gray">{portingResult.totalProcessed} total</Badge>
                                                    </HStack>
                                                    {portingResult.errors.length > 0 && (
                                                        <Box>
                                                            <Text fontSize="sm" fontWeight="medium">
                                                                Errors ({portingResult.errors.length}):
                                                            </Text>
                                                            <Box as="ul" fontSize="xs" pl="4">
                                                                {portingResult.errors.slice(0, 3).map((error, index) => (
                                                                    <li key={index}>{error}</li>
                                                                ))}
                                                                {portingResult.errors.length > 3 && (
                                                                    <li>... and {portingResult.errors.length - 3} more errors</li>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </VStack>
                                            </Box>
                                        </Alert.Root>
                                    )}
                                </VStack>
                            </Dialog.Body>

                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button rounded="xl" variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    rounded="xl"
                                    colorPalette="blue"
                                    loading={isProcessing}
                                    disabled={!selectedFile || isProcessing}
                                    onClick={() => selectedFile && processFile([selectedFile])}
                                >
                                    Import Data
                                </Button>
                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}

export default UploadStatesFromFile