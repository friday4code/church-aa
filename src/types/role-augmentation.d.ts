// This helps TypeScript understand that we're handling mixed types
declare interface Array<T> {
    includes(searchElement: any, fromIndex?: number): boolean;
}

// Allow Role objects to be treated as strings in certain contexts
declare interface Role {
    toString(): string;
}