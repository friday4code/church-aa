import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import DistrictIdCombobox from '../DistrictIdCombobox'
import type { District } from '@/types/districts.type'

vi.mock('@/modules/admin/hooks/useDistrict', () => {
  const districts: District[] = [
    { id: 1, name: 'Alpha', code: 'A1', leader: 'L1', region: 'R1', state: 'S1', state_id: 2, region_id: 5, old_group_id: 9, group_id: 100 },
    { id: 2, name: 'Beta', code: 'B2', leader: 'L2', region: 'R2', state: 'S2', state_id: 3, region_id: 6, old_group_id: 10, group_id: 101 },
    { id: 3, name: 'Gamma', code: 'G3', leader: 'L3', region: 'R1', state: 'S1', state_id: 2, region_id: 5, old_group_id: 9, group_id: 101 },
  ]
  return {
    useDistricts: () => ({ districts, isLoading: false, error: null })
  }
})

vi.mock('@/hooks/useMe', () => {
  return {
    useMe: () => ({ user: { roles: ['Group Admin'], state_id: 2, region_id: 5, old_group_id: 9, group_id: 100 }, loading: false, error: null, refetch: vi.fn() })
  }
})

describe('DistrictIdCombobox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters districts using provided scope for Group Admin', async () => {
    render(
      <ChakraProvider>
        <DistrictIdCombobox
          value={''}
          onChange={() => {}}
          isGroupAdmin
          stateId={2}
          regionId={5}
          oldGroupId={9}
          groupId={100}
        />
      </ChakraProvider>
    )

    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).toBeNull()
    expect(screen.queryByText('Gamma')).toBeNull()
  })

  it('falls back to provided items for non-group admin', async () => {
    const items = [
      { id: 10, name: 'Omega', code: 'O1', leader: 'Lx', region: 'Rz', state: 'Sy' } as District,
      { id: 11, name: 'Sigma', code: 'S9', leader: 'Ly', region: 'Ry', state: 'Sx' } as District,
    ]

    render(
      <ChakraProvider>
        <DistrictIdCombobox
          value={''}
          onChange={() => {}}
          items={items}
          isGroupAdmin={false}
        />
      </ChakraProvider>
    )

    expect(await screen.findByText('Omega')).toBeInTheDocument()
    expect(screen.getByText('Sigma')).toBeInTheDocument()
  })

  it('shows error when Group Admin scope is missing', async () => {
    render(
      <ChakraProvider>
        <DistrictIdCombobox
          value={''}
          onChange={() => {}}
          isGroupAdmin
        />
      </ChakraProvider>
    )

    expect(await screen.findByText('Missing user scope: state/region/group ids not provided')).toBeInTheDocument()
  })
})
