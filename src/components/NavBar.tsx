"use client"

import { useState } from "react"
import {WalletMultiButton} from '@solana/wallet-adapter-react-ui';

const TWITTER_URL = "https://twitter.com/solgol_en";
const DISCORD_URL = "https://discord.gg/CANsQHPuGM";

/**
 * Top navigation bar component
 * Contains app branding and external links with responsive hamburger menu
 */

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-purple-400">SolGol</div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Discord
          </a>
          <a
            href={TWITTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Twitter
          </a>
          <WalletMultiButton />
        </div>

        {/* mobile */}
        <div className="md:hidden flex items-center gap-3">
          <WalletMultiButton />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-700 flex flex-col gap-3">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors text-center py-2"
          >
            Discord
          </a>
          <a
            href={TWITTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors text-center py-2"
          >
            Twitter
          </a>
        </div>
      )}
    </nav>
  )
}
