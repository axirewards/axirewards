export default function UserStats({ user }) {
  return (
    <div className="bg-card shadow-md rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-bold text-primary mb-4">Your Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-accent shadow flex flex-col items-center">
          <p className="text-sm text-white mb-2">Points Balance</p>
          <p className="text-3xl font-extrabold text-white drop-shadow">{user.points_balance}</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary shadow flex flex-col items-center">
          <p className="text-sm text-white mb-2">Completed Offers</p>
          <p className="text-3xl font-extrabold text-white drop-shadow">{user.total_completion}</p>
        </div>
        <div className="p-4 rounded-xl bg-primary shadow flex flex-col items-center">
          <p className="text-sm text-white mb-2">User Level</p>
          <p className="text-3xl font-extrabold text-white drop-shadow">{user.tier}</p>
        </div>
      </div>
    </div>
  )
}
