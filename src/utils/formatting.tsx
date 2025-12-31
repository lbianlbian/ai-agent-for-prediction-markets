/**
 * Formats markdown-like text to HTML
 */
export function formatMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />")
}

/**
 * Gets the team name based on the outcome index
 */
export function getTeamName(outcomeIndex: number, homeTeam: string, awayTeam: string): string {
  if (outcomeIndex === 0) return homeTeam
  if (outcomeIndex === 1) return "Draw"
  return awayTeam
}

/**
 * Calculates the total return based on stake, skim, and price
 */
export function calculateTotalReturn(stake: number, skim: number, price: number): number {
  return stake * (1 - skim) / price
}

/**
 * Truncates a URL in the middle for mobile display
 * Example: https://example.com/very/long/path -> https://exam...ng/path
 */
export function truncateUrl(url: string, maxLength = 35): string {
  if (url.length <= maxLength) return url

  const start = Math.floor(maxLength / 2)
  const end = Math.floor(maxLength / 2) - 3

  return `${url.slice(0, start)}...${url.slice(-end)}`
}
