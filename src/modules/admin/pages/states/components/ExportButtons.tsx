"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { exportToExcel, exportToCSV, exportToPDF } from "@/utils/export.utils"
import type { State } from "../../../stores/states.store"

interface ExportButtonsProps {
    states: State[]
}

const ExportButtons = ({ states }: ExportButtonsProps) => {
    return (
        <HStack>
            <Button
                rounded="xl"
                variant="solid"
                bg="whiteAlpha.500"
                color="accent"
                _hover={{ bg: "white" }}
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(states))}
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
    )
}

export default ExportButtons;