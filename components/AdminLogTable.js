export default function AdminLogTable({ logs }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-card rounded-lg shadow-md">
        <thead className="bg-primary text-white">
          <tr>
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Admin</th>
            <th className="py-2 px-4 text-left">Veiksmas</th>
            <th className="py-2 px-4 text-left">Details</th>
            <th className="py-2 px-4 text-left">Data</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b last:border-none">
              <td className="py-2 px-4">{log.id}</td>
              <td className="py-2 px-4">{log.admin_user}</td>
              <td className="py-2 px-4">{log.action}</td>
              <td className="py-2 px-4">{JSON.stringify(log.details)}</td>
              <td className="py-2 px-4">{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
