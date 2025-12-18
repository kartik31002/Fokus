'use client'

import { useState, useEffect, useCallback } from 'react'
import { rewardStorage, initializeDefaultRewards } from '@/lib/storage'
import type { Reward } from '@/types'

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    initializeDefaultRewards()
    loadRewards()
    loadTotalPoints()
  }, [])

  const loadRewards = useCallback(() => {
    const loadedRewards = rewardStorage.getAll()
    setRewards(loadedRewards)
  }, [])

  const loadTotalPoints = useCallback(() => {
    // Calculate total points from focus sessions
    // For now, we'll use localStorage to track points
    const points = parseInt(localStorage.getItem('fokus:total-points') || '0', 10)
    setTotalPoints(points)
  }, [])

  const addPoints = useCallback((points: number) => {
    const newTotal = totalPoints + points
    setTotalPoints(newTotal)
    localStorage.setItem('fokus:total-points', newTotal.toString())
    
    // Check for newly unlocked rewards
    checkAndUnlockRewards(newTotal)
  }, [totalPoints])

  const checkAndUnlockRewards = useCallback((points: number) => {
    const allRewards = rewardStorage.getAll()
    allRewards.forEach(reward => {
      if (!reward.unlocked && points >= reward.pointsRequired) {
        rewardStorage.unlock(reward.id)
        loadRewards()
      }
    })
  }, [loadRewards])

  const unlockReward = useCallback((id: string) => {
    rewardStorage.unlock(id)
    loadRewards()
  }, [loadRewards])

  const claimReward = useCallback((id: string): boolean => {
    const reward = rewardStorage.getById(id)
    if (!reward || reward.unlocked) {
      return false
    }
    
    if (totalPoints >= reward.pointsRequired) {
      // Deduct points
      const newTotal = totalPoints - reward.pointsRequired
      setTotalPoints(newTotal)
      localStorage.setItem('fokus:total-points', newTotal.toString())
      
      // Claim the reward
      rewardStorage.claim(id)
      loadRewards()
      return true
    }
    return false
  }, [totalPoints, loadRewards])

  const getAvailableRewards = useCallback(() => {
    return rewards.filter(reward => !reward.unlocked)
  }, [rewards])

  const getAffordableRewards = useCallback(() => {
    return rewards.filter(reward => 
      !reward.unlocked && totalPoints >= reward.pointsRequired
    )
  }, [rewards, totalPoints])

  const getUnlockedRewards = useCallback(() => {
    return rewards.filter(reward => reward.unlocked)
  }, [rewards])

  return {
    rewards,
    totalPoints,
    addPoints,
    unlockReward,
    claimReward,
    getAvailableRewards,
    getAffordableRewards,
    getUnlockedRewards,
    refreshRewards: loadRewards,
  }
}
