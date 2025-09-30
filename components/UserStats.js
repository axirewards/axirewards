export default function UserStats({ user }) {
  return (
    <div className="bg-card shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-4">Jūsų statistika</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-accent rounded">
          <p className="text-sm text-white">Taškai</p>
          <p className="text-2xl font-bold text-white">{user.points_balance}</p>
        </div>
        <div className="p-4 bg-secondary rounded">
          <p className="text-sm text-white">Užbaigti Offeriai</p>
          <p className="text-2xl font-bold text-white">{user.completed_offers || 0}</p>
        </div>
        <div className="p-4 bg-primary rounded">
          <p className="text-sm text-white">Vartotojo lygis</p>
          <p className="text-2xl font-bold text-white">{user.tier}</p>
        </div>
      </div>
    </div>
  )
}
