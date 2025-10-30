// stores/states.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface State {
    id: number
    stateName: string
    stateCode: string
    leader: string
}

interface StatesStore {
    states: State[]
    addState: (state: Omit<State, 'id'>) => void
    updateState: (id: number, state: Partial<State>) => void
    deleteState: (id: number) => void
    getState: (id: number) => State | undefined
}

export const useStatesStore = create<StatesStore>()(
    persist(
        (set, get) => ({
            states: [
                { id: 21, stateName: 'AKWA IBOM', stateCode: 'AK', leader: 'EMMANUEL AMAEZE' },
                { id: 22, stateName: 'BAYELSA', stateCode: 'BY', leader: 'MCLAWRENCE EBEREUCHE' },
                { id: 23, stateName: 'CROSS RIVER', stateCode: 'CR', leader: 'EDISON DAMINABO' },
                { id: 24, stateName: 'DELTA', stateCode: 'DT', leader: 'PIUS IDUME' },
                { id: 25, stateName: 'EDO', stateCode: 'ED', leader: 'GODWIN OSABUOHIEN' },
            ],

            addState: (state) => set((store) => ({
                states: [...store.states, { ...state, id: get().states[get().states.length - 1].id + 1 }]
            })),

            updateState: (id, updatedState) => set((store) => ({
                states: store.states.map(state =>
                    state.id === id ? { ...state, ...updatedState } : state
                )
            })),

            deleteState: (id) => set((store) => ({
                states: store.states.filter(state => state.id !== id)
            })),

            getState: (id) => get().states.find(state => state.id === id),
        }),
        {
            name: 'states-storage',
        }
    )
)