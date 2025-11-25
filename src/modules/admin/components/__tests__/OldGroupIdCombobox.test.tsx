import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import OldGroupIdCombobox from '../OldGroupIdCombobox'
import type { OldGroup } from '@/types/oldGroups.type'

vi.mock('@/modules/admin/hooks/useOldGroup', () => {
  const oldGroups: OldGroup[] = [
    { id: 1, name: 'OG-Alpha', code: 'OGA', leader: 'L1', state: 'S1', region: 'R1', state_id: 2, region_id: 5 },
    { id: 2, name: 'OG-Beta', code: 'OGB', leader: 'L2', state: 'S2', region: 'R2', state_id: 3, region_id: 6 },
    { id: 3, name: 'OG-Gamma', code: 'OGG', leader: 'L3', state: 'S1', region: 'R1', state_id: 2, region_id: 5 },
  ]
  return {
    useOldGroups: () => ({ oldGroups, isLoading: false, error: null })
  }
})

vi.mock('@/hooks/useMe', () => {
  return {
    useMe: () => ({ user: { roles: ['Region Admin'], state_id: 2, region_id: 5 }, loading: false, error: null, refetch: vi.fn() })
  }
})

describe('OldGroupIdCombobox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters old groups using provided state/region for Region Admin', async () => {
    render(
      <ChakraProvider>
        <OldGroupIdCombobox
          value={''}
          onChange={() => {}}
          isRegionAdmin
          stateId={2}
          regionId={5}
        />
      </ChakraProvider>
    )

    expect(await screen.findByText('OG-Alpha')).toBeInTheDocument()
    expect(screen.getByText('OG-Gamma')).toBeInTheDocument()
    expect(screen.queryByText('OG-Beta')).toBeNull()
  })

  it('falls back to provided items for non-region admin', async () => {
    const items = [
      { id: 10, name: 'OG-Omega', code: 'OGO', leader: 'Lx', state: 'Sy', region: 'Rz' } as OldGroup,
      { id: 11, name: 'OG-Sigma', code: 'OGS', leader: 'Ly', state: 'Sx', region: 'Ry' } as OldGroup,
    ]

    render(
      <ChakraProvider>
        <OldGroupIdCombobox
          value={''}
          onChange={() => {}}
          items={items}
          isRegionAdmin={false}
        />
      </ChakraProvider>
    )

    expect(await screen.findByText('OG-Omega')).toBeInTheDocument()
    expect(screen.getByText('OG-Sigma')).toBeInTheDocument()
  })

  it('shows error when Region Admin scope is missing', async () => {
    render(
      <ChakraProvider>
        <OldGroupIdCombobox
          value={''}
          onChange={() => {}}
          isRegionAdmin
        />
      </ChakraProvider>
    )

    expect(await screen.findByText('Missing user scope: state/region ids not provided')).toBeInTheDocument()
  })
})

