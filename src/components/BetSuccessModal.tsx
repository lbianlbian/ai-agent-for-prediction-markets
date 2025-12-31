"use client"

/**
 * Post-bet success modal
 * Displays success message, explorer link, and collects optional Telegram username
 */

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react";
import { BET_EXPLORER_LINK } from "../config"
import { recordBet } from "../utils/api"
import type { BetRecordPayload } from "../types"
import { getTeamName, calculateTotalReturn } from "../utils/formatting"

interface BetSuccessModalProps {
  betDetails: {
    apiResponse: any
    outcomeIndex: number
    stake: number,
    txsig: string
  }
  onClose: () => void
}

export default function BetSuccessModal({ betDetails, onClose }: BetSuccessModalProps) {
  const [telegramUsername, setTelegramUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { publicKey } = useWallet();

  const { apiResponse, outcomeIndex, stake, txsig} = betDetails
  const { polymarketInfo } = apiResponse
  const stakeInfo = polymarketInfo.numbers[outcomeIndex]

  /**
   * Builds the bet record payload from the bet details
   */
  const buildBetRecordPayload = (telegram: string): BetRecordPayload => {
    const teamName = getTeamName(outcomeIndex, polymarketInfo.homeTeam, polymarketInfo.awayTeam)
    const potentialReturn = calculateTotalReturn(stake, stakeInfo.skim, stakeInfo.price)

    return {
      bettor: {
        // will never be undefined but have to do this for typescript
        address: publicKey ? publicKey?.toBase58() : "",  
        telegram,
      },
      bet: {
        txsig,
        team: teamName,
        event_name: `${polymarketInfo.homeTeam} vs. ${polymarketInfo.awayTeam}`,
        start_time: polymarketInfo.startTime,
        numbers: {
          stake,
          skim: stakeInfo.skim,
          potential_return: potentialReturn,
        },
      },
      polymarket_info: {
        tok_addr: polymarketInfo.tokAddrs[outcomeIndex],
        price: stakeInfo.price,
      },
    }
  }

  /**
   * Handles submission of telegram username and bet recording
   */
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = buildBetRecordPayload(telegramUsername)
      await recordBet(payload)
    } catch (error) {
      console.error("Error recording bet:", error)
    } finally {
      setIsSubmitting(false)
      onClose()
    }
  }

  /**
   * Handles skipping telegram username entry
   */
  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      const payload = buildBetRecordPayload("")
      await recordBet(payload)
    } catch (error) {
      console.error("Error recording bet:", error)
    } finally {
      setIsSubmitting(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green-400 mb-2">Bet placed successfully!</div>
          <a
            href={`${BET_EXPLORER_LINK}/tx/${txsig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline text-sm"
          >
            View on explorer
          </a>
        </div>

        <div className="mb-6">
          <p className="text-slate-300 mb-4">Please enter your Telegram username for bet updates (optional).</p>
          <input
            type="text"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            placeholder="Telegram username"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit username"}
          </button>
        </div>
      </div>
    </div>
  )
}
