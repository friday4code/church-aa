// components/oldgroups/components/ExportButtons.tsx
"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard } from "@/utils/export.utils"
import type { OldGroup } from "@/types/oldGroups.type"

interface ExportButtonsProps {
    oldGroups: OldGroup[]
}

const ExportButtons = ({ oldGroups }: ExportButtonsProps) => {
    return (
        <HStack w="full">
            <Button
                rounded="xl"
                variant="solid"
                bg="bg"
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                onClick={() => copyToClipboard(oldGroups)}
            >
                <Copy />
                Copy
            </Button>
            <Button
                variant="solid"
                bg="bg"
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                rounded="xl"
                onClick={() => exportToExcel(oldGroups)}
            >
                <DocumentDownload />
                Excel
            </Button>
            <Button
                variant="solid"
                bg="bg"
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                rounded="xl"
                onClick={() => exportToCSV(oldGroups)}
            >
                <DocumentText />
                CSV
            </Button>
            <Button
                variant="solid"
                bg="bg"
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                rounded="xl"
                onClick={() => exportToPDF(oldGroups)}
            >
                <ReceiptText />
                PDF
            </Button>
        </HStack>
    )
}

export default ExportButtons;