export function calculateRewardValidity(
    now: Date,
    validityDays: number
): { validFrom: Date; expiresAt: Date } {
    // Logic: Set validFrom to the start of the next day (Midnight)
    const validFrom = new Date(now)
    validFrom.setDate(validFrom.getDate() + 1)
    validFrom.setHours(0, 0, 0, 0) // Midnight tomorrow

    // Expires: ValidFrom + Validity (e.g. 30 days)
    const expiresAt = new Date(validFrom.getTime() + validityDays * 24 * 60 * 60 * 1000)

    return { validFrom, expiresAt }
}
