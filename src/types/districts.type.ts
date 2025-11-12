export interface District {
    code: string;
    id: number;
    leader: string;
    name: string;
    region: string;
    state: string;
}

export type Districts = District[];