/**
 * TypeScript types and interfaces for the SolGol application
 */

export interface ApiStakeInfo {
  price: number
  skim: number
  stake: {
    amount: number
    max: number
    min: number
  }
}

export interface ApiPayload {
  query: string
  conv_id: string
  default_matches: any
}

export interface ApiAgentResp {
  response: string // may contain **markdown** and \n
  links: string[]
}

export interface ApiPolymarketInfo {
  startTime: string // ISO string
  pic: string // image URL
  homeTeam: string
  awayTeam: string
  bettingOn: number // 0 for home, 1 for draw, 2 for away
  tokAddrs: string[] // [home, draw, away]
  numbers: ApiStakeInfo[] // index 0: home, 1: draw, 2: away
}

export interface ApiResponse {
  payload: ApiPayload
  agentResp: ApiAgentResp
  polymarketInfo: ApiPolymarketInfo
}

export interface Message {
  role: "user" | "assistant"
  content: string
  apiResponse?: ApiResponse
}

export interface BetRecordPayload {
  bettor: {
    address: string // placeholder; to be filled later
    telegram: string // Telegram username or empty string
  }
  bet: {
    txsig: string // placeholder; to be filled later
    team: string // derived human-readable team/outcome label
    event_name: string // `${homeTeam} vs. ${awayTeam}`
    start_time: string // polymarketInfo.startTime
    numbers: {
      stake: number // stake user placed
      skim: number // polymarketInfo.numbers[x].skim
      potential_return: number // stake * (1 - skim) / price
    }
  }
  polymarket_info: {
    tok_addr: string // polymarketInfo.tokAddrs[x]
    price: number // polymarketInfo.numbers[x].price
  }
}
