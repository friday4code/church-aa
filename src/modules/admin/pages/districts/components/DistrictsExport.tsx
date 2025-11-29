// components/districts/components/DistrictsExport.tsx
"use client"

import {
    HStack,
    Button,
} from "@chakra-ui/react"
import { Copy, DocumentDownload, DocumentText, ReceiptText } from "iconsax-reactjs"
import { copyDistrictsToClipboard, exportDistrictsToExcel, exportDistrictsToCSV, exportDistrictsToPDF } from "@/utils/districts.utils"
import type { District } from "@/types/districts.type"

interface DistrictsExportProps {
    districts: District[]
}

const DistrictsExport = ({ districts }: DistrictsExportProps) => {
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
                onClick={async () => await copyDistrictsToClipboard(districts)}
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
                onClick={() => exportDistrictsToExcel(districts)}
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
                onClick={() => exportDistrictsToCSV(districts)}
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
                onClick={() => exportDistrictsToPDF(districts)}
            >
                <ReceiptText />
                PDF
            </Button>
        </HStack>
    )
}

export default DistrictsExport;