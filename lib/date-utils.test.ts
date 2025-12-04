import { describe, it, expect } from 'vitest'
import { calculateRewardValidity } from './date-utils'

describe('calculateRewardValidity', () => {
    it('should set validFrom to the next day at midnight', () => {
        // Mock date: Wednesday, Dec 4th, 2025 at 14:30
        const mockNow = new Date('2025-12-04T14:30:00')
        const validityDays = 30

        const { validFrom } = calculateRewardValidity(mockNow, validityDays)

        // Expected validFrom: Thursday, Dec 5th, 2025 at 00:00:00
        const expectedValidFrom = new Date('2025-12-05T00:00:00')

        expect(validFrom.toISOString()).toBe(expectedValidFrom.toISOString())
        expect(validFrom.getHours()).toBe(0)
        expect(validFrom.getMinutes()).toBe(0)
    })

    it('should calculate expiresAt correctly based on validFrom', () => {
        const mockNow = new Date('2025-12-04T14:30:00')
        const validityDays = 30

        const { validFrom, expiresAt } = calculateRewardValidity(mockNow, validityDays)

        // Expected expiresAt: validFrom + 30 days
        const expectedExpiresAt = new Date(validFrom)
        expectedExpiresAt.setDate(expectedExpiresAt.getDate() + 30)

        expect(expiresAt.toISOString()).toBe(expectedExpiresAt.toISOString())
    })
})
