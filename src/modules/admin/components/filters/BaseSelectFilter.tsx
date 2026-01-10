"use client"

import { Select, Portal, createListCollection } from "@chakra-ui/react";
import type { FilterOption, BaseFilterProps } from "./types";

interface SelectFilterProps extends BaseFilterProps {
    collection: ReturnType<typeof createListCollection<FilterOption>>;
    selectedValue: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
}

export const BaseSelectFilter = ({
    collection,
    selectedValue,
    onValueChange,
    placeholder = "Select option",
    width = "200px",
    size = "md"
}: SelectFilterProps) => {
    return (
        <Select.Root
            size={size}
            value={[selectedValue]}
            onValueChange={(e) => onValueChange(e.value[0])}
            collection={collection}
            width={width}
        >
            <Select.HiddenSelect />
            <Select.Control>
                <Select.Trigger bg="bg" rounded="lg">
                    <Select.ValueText placeholder={placeholder} />
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
                <Select.Positioner>
                    <Select.Content>
                        {collection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                                {item.label}
                                <Select.ItemIndicator />
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Positioner>
            </Portal>
        </Select.Root>
    );
};

export const createFilterCollection = (items: FilterOption[]) => {
    return createListCollection({
        items
    });
};

export const createFilterOption = (label: string, value: string | number): FilterOption => ({
    label,
    value
});