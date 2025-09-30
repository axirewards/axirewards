import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import OfferCard from '../components/OfferCard'
import Navbar from '../components/Navbar'
import PayoutForm from '../components/PayoutForm'

export default function Dashboard() {
  const [offers, setOffers] = useState([])
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase.from('offers').select('*').eq('status', 'active')
      setOffers(data)
    }
    fetchOffers()
  }, [])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return
      const { data } = await supabase.from('transactions').select('points').eq('user_id', user.id)
      const total = data.reduce((sum, t) => sum + t.points, 0)
      setBalance(total)
    }
    fetchBalance()
  }, [user])

  return (
    <div>
      <Navbar user={user} balance={balance} />
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </main>
      <PayoutForm user={user} balance={balance} />
    </div>
  )
  }
