"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { copyUsersToClipboard, exportUsersToExcel, exportUsersToCSV, exportUsersToPDF } from "@/utils/users.utils"

interface ExportButtonsProps {
    users: any[]
}

const ExportButtons = ({ users }: ExportButtonsProps) => {
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
                onClick={async () => await copyUsersToClipboard(users)}
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
                onClick={() => exportUsersToExcel(users)}
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
                onClick={() => exportUsersToCSV(users)}
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
                onClick={() => exportUsersToPDF(users)}
            >
                <ReceiptText />
                PDF
            </Button>
        </HStack>
    )
}

export default ExportButtons;