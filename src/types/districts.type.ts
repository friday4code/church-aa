export interface District {
    code: string;
    id: number;
    leader: string;
    name: string;
    region: string;
    state: string;
    // Add optional properties if they might exist
    // population?: number;
    // area?: string;
    // is_active?: boolean;
}

export type Districts = District[];