// components/regions/components/ExportButtons.tsx
"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { exportRegionsToExcel, exportRegionsToCSV, exportRegionsToPDF, copyRegionsToClipboard } from "@/utils/export.regions.util"
import type { Region } from "@/types/regions.type"

interface ExportButtonsProps {
    regions: Region[]
}

const ExportButtons = ({ regions }: ExportButtonsProps) => {
    const handleCopy = async () => {
        try {
            await copyRegionsToClipboard(regions);
            // You can add a toast notification here if needed
        } catch (error) {
            console.error('Failed to copy regions to clipboard:', error);
        }
    }

    return (
        <HStack w="full">
            <Button
                rounded="xl"
                variant="solid"
                bg="bg"
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                onClick={handleCopy}
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
                onClick={() => exportRegionsToExcel(regions)}
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
                onClick={() => exportRegionsToCSV(regions)}
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
                onClick={() => exportRegionsToPDF(regions)}
            >
                <ReceiptText />
                PDF
            </Button>
        </HStack>
    )
}

export default ExportButtons;