export type OldGroupLite = { id: number; name: string }
export type ComboItem = { label: string; value: string }
export const mapOldGroupsToCombo = (items: OldGroupLite[]): ComboItem[] => items.map(x => ({ label: x.name, value: String(x.id) }))

