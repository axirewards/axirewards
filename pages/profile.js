import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import UserStats from '../components/UserStats'
import { supabase } from '../lib/supabaseClient'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState('')
  const [completions, setCompletions] = useState([])

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single()
      if (userError) console.error(userError)
      else {
        setUser(userData)
        setWallet(userData.wallet_address || '')
      }

      // Fetch last 10 completions
      const { data: completionData, error: completionError } = await supabase
        .from('completions')
        .select('*, offers(title, description)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (completionError) console.error(completionError)
      else setCompletions(completionData)
    }

    fetchUser()
  }, [])

  const handleWalletUpdate = async () => {
    if (!wallet) return
    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: wallet })
      .eq('id', user.id)
      .select()
      .single()
    if (error) console.error(error)
    else setUser(data)
  }

  if (!user) return <Layout><p className="text-center mt-10">Loading...</p></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-primary">Profilis</h1>

        <UserStats user={user} />

        <div className="bg-white dark:bg-gray-800 shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-2 text-primary">Wallet adresas</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="flex-1 border border-gray-300 rounded p-2 dark:bg-gray-700 dark:text-white"
              placeholder="Įveskite savo crypto wallet"
            />
            <button
              onClick={handleWalletUpdate}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Išsaugoti
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-2 text-primary">Paskutinės užbaigtos užduotys</h2>
          {completions.length === 0 ? (
            <p>Nėra įrašų</p>
          ) : (
            <ul className="space-y-2">
              {completions.map((c) => (
                <li key={c.id} className="border-b border-gray-200 dark:border-gray-700 py-2">
                  <p className="font-semibold">{c.offers?.title || 'Offer pavadinimas'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{c.offers?.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gauta taškų: {c.credited_points}</p>
                  <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}
