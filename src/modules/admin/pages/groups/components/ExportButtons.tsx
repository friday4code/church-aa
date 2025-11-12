// components/groups/components/ExportButtons.tsx
"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { exportGroupsToExcel, exportGroupsToCSV, exportGroupsToPDF, copyGroupsToClipboard } from "@/utils/group.utils"
import type { Group } from "@/types/groups.type"

interface ExportButtonsProps {
    groups: Group[]
}

const ExportButtons = ({ groups }: ExportButtonsProps) => {
    return (
        <HStack w="full">
            <Button
                rounded="xl"
                variant="solid"
                bg="bg"
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                onClick={async () => await copyGroupsToClipboard(groups)}
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
                onClick={() => exportGroupsToExcel(groups)}
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
                onClick={() => exportGroupsToCSV(groups)}
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
                onClick={() => exportGroupsToPDF(groups)}
            >
                <ReceiptText />
                PDF
            </Button>
        </HStack>
    )
}

export default ExportButtons;