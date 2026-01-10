"use client"

import { SimpleGrid, Button } from "@chakra-ui/react";
import { CloseCircle } from "iconsax-reactjs";
import { StateFilter } from "./StateFilter";
import type { StateFilterProps } from "./types";
import type { State } from "@/types/states.type";

interface RegionPageFilterProps extends Omit<StateFilterProps, 'states'> {
    states: State[];
}

export const RegionPageFilter = ({
    states,
    selectedState,
    onStateChange,
    ...props
}: RegionPageFilterProps) => {
    const handleReset = () => {
        onStateChange("");
    };

    return (
        <SimpleGrid gap={8} overflowX="auto" pb={{ base: 2, md: 0 }} columns={{ base: 2, md: 2 }}>
            <StateFilter
                states={states}
                selectedState={selectedState}
                onStateChange={onStateChange}
                {...props}
            />
            <Button 
                variant="surface" 
                colorPalette="red" 
                onClick={handleReset}
                disabled={!selectedState}
            >
                <CloseCircle /> Reset Filter
            </Button>
        </SimpleGrid>
    );
};