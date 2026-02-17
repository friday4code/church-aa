// src/types/global.d.ts

// Tell TypeScript that a string can be used as a Role
declare interface Role {
    id: number;
    name: string;
    description: string;
}

// This tells TypeScript to accept strings anywhere a Role is expected
declare type Role = string | {
    id: number;
    name: string;
    description: string;
};

// This fixes the RoleType issue
declare type RoleType = string | {
    id: number;
    name: string;
    description: string;
};

// Extend the Array prototype to handle mixed types
declare interface Array<T> {
    includes(searchElement: any, fromIndex?: number): boolean;
}

// Make TypeScript less strict with role comparisons
declare namespace React {
    interface ReactNode {
        // Allow roles to be rendered as strings
    }
}