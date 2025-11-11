"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { exportToExcel, exportToCSV, exportToPDF } from "@/utils/export.utils"
import type { State } from "@/types/states.type"

interface ExportButtonsProps {
    states: State[]
}


const ExportButtons = ({ states }: ExportButtonsProps) => {
    return (
        <HStack w="full">
            <Button
                rounded="xl"
                variant="solid"
                bg="bg"
                color="accent"
                _hover={{ bg: "bg.muted" }}
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(states))}
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
                onClick={() => exportToExcel(states)}
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
                onClick={() => exportToCSV(states)}
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
                onClick={() => exportToPDF(states)}
            >
                <ReceiptText />
                PDF
            </Button>
        </HStack>
    )
}

export default ExportButtons;