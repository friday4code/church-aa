import { useState, useEffect } from "react"
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

import type { District } from "@/types/districts.type"
import type { DistrictFormData } from "@/modules/admin/schemas/districts.schema"
import type { State } from "@/types/states.type"
import type { Region } from "@/types/regions.type"
import type { OldGroup } from "@/types/oldGroups.type"
import type { Group } from "@/types/groups.type"

import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useGroups } from "@/modules/admin/hooks/useGroup"

interface PortingResult {
    success: boolean
    added: number
    updated: number
    errors: string[]
    totalProcessed: number
}

interface UploadDistrictsFromFileProps {
    data?: District[]
}

const UploadDistrictsFromFile = ({ data = [] }: UploadDistrictsFromFileProps) => {
    const { open, onOpen, onClose } = useDisclosure()
    const [isProcessing, setIsProcessing] = useState(false)
    const [portingResult, setPortingResult] = useState<PortingResult | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const { districts = [], createDistrict, updateDistrict } = useDistricts()
    const { states = [] } = useStates()
    const { regions = [] } = useRegions()
    const { oldGroups = [] } = useOldGroups()
    const { groups = [] } = useGroups()

    // Use provided data or fallback to hook data
    const districtsData = data.length > 0 ? data : districts

    const handleAddDistrict = (districtData: DistrictFormData) => {
        createDistrict({
            name: districtData.name,
            code: districtData.code,
            leader: districtData.leader,
            leader_email: districtData.leader_email,
            leader_phone: districtData.leader_phone,
            state_id: districtData.state_id,
            region_id: districtData.region_id,
            old_group_id: districtData.old_group_id,
            group_id: districtData.group_id
        } as any)
    }

    const handleUpdateDistrict = (id: number, districtData: Partial<DistrictFormData>) => {
        updateDistrict({ id, data: districtData })
    }

    // Download template function
    const calculateColumnWidths = (data: any[]) => {
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
            { 
                "NAME": "Example District", 
                "CODE": "DIST001", 
                "LEADER": "John Doe",
                "LEADER EMAIL": "john@example.com",
                "LEADER PHONE": "08012345678",
                "STATE": "LAGOS",
                "REGION": "IKEJA",
                "OLD GROUP": "Example Old Group",
                "GROUP": "Example Group"
            },
            ...districtsData.map(d => ({ 
                "NAME": d.name, 
                "CODE": d.code, 
                "LEADER": d.leader,
                "LEADER EMAIL": d.leader_email || "",
                "LEADER PHONE": d.leader_phone || "",
                "STATE": d.state,
                "REGION": d.region,
                "OLD GROUP": d.old_group || "",
                "GROUP": d.group || ""
            }))
        ]

        const worksheet = utils.json_to_sheet(templateData)
        worksheet['!cols'] = calculateColumnWidths(templateData)
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, "Districts Template")
        writeFile(workbook, "districts_template.xlsx")
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
                    if (row[key] != null) return String(row[key]).trim()
                    const lowerKey = key.toLowerCase()
                    const upperKey = key.toUpperCase()
                    if (row[lowerKey] != null) return String(row[lowerKey]).trim()
                    if (row[upperKey] != null) return String(row[upperKey]).trim()
                }
                return ''
            }

            // Mappings
            const stateMap = new Map<string, number>()
            states.forEach((s: State) => stateMap.set(s.name.toLowerCase(), s.id))

            const regionMap = new Map<string, number>()
            regions.forEach((r: Region) => regionMap.set(r.name.toLowerCase(), r.id))

            const oldGroupMap = new Map<string, number>()
            oldGroups.forEach((g: OldGroup) => oldGroupMap.set(g.name.toLowerCase(), g.id))

            const groupMap = new Map<string, number>()
            groups.forEach((g: Group) => groupMap.set(g.name.toLowerCase(), g.id))

            // Process each row
            for (const [index, row] of jsonData.entries()) {
                try {
                    const name = getCell(row, ['NAME', 'Name', 'District Name'])
                    const code = getCell(row, ['CODE', 'Code', 'District Code'])
                    const leader = getCell(row, ['LEADER', 'Leader', 'District Leader'])
                    const leaderEmail = getCell(row, ['LEADER EMAIL', 'Leader Email', 'Email'])
                    const leaderPhone = getCell(row, ['LEADER PHONE', 'Leader Phone', 'Phone'])
                    const stateName = getCell(row, ['STATE', 'State', 'State Name'])
                    const regionName = getCell(row, ['REGION', 'Region', 'Region Name'])
                    const oldGroupName = getCell(row, ['OLD GROUP', 'Old Group', 'Old Group Name'])
                    const groupName = getCell(row, ['GROUP', 'Group', 'Group Name'])

                    if (!name || !code || !stateName || !regionName || !oldGroupName || !groupName) {
                        result.errors.push(`Row ${index + 1}: Missing required fields (Name, Code, State, Region, Old Group, Group)`)
                        continue
                    }

                    const stateId = stateMap.get(stateName.toLowerCase())
                    if (!stateId) {
                        result.errors.push(`Row ${index + 1}: State '${stateName}' not found`)
                        continue
                    }

                    // Refine region search
                    const matchedRegion = regions.find((r: Region) => 
                        r.name.toLowerCase() === regionName.toLowerCase() && 
                        (r.state_id === stateId || !r.state_id)
                    )
                    const regionId = matchedRegion ? matchedRegion.id : regionMap.get(regionName.toLowerCase())

                    if (!regionId) {
                        result.errors.push(`Row ${index + 1}: Region '${regionName}' not found`)
                        continue
                    }

                    const oldGroupId = oldGroupMap.get(oldGroupName.toLowerCase())
                    if (!oldGroupId) {
                        result.errors.push(`Row ${index + 1}: Old Group '${oldGroupName}' not found`)
                        continue
                    }

                    const groupId = groupMap.get(groupName.toLowerCase())
                    if (!groupId) {
                        result.errors.push(`Row ${index + 1}: Group '${groupName}' not found`)
                        continue
                    }

                    // Check for existing district
                    const existingDistrict = districtsData.find(
                        d => d.code.toLowerCase() === code.toLowerCase() ||
                             d.name.toLowerCase() === name.toLowerCase()
                    )

                    const districtData: DistrictFormData = {
                        name,
                        code,
                        leader: leader || '',
                        leader_email: leaderEmail,
                        leader_phone: leaderPhone,
                        state_id: stateId,
                        region_id: regionId,
                        old_group_id: oldGroupId,
                        group_id: groupId,
                        // temporary fields
                        state_name: stateName,
                        region_name: regionName,
                        old_group_name: oldGroupName,
                        group_name: groupName
                    }

                    if (existingDistrict) {
                        handleUpdateDistrict(existingDistrict.id, districtData)
                        result.updated++
                    } else {
                        handleAddDistrict(districtData)
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
            <Button
                colorPalette="accent"
                variant={{ base: "ghost", md: "outline" }}
                w={{ base: "full", md: "auto" }}
                justifyContent={{ base: "start", md: "center" }}
                onClick={onOpen}
                rounded="xl"
            >
                <DocumentUpload />
                Upload From CSV/EXCEL File
            </Button>

            <Dialog.Root role="alertdialog" open={open} onOpenChange={(e) => !e.open && handleClose()}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner >
                        <Dialog.Content maxW={{ base: "sm", md: "md", lg: "3xl" }} rounded="xl">
                            <Dialog.Header>
                                <Dialog.Title>Upload Districts From File</Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <VStack gap="4" align="stretch">
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
                                            Upload Excel or CSV file with district data
                                        </FileUpload.Label>
                                    </FileUpload.Root>

                                    {isProcessing && (
                                        <Alert.Root status="info" rounded="md">
                                            <DocumentUpload />
                                            <Box>
                                                <Text fontWeight="medium">Processing file...</Text>
                                                <Text fontSize="sm">Please wait while we import your data</Text>
                                            </Box>
                                        </Alert.Root>
                                    )}

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

export default UploadDistrictsFromFile
