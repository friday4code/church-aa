"use client"

import { useMemo } from "react";
import { BaseSelectFilter, createFilterCollection, createFilterOption } from "./BaseSelectFilter";
import type { StateFilterProps } from "./types";

export const StateFilter = ({
    states,
    selectedState,
    onStateChange,
    placeholder = "Select state",
    width = "200px",
    size = "md"
}: StateFilterProps) => {
    const stateCollection = useMemo(() => {
        const items = [
            createFilterOption("All States", ""),
            ...states.map(state => createFilterOption(state.name, state.id))
        ];
        return createFilterCollection(items);
    }, [states]);

    return (
        <BaseSelectFilter
            collection={stateCollection}
            selectedValue={selectedState}
            onValueChange={onStateChange}
            placeholder={placeholder}
            width={width}
            size={size}
        />
    );
};