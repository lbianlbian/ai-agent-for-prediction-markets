/**
 * API helper functions for chat analysis and bet recording
 */

import { ANALYZE_ENDPOINT, BET_RECORD_ENDPOINT } from "../config"
import type { ApiResponse, BetRecordPayload } from "../types"

/**
 * Builds the payload for the analyze API call
 * First message: only query
 * Subsequent messages: query + conv_id + default_matches
 */
export function buildAnalyzePayload(query: string, convId?: string, defaultMatches?: any): object {
  if (!convId) {
    return {
      query,
      conv_id: undefined,
      default_matches: undefined,
    }
  }
  return {
    query,
    conv_id: convId,
    default_matches: defaultMatches,
  }
}

/**
 * Calls the analyze API endpoint with the given query and conversation state
 */
export async function analyzeQuery(query: string, convId?: string, defaultMatches?: any): Promise<ApiResponse> {
  const payload = buildAnalyzePayload(query, convId, defaultMatches)
  const response = await fetch(ANALYZE_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Records a bet to the backend API
 */
export async function recordBet(payload: BetRecordPayload): Promise<void> {
  const response = await fetch(BET_RECORD_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Bet record API error: ${response.status}`)
  }
}
