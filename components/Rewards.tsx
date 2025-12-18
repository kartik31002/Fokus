'use client'

import { useRewards } from '@/hooks/useRewards'
import { useState } from 'react'

export default function Rewards() {
  const { rewards, totalPoints, claimReward, getAvailableRewards, getAffordableRewards, getUnlockedRewards } = useRewards()
  const [showUnlocked, setShowUnlocked] = useState(false)
  const [filter, setFilter] = useState<'all' | 'affordable'>('all')

  const allRewards = getAvailableRewards()
  const affordableRewards = getAffordableRewards()
  const unlockedRewards = getUnlockedRewards()
  const displayedRewards = filter === 'affordable' ? affordableRewards : allRewards

  const handleClaim = (rewardId: string, rewardName: string, pointsRequired: number) => {
    if (confirm(`Claim "${rewardName}" for ${pointsRequired} points?`)) {
      const success = claimReward(rewardId)
      if (success) {
        alert(`🎉 You've claimed "${rewardName}"! Enjoy!`)
      } else {
        alert('Unable to claim this reward. You may not have enough points.')
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            💝 Rewards
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
              <p className="text-3xl font-bold text-reward-600">{totalPoints}</p>
            </div>
            <button
              onClick={() => setShowUnlocked(!showUnlocked)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {showUnlocked ? 'Hide' : 'Show'} Unlocked
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              filter === 'all'
                ? 'border-reward-600 text-reward-600 dark:text-reward-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All Rewards ({allRewards.length})
          </button>
          <button
            onClick={() => setFilter('affordable')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              filter === 'affordable'
                ? 'border-reward-600 text-reward-600 dark:text-reward-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Can Afford ({affordableRewards.length})
          </button>
        </div>

        {/* Available Rewards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Available Rewards
          </h3>
          {displayedRewards.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {unlockedRewards.length > 0 
                ? filter === 'affordable'
                  ? 'You need more points to claim available rewards. Keep focusing! 💪'
                  : 'All rewards claimed! 🎉'
                : 'Earn points by completing focus sessions to claim rewards!'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedRewards.map((reward) => {
                const canAfford = totalPoints >= reward.pointsRequired
                return (
                  <div
                    key={reward.id}
                    className={`
                      border-2 rounded-xl p-6 transition-all
                      ${canAfford
                        ? 'border-reward-400 dark:border-reward-500 bg-gradient-to-br from-reward-50 to-reward-100 dark:from-reward-900/30 dark:to-reward-800/30 shadow-md hover:shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 opacity-75'
                      }
                    `}
                  >
                    <div className="text-4xl mb-3 text-center">{reward.icon}</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {reward.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {reward.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${
                        canAfford
                          ? 'text-reward-700 dark:text-reward-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {reward.pointsRequired} points
                      </span>
                      <button
                        onClick={() => handleClaim(reward.id, reward.name, reward.pointsRequired)}
                        disabled={!canAfford}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${canAfford
                            ? 'bg-reward-600 text-white hover:bg-reward-700 shadow-md'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {canAfford ? 'Claim' : 'Need More Points'}
                      </button>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            canAfford ? 'bg-reward-500' : 'bg-gray-400'
                          }`}
                          style={{
                            width: `${Math.min(100, (totalPoints / reward.pointsRequired) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {Math.min(totalPoints, reward.pointsRequired)} / {reward.pointsRequired} points
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Unlocked Rewards */}
        {showUnlocked && unlockedRewards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Unlocked Rewards ✨
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border-2 border-yellow-300 dark:border-yellow-600 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 opacity-90"
                >
                  <div className="text-4xl mb-3 text-center">{reward.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {reward.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                      ✨ Unlocked
                    </span>
                    {reward.unlockedAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(reward.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Reward (Future feature) */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 Want to add a custom reward? This feature is coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
