interface Region {
    code: string;
    id: number;
    leader: string;
    name: string;
    state: string;
}

type Regions = Region[];