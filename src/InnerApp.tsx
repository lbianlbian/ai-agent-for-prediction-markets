import { Buffer } from 'buffer';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {createTransferInstruction, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import NavBar from "./components/NavBar"
import ChatWindow from "./components/ChatWindow"
import BetSuccessModal from "./components/BetSuccessModal"
import VideoOverlay from './components/VideoOverlay';
import type { ApiResponse, Message } from "./types"
import { useState } from "react"
import { useConnection, useWallet } from '@solana/wallet-adapter-react';


const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const HOUSE_ATA = new PublicKey("G1g89Q3R98nGNMdPk1ZC6GMqwnMTEhybsDzX5NmzqwSx");
const USDC_DECIMALS = 6;

function InnerApp() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [messages, setMessages] = useState<Message[]>([])
  const [convId, setConvId] = useState<string | undefined>()
  const [defaultMatches, setDefaultMatches] = useState<any>()
  const [showBetModal, setShowBetModal] = useState(false)
  const [betDetails, setBetDetails] = useState<{
    apiResponse: ApiResponse
    outcomeIndex: number
    stake: number,
    txsig: string
  } | null>(null)

  function round(num: number, dec: number){
    return Math.round(num * 10**dec) / 10**dec;
  }

  /**
   * Handles placing a bet - logs the details and shows success modal
   */
  const handlePlaceBet = async (apiResponse: ApiResponse, outcomeIndex: number, stake: number) => {
    if(!connected || !publicKey){
      alert("Please connect your wallet to place a bet.");
      return;
    }
    let sourceResp = await connection.getTokenAccountsByOwner(publicKey, {mint: USDC_MINT});
    let source = sourceResp.value[0].pubkey;
    let betInstr = createTransferInstruction(
      source,
      HOUSE_ATA,  // DESTINATION
      publicKey,  // owner of the source
      Math.round(stake * 10**USDC_DECIMALS),  // amount
      [],  // multisigners, not applicable to this
      TOKEN_PROGRAM_ID
    );

    let polymarketInfo = apiResponse.polymarketInfo;
    let skim = polymarketInfo.numbers[polymarketInfo.bettingOn].skim;
    let price = polymarketInfo.numbers[polymarketInfo.bettingOn].price;
    let totalReturn = stake * (1 - skim) / price;
    let bettingOptions = [polymarketInfo.homeTeam, "draw", polymarketInfo.awayTeam];
    let bettingTeam = bettingOptions[polymarketInfo.bettingOn];
    let eventName = `${polymarketInfo.homeTeam} vs. ${polymarketInfo.awayTeam}`;
    let messageObj = {
      bet: round(stake, 2),
      for: round(totalReturn, 2),
      on: bettingTeam,
      in: eventName,
      at: polymarketInfo.startTime
    };
    let memoInstr = new TransactionInstruction({
      keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],  // only need payer
      data: Buffer.from(JSON.stringify(messageObj), "utf-8"),
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    });
    
    let transaction = new Transaction();
    transaction.add(betInstr);
    transaction.add(memoInstr);
    const signature = await sendTransaction(transaction, connection);
    try{
      await connection.confirmTransaction(signature);
      const status = await connection.getSignatureStatus(signature, {
          searchTransactionHistory: true
      });
      if (status.value?.err) {
          throw Error("tx was confirmed but was a failed tx, please contact us");
      }
    } catch(err){
      throw Error("tx was not confirmed, please contact us");
    }
    console.log({ apiResponse, outcomeIndex, stake })
    // handle sending the solana tx here 
    setBetDetails({ apiResponse, outcomeIndex, stake, txsig: signature })
    setShowBetModal(true);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      <ChatWindow
        messages={messages}
        setMessages={setMessages}
        convId={convId}
        setConvId={setConvId}
        defaultMatches={defaultMatches}
        setDefaultMatches={setDefaultMatches}
        onPlaceBet={handlePlaceBet}
      />
      {showBetModal && betDetails && <BetSuccessModal betDetails={betDetails} onClose={() => setShowBetModal(false)} />}
        <VideoOverlay messages={messages}/>
    </div>
  )
}

export default InnerApp;