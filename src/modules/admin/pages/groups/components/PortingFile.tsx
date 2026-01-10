import { useState } from "react"
import { utils, read, writeFile } from "xlsx"
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
import { DocumentDownload, DocumentUpload, TickCircle, Warning2 } from "iconsax-reactjs"
import type { Group, CreateGroupData } from "@/types/groups.type"
import { useGroups } from "@/modules/admin/hooks/useGroup"

interface PortingResult {
    success: boolean
    added: number
    updated: number
    errors: string[]
    totalProcessed: number
}

interface UploadGroupsFromFileProps {
    data: Group[]
}

const UploadGroupsFromFile = ({ data }: UploadGroupsFromFileProps) => {
    const { open, onOpen, onClose } = useDisclosure()
    const [isProcessing, setIsProcessing] = useState(false)
    const [portingResult, setPortingResult] = useState<PortingResult | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const { createGroup, updateGroup } = useGroups()

    const handleAddGroup = (groupData: CreateGroupData) => {
        createGroup(groupData as any)
    }

    const handleUpdateGroup = (id: number, groupData: Partial<CreateGroupData>) => {
        updateGroup({ id, data: groupData as any })
    }

    // Download template function
    const calculateColumnWidths = (data: any[]) => {
        if (!data.length) return []

        const headers = Object.keys(data[0])
        const widths = headers.map(header => {
            let maxLength = header.length

            data.forEach(row => {
                const value = String(row[header] || '')
                if (value.length > maxLength) {
                    maxLength = value.length
                }
            })

            return { wch: Math.min(maxLength + 2, 50) }
        })

        return widths
    }

    const downloadTemplate = () => {
        const templateData = [
            { "GROUP NAME": "Alpha", "LEADER": "John Doe", "STATE ID": 1, "REGION ID": 2, "OLD GROUP ID": 0 },
            ...data.map(group => ({
                "GROUP NAME": group.name,
                "LEADER": group.leader ?? '',
                "STATE ID": group.state_id ?? 0,
                "REGION ID": group.region_id ?? 0,
                "OLD GROUP ID": group.old_group_id ?? 0,
            }))
        ]

        const worksheet = utils.json_to_sheet(templateData)
        worksheet['!cols'] = calculateColumnWidths(templateData)
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, "Groups Template")
        writeFile(workbook, "groups_template.xlsx")
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

            const getCell = (row: Record<string, unknown>, variants: string[]) => {
                for (const key of variants) {
                    if (row[key] != null) return row[key] as string
                    const lowerKey = key.toLowerCase()
                    const upperKey = key.toUpperCase()
                    if (row[lowerKey] != null) return row[lowerKey] as string
                    if (row[upperKey] != null) return row[upperKey] as string
                }
                return ''
            }

            // Track processed entities to prevent duplicates within the file
            const processedGroups = new Set<string>();

            // Process each row
            for (const [index, row] of jsonData.entries()) {
                try {
                    const groupName = getCell(row, ['GROUP NAME', 'Group Name', 'group_name'])
                    const leader = getCell(row, ['LEADER', 'Leader'])
                    const stateId = parseInt(getCell(row, ['STATE ID', 'State ID', 'state_id']) || '0')
                    const regionId = parseInt(getCell(row, ['REGION ID', 'Region ID', 'region_id']) || '0')
                    const oldGroupId = parseInt(getCell(row, ['OLD GROUP ID', 'Old Group ID', 'old_group_id']) || '0')

                    // Validate required fields
                    if (!groupName) {
                        result.errors.push(`Row ${index + 1}: Missing group name`)
                        continue
                    }

                    if (!stateId || isNaN(stateId)) {
                        result.errors.push(`Row ${index + 1}: Invalid state ID`)
                        continue
                    }

                    const normalizedGroupName = groupName.toLowerCase();
                    if (processedGroups.has(normalizedGroupName)) {
                        result.errors.push(`Row ${index + 1}: Duplicate entry in file for Group ${groupName}`)
                        continue;
                    }
                    processedGroups.add(normalizedGroupName);

                    // Check if group already exists (by name or other identifier)
                    const existingGroup = data.find(
                        group => group.name.toLowerCase() === normalizedGroupName ||
                            group.id === index + 1 // Using index as fallback identifier
                    )

                    const groupData: CreateGroupData = {
                        group_name: groupName,
                        leader: leader || '',
                        state_id: stateId,
                        region_id: regionId || 0,
                        old_group_id: oldGroupId || undefined,
                    }

                    if (existingGroup) {
                        // Update existing group
                        handleUpdateGroup(existingGroup.id, groupData)
                        result.updated++
                    } else {
                        // Add new group
                        handleAddGroup(groupData)
                        result.added++
                    }
                } catch (error) {
                    result.errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
            }

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
                bg="bg"
                variant={{ base: "ghost", md: "outline" }}
                color="bg.inverted"
                w={{ base: "full", md: "auto" }}
                justifyContent={{ base: "start", md: "center" }}
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
                    <Dialog.Positioner>
                        <Dialog.Content rounded="xl" width={{ base: "xs", md: "auto" }} maxWidth={{ base: "xs", md: "full" }}>
                            <Dialog.Header>
                                <Dialog.Title>Upload Groups From File</Dialog.Title>
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
                                                    Download the Excel template to ensure proper formatting for group data
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
                                            Upload Excel or CSV file with group data
                                        </FileUpload.Label>
                                    </FileUpload.Root>

                                    {/* Processing State */}
                                    {isProcessing && (
                                        <Alert.Root status="info" rounded="md">
                                            <DocumentUpload />
                                            <Box>
                                                <Text fontWeight="medium">Processing file...</Text>
                                                <Text fontSize="sm">Please wait while we import your group data</Text>
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

export default UploadGroupsFromFile