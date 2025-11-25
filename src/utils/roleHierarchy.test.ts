import { describe, it, expect } from 'vitest'
import { getRoleBasedVisibility, getHighestRole, ROLE_HIERARCHY } from './roleHierarchy'
import type { RoleType } from './roleHierarchy'

describe('roleHierarchy', () => {
  describe('getHighestRole', () => {
    it('should return the highest role from a list of roles', () => {
      const roles: RoleType[] = ['State Admin', 'Region Admin', 'Group Admin']
      const highest = getHighestRole(roles)
      expect(highest).toBe('State Admin')
    })

    it('should return Super Admin as the highest role', () => {
      const roles: RoleType[] = ['Super Admin', 'State Admin', 'Region Admin']
      const highest = getHighestRole(roles)
      expect(highest).toBe('Super Admin')
    })

    it('should return Viewer as the lowest role', () => {
      const roles: RoleType[] = ['Viewer', 'Group Admin']
      const highest = getHighestRole(roles)
      expect(highest).toBe('Group Admin')
    })

    it('should handle empty roles array', () => {
      const roles: RoleType[] = []
      const highest = getHighestRole(roles)
      expect(highest).toBe('Viewer')
    })

    it('should handle single role', () => {
      const roles: RoleType[] = ['District Admin']
      const highest = getHighestRole(roles)
      expect(highest).toBe('District Admin')
    })
  })

  describe('getRoleBasedVisibility', () => {
    it('should show all fields for Super Admin', () => {
      const roles: RoleType[] = ['Super Admin']
      const visibility = getRoleBasedVisibility(roles)
      
      expect(visibility.showState).toBe(true)
      expect(visibility.showRegion).toBe(true)
      expect(visibility.showDistrict).toBe(true)
      expect(visibility.showGroup).toBe(true)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should hide state field for State Admin', () => {
      const roles: RoleType[] = ['State Admin']
      const visibility = getRoleBasedVisibility(roles)
      
      expect(visibility.showState).toBe(false)
      expect(visibility.showRegion).toBe(true)
      expect(visibility.showDistrict).toBe(true)
      expect(visibility.showGroup).toBe(true)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should hide state and region fields for Region Admin', () => {
      const roles: RoleType[] = ['Region Admin']
      const visibility = getRoleBasedVisibility(roles)
      
      expect(visibility.showState).toBe(false)
      expect(visibility.showRegion).toBe(false)
      expect(visibility.showDistrict).toBe(true)
      expect(visibility.showGroup).toBe(true)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should hide state, region, and district fields for District Admin', () => {
      const roles: RoleType[] = ['District Admin']
      const visibility = getRoleBasedVisibility(roles)
      
      expect(visibility.showState).toBe(false)
      expect(visibility.showRegion).toBe(false)
      expect(visibility.showDistrict).toBe(false)
      expect(visibility.showGroup).toBe(true)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should hide state, region, district, and group fields for Group Admin', () => {
      const roles: RoleType[] = ['Group Admin']
      const visibility = getRoleBasedVisibility(roles)
      
      expect(visibility.showState).toBe(false)
      expect(visibility.showRegion).toBe(false)
      expect(visibility.showDistrict).toBe(false)
      expect(visibility.showGroup).toBe(false)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should hide all fields except old group for Viewer', () => {
      const roles: RoleType[] = ['Viewer']
      const visibility = getRoleBasedVisibility(roles)
      
      expect(visibility.showState).toBe(false)
      expect(visibility.showRegion).toBe(false)
      expect(visibility.showDistrict).toBe(false)
      expect(visibility.showGroup).toBe(false)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should handle multiple roles and use the highest one', () => {
      const roles: RoleType[] = ['Group Admin', 'Region Admin', 'State Admin']
      const visibility = getRoleBasedVisibility(roles)
      
      // Should behave like State Admin (highest role)
      expect(visibility.showState).toBe(false)
      expect(visibility.showRegion).toBe(true)
      expect(visibility.showDistrict).toBe(true)
      expect(visibility.showGroup).toBe(true)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should handle empty roles array', () => {
      const roles: RoleType[] = []
      const visibility = getRoleBasedVisibility(roles)
      
      // Should behave like Viewer (default)
      expect(visibility.showState).toBe(false)
      expect(visibility.showRegion).toBe(false)
      expect(visibility.showDistrict).toBe(false)
      expect(visibility.showGroup).toBe(false)
      expect(visibility.showOldGroup).toBe(true)
    })

    it('should handle admin role', () => {
      const roles: RoleType[] = ['admin']
      const visibility = getRoleBasedVisibility(roles)
      
      // admin role should behave like Super Admin
      expect(visibility.showState).toBe(true)
      expect(visibility.showRegion).toBe(true)
      expect(visibility.showDistrict).toBe(true)
      expect(visibility.showGroup).toBe(true)
      expect(visibility.showOldGroup).toBe(true)
    })
  })

  describe('ROLE_HIERARCHY', () => {
    it('should have correct hierarchy values', () => {
      expect(ROLE_HIERARCHY['Super Admin']).toBe(6)
      expect(ROLE_HIERARCHY['admin']).toBe(5)
      expect(ROLE_HIERARCHY['State Admin']).toBe(4)
      expect(ROLE_HIERARCHY['Region Admin']).toBe(3)
      expect(ROLE_HIERARCHY['District Admin']).toBe(2)
      expect(ROLE_HIERARCHY['Group Admin']).toBe(1)
      expect(ROLE_HIERARCHY['Viewer']).toBe(0)
    })
  })
})