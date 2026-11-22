import { describe, expect, it } from 'vitest'
import { daysLeft, getExpiryStatus } from './expiry'

describe('getExpiryStatus', () => {
  it('marks past dates as expired', () => {
    expect(getExpiryStatus(-1)).toBe('EXPIRED')
    expect(getExpiryStatus(-30)).toBe('EXPIRED')
  })
  it('marks day 0 as expires today', () => {
    expect(getExpiryStatus(0)).toBe('EXPIRES_TODAY')
  })
  it('marks 1 to 7 days as expiring soon', () => {
    expect(getExpiryStatus(1)).toBe('EXPIRING_SOON')
    expect(getExpiryStatus(7)).toBe('EXPIRING_SOON')
  })
  it('marks 8 to 30 days as monitor', () => {
    expect(getExpiryStatus(8)).toBe('MONITOR')
    expect(getExpiryStatus(30)).toBe('MONITOR')
  })
  it('marks more than 30 days as safe', () => {
    expect(getExpiryStatus(31)).toBe('SAFE')
    expect(getExpiryStatus(400)).toBe('SAFE')
  })
})

describe('daysLeft', () => {
  const today = new Date(2026, 10, 22)
  it('counts calendar days ahead', () => {
    expect(daysLeft('2026-11-25', today)).toBe(3)
  })
  it('returns 0 for the same day', () => {
    expect(daysLeft('2026-11-22', today)).toBe(0)
  })
  it('returns a negative number for past dates', () => {
    expect(daysLeft('2026-11-19', today)).toBe(-3)
  })
})
