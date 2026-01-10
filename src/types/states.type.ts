// types/states.type.ts
export interface State {
    code: string;
    id: number;
    name: string;
    leader: string;
    leader_email:string;
    leader_phone:string;
}

export type States = State[];

// If you need to transform the API data to match your existing schema:
export interface StateFormData {
    stateName: string;
    stateCode: string;
    leader: string;
}