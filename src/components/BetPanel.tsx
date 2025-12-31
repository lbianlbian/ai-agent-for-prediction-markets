"use client"

/**
 * Betting interface panel
 * Allows users to select outcome, adjust stake, and place bets
 */

import { useState, useEffect } from "react"
import type { ApiResponse } from "../types"
import { calculateTotalReturn } from "../utils/formatting"

interface BetPanelProps {
  apiResponse: ApiResponse
  onPlaceBet: (apiResponse: ApiResponse, outcomeIndex: number, stake: number) => void
}

export default function BetPanel({ apiResponse, onPlaceBet }: BetPanelProps) {
  const { polymarketInfo } = apiResponse
  const [selectedOutcome, setSelectedOutcome] = useState(polymarketInfo.bettingOn)
  const [stake, setStake] = useState(polymarketInfo.numbers[polymarketInfo.bettingOn].stake.amount)

  // Update stake when outcome changes
  useEffect(() => {
    setStake(polymarketInfo.numbers[selectedOutcome].stake.amount)
  }, [selectedOutcome, polymarketInfo])

  const currentStakeInfo = polymarketInfo.numbers[selectedOutcome]
  const isStakeValid = stake >= currentStakeInfo.stake.min && stake <= currentStakeInfo.stake.max
  const totalReturn = calculateTotalReturn(stake, currentStakeInfo.skim, currentStakeInfo.price)

  const getOutcomeDescription = () => {
    // might be ai generated mistake const teamName = getTeamName(selectedOutcome, polymarketInfo.homeTeam, polymarketInfo.awayTeam)
    let outcomeText = ""

    if (selectedOutcome === 0) {
      outcomeText = `home win for ${polymarketInfo.homeTeam}`
    } else if (selectedOutcome === 1) {
      outcomeText = "a draw"
    } else {
      outcomeText = `away win for ${polymarketInfo.awayTeam}`
    }

    return `Your bet wins if ${outcomeText} happens in regulation time, and loses if either of the other two outcomes happens. Only the result within regulation time counts.`
  }

  return (
    <div className="mt-4 bg-slate-800 rounded-xl p-6 border border-slate-700">
      {/* Game Image */}
      <img
        src={polymarketInfo.pic || "/placeholder.svg"}
        alt="Match preview"
        className="w-full max-w-md mx-auto rounded-lg mb-6"
      />

      {/* Outcome Selection */}
      <div className="mb-6">
        <div className="text-sm font-semibold mb-2 text-slate-300">Select Outcome:</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedOutcome(0)}
            className={`py-3 px-4 rounded-lg font-medium transition-colors text-center break-words ${
              selectedOutcome === 0 ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {polymarketInfo.homeTeam}
          </button>
          <button
            onClick={() => setSelectedOutcome(1)}
            className={`py-3 px-4 rounded-lg font-medium transition-colors text-center break-words ${
              selectedOutcome === 1 ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Draw
          </button>
          <button
            onClick={() => setSelectedOutcome(2)}
            className={`py-3 px-4 rounded-lg font-medium transition-colors text-center break-words ${
              selectedOutcome === 2 ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {polymarketInfo.awayTeam}
          </button>
        </div>
      </div>

      {/* Stake Input */}
      <div className="mb-6">
        <label className="text-sm font-semibold mb-2 block text-slate-300">Stake Amount:</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number.parseFloat(e.target.value) || 0)}
          step="0.01"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
        />
        {!isStakeValid && (
          <div className="mt-2 text-red-400 text-sm">
            Stake must be between {currentStakeInfo.stake.min} and {currentStakeInfo.stake.max}
          </div>
        )}
      </div>

      {/* Total Return */}
      <div className="mb-6 bg-slate-900 rounded-lg p-4">
        <div className="text-sm text-slate-400 mb-1">Total return if your bet wins:</div>
        <div className="text-2xl font-bold text-green-400">{totalReturn.toFixed(2)}</div>
      </div>

      {/* Outcome Explanation */}
      <div className="mb-6 text-sm text-slate-300 bg-slate-900 rounded-lg p-4">{getOutcomeDescription()}</div>

      {/* Place Bet Button */}
      <button
        onClick={() => onPlaceBet(apiResponse, selectedOutcome, stake)}
        disabled={!isStakeValid}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
      >
        {isStakeValid ? "Place Bet" : "Invalid Stake Amount"}
      </button>
    </div>
  )
}
