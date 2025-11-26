"use client"

import { Field, Portal, Combobox, useFilter, useListCollection } from "@chakra-ui/react"
import { Controller, type UseFormReturn } from "react-hook-form"
import type { ReportFormValues } from "./ReportFilters"
import { useEffect } from "react"

interface CustomComboboxFieldProps {
    name: keyof ReportFormValues
    label: string
    items: Array<{ label: string; value: string }>
    placeholder: string
    required?: boolean
    disabled?: boolean
    isLoading?: boolean
    form: UseFormReturn<ReportFormValues>
}

export const CustomComboboxField = ({
    name,
    label,
    items,
    placeholder,
    required = false,
    disabled = false,
    isLoading = false,
    form: { control, formState: { errors } }
}: CustomComboboxFieldProps) => {
    const { contains } = useFilter({ sensitivity: "base" })
    const { collection, filter, set } = useListCollection({
        initialItems: items,
        filter: contains,
    })

    useEffect(() => {
        set(items)
    }, [items, set])

    return (
        <Field.Root invalid={!!errors[name]} width="full">
            <Field.Label color={{ base: "gray.700", _dark: "gray.300" }}>
                {label}
                {required && <span style={{ color: 'red' }}>*</span>}
            </Field.Label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Combobox.Root
                        collection={collection}
                        openOnClick
                        onInputValueChange={(e) => filter(e.inputValue)}
                        value={field.value ? [field.value] : []}
                        onValueChange={(e) => {
                            const next = e.value[0]
                            console.log("combobox:change", { name: field.name, value: next })
                            field.onChange(next)
                            field.onBlur()
                        }}
                        name={field.name as string}
                        onInteractOutside={() => field.onBlur()}
                    >
                        <Combobox.Control>
                            <Combobox.Input
                                placeholder={placeholder}
                                rounded="xl"
                                bg="bg"
                                color={{ base: "gray.800", _dark: "white" }}
                                _placeholder={{ color: "gray.500" }}
                                disabled={disabled}
                            />
                            <Combobox.IndicatorGroup>
                                <Combobox.ClearTrigger />
                                <Combobox.Trigger />
                            </Combobox.IndicatorGroup>
                        </Combobox.Control>
                        <Portal>
                            <Combobox.Positioner>
                                <Combobox.Content bg="bg" border="xs" borderColor={"border"} rounded="xl">
                                    {isLoading ? (
                                        <Combobox.Empty>Loading...</Combobox.Empty>
                                    ) : (
                                        <Combobox.Empty>No items found</Combobox.Empty>
                                    )}
                                    {collection.items.map((item) => (
                                        <Combobox.Item item={item} key={item.value}>
                                            {item.label}
                                            <Combobox.ItemIndicator />
                                        </Combobox.Item>
                                    ))}
                                </Combobox.Content>
                            </Combobox.Positioner>
                        </Portal>
                    </Combobox.Root>
                )}
            />
            <Field.ErrorText color="red.500">{errors[name]?.message}</Field.ErrorText>
        </Field.Root>
    )
}

export default CustomComboboxField
