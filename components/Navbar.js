import { FaCoins } from 'react-icons/fa'

export default function Navbar({ user, balance }) {
  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold">FreeCrates</h1>
      <div className="flex items-center space-x-4">
        <span className="flex items-center gap-1"><FaCoins /> {balance}</span>
        <span>{user?.email}</span>
      </div>
    </nav>
  )
}
