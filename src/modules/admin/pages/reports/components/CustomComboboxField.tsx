"use client"

import { Field, Portal, Combobox, useFilter, useListCollection } from "@chakra-ui/react"
import { Controller, type UseFormReturn } from "react-hook-form"
import type { ReportFormValues } from "./ReportFilters"

interface CustomComboboxFieldProps {
    name: keyof ReportFormValues
    label: string
    items: Array<{ label: string; value: string }>
    placeholder: string
    required?: boolean
    form: UseFormReturn<ReportFormValues>
}

export const CustomComboboxField = ({
    name,
    label,
    items,
    placeholder,
    required = false,
    form: { control, formState: { errors } }
}: CustomComboboxFieldProps) => {
    const { contains } = useFilter({ sensitivity: "base" })
    const { collection, filter } = useListCollection({
        initialItems: items,
        filter: contains,
    })

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
                        onValueChange={(e) => field.onChange(e.value[0])}
                        name={field.name as string}
                        onInteractOutside={() => field.onBlur()}
                    >
                        <Combobox.Control>
                            <Combobox.Input
                                placeholder={placeholder}
                                rounded="xl"
                                bg={{ base: "white", _dark: "gray.700" }}
                                color={{ base: "gray.800", _dark: "white" }}
                                _placeholder={{ color: "gray.500" }}
                            />
                            <Combobox.IndicatorGroup>
                                <Combobox.ClearTrigger />
                                <Combobox.Trigger />
                            </Combobox.IndicatorGroup>
                        </Combobox.Control>
                        <Portal>
                            <Combobox.Positioner>
                                <Combobox.Content bg={{ base: "white", _dark: "gray.700" }}>
                                    <Combobox.Empty>No items found</Combobox.Empty>
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
