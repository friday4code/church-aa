export interface Region {
    code: string;
    id: number;
    leader: string;
    name: string;
    state: string;
}

export type Regions = Region[];