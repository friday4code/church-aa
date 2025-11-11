// types/states.type.ts
export interface State {
    code: string;
    id: number;
    leader: string;
    name: string;
}

export type States = State[];

// If you need to transform the API data to match your existing schema:
export interface StateFormData {
    stateName: string;
    stateCode: string;
    leader: string;
}