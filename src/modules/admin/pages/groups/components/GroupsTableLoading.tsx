// components/groups/components/GroupsTableLoading.tsx
"use client"

import {
    Table,
    Skeleton,
    HStack
} from "@chakra-ui/react"

interface TableLoadingProps {
    rows?: number
}

const GroupsTableLoading = ({ rows = 5 }: TableLoadingProps) => {
    return (
        <Table.ScrollArea borderWidth="1px" maxW={{ base: "full", lg: "calc(100vw - 18rem)" }} w="full" rounded="xl">
            <Table.Root size="sm">
                <Table.Header>
                    <Table.Row fontSize={"md"}>
                        <Table.ColumnHeader w="50px">
                            <Skeleton height="20px" width="20px" rounded="md" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            <Skeleton height="20px" width="40px" rounded="md" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            <Skeleton height="20px" width="100px" rounded="md" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            <Skeleton height="20px" width="80px" rounded="md" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            <Skeleton height="20px" width="120px" rounded="md" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="center">
                            <Skeleton height="20px" width="60px" rounded="md" />
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {Array.from({ length: rows }).map((_, index) => (
                        <Table.Row key={index} bg="whiteAlpha.500">
                            <Table.Cell>
                                <Skeleton height="16px" width="20px" rounded="md" />
                            </Table.Cell>
                            <Table.Cell>
                                <Skeleton height="16px" width="30px" rounded="md" />
                            </Table.Cell>
                            <Table.Cell>
                                <Skeleton height="16px" width="140px" rounded="md" />
                            </Table.Cell>
                            <Table.Cell>
                                <Skeleton height="16px" width="60px" rounded="md" />
                            </Table.Cell>
                            <Table.Cell>
                                <Skeleton height="16px" width="160px" rounded="md" />
                            </Table.Cell>
                            <Table.Cell textAlign="center">
                                <HStack justify="center">
                                    <Skeleton height="32px" width="32px" rounded="xl" />
                                </HStack>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    )
}

export default GroupsTableLoading;