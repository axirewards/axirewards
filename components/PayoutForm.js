import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PayoutForm({ user, balance }) {
  const [wallet, setWallet] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (amount > balance) return alert('Insufficient balance')
    const { error } = await supabase.from('payouts').insert([{ user_id: user.id, wallet_address: wallet, points_amount: amount }])
    if (error) return alert('Error submitting payout')
    alert('Payout requested!')
    setAmount('')
    setWallet('')
  }

  return (
    <div className="fixed bottom-0 right-0 m-6 p-4 bg-primary text-white rounded-xl shadow-lg w-80">
      <h3 className="font-bold mb-2">Request Payout</h3>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input type="text" placeholder="Wallet address" value={wallet} onChange={(e) => setWallet(e.target.value)} className="p-2 rounded text-black"/>
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="p-2 rounded text-black"/>
        <button type="submit" className="bg-accent text-white py-2 rounded hover:bg-blue-500 transition">Request</button>
      </form>
    </div>
  )
}
