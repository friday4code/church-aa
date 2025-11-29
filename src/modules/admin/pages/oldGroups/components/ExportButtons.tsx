// components/oldgroups/components/ExportButtons.tsx
"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { exportOldGroupsToExcel, exportOldGroupsToCSV, exportOldGroupsToPDF, copyOldGroupsToClipboard } from "@/utils/oldgroups.utils"
import type { OldGroup } from "@/types/oldGroups.type"

interface ExportButtonsProps {
    oldGroups: OldGroup[]
}

const ExportButtons = ({ oldGroups }: ExportButtonsProps) => {
    return (
        <HStack w="full" flexDir={{ base: "column", md: "row" }} justify={{ base: "start", md: "center" }}>
            <Button
                rounded="xl"
                variant="solid"
                bg="bg"
                w={{ base: "full", md: "auto" }}
                justifyContent={{ base: "start", md: "center" }}
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                onClick={async () => await copyOldGroupsToClipboard(oldGroups)}
            >
                <Copy />
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
                onClick={() => exportOldGroupsToExcel(oldGroups)}
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
                onClick={() => exportOldGroupsToCSV(oldGroups)}
            >
                <DocumentText />
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
                onClick={() => exportOldGroupsToPDF(oldGroups)}
            >
                <ReceiptText />
                PDF
            </Button>
        </HStack>
    )
}

export default ExportButtons;