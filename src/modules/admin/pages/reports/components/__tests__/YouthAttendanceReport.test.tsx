import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { YouthAttendanceReport } from '../YouthAttendanceReport'
import { adminApi } from '@/api/admin.api'

describe.skip('YouthAttendanceReport UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('disables regions when no state is selected and enables after selection', async () => {
    const getRegionsSpy = vi.spyOn(adminApi, 'getRegionsByStateId').mockResolvedValue([
      { id: 5, name: 'Region Five' },
      { id: 6, name: 'Region Six' },
    ])

    render(
      <YouthAttendanceReport
        statesCollection={[{ label: 'AKWA IBOM', value: '2' }]}
        regionsCollection={[]}
        yearsCollection={[{ label: '2025', value: '2025' }]}
        monthsCollection={[{ label: 'January', value: '1' }]}
        onDownload={() => { }}
      />
    )

    const regionLabel = screen.getByText('Region')
    expect(regionLabel).toBeTruthy()
    const stateLabel = screen.getByText('State')
    expect(stateLabel).toBeTruthy()

    // Region input initially shows hint
    const regionInput = screen.getByPlaceholderText('Select a state first') as HTMLInputElement
    expect(regionInput).toBeDisabled()

    // Open state combobox and select state
    const stateInput = screen.getByPlaceholderText('Type to search state')
    expect(stateInput).toBeTruthy()
    // Trigger open by clicking input then pick item from list
    stateInput.click()
    const stateItem = await screen.findByText('AKWA IBOM')
    stateItem.click()

    // Regions should be fetched and enabled
    expect(getRegionsSpy).toHaveBeenCalledWith(2)
    const regionEnabledInput = await screen.findByPlaceholderText('Type to search region')
    expect((regionEnabledInput as HTMLInputElement).disabled).toBe(false)
    // Region list should contain fetched items
    regionEnabledInput.click()
    expect(await screen.findByText('Region Five')).toBeTruthy()
  })

  it('handles API error by clearing and disabling region', async () => {
    vi.spyOn(adminApi, 'getRegionsByStateId').mockRejectedValue(new Error('network'))
    render(
      <ChakraProvider>
        <YouthAttendanceReport
          statesCollection={[{ label: 'AKWA IBOM', value: '2' }]}
          regionsCollection={[]}
          yearsCollection={[{ label: '2025', value: '2025' }]}
          monthsCollection={[{ label: 'January', value: '1' }]}
          onDownload={() => { }}
        />
      </ChakraProvider>
    )
    const stateInput = screen.getByPlaceholderText('Type to search state')
    stateInput.click()
    const stateItem = await screen.findByText('AKWA IBOM')
    stateItem.click()
    const regionInput = await screen.findByPlaceholderText('Select a state first')
    expect((regionInput as HTMLInputElement).disabled).toBe(true)
  })
})
