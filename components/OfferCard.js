export default function OfferCard({ offer }) {
  return (
    <div className="bg-card rounded-xl shadow p-4 flex flex-col">
      <h2 className="font-bold text-lg">{offer.title}</h2>
      <p className="text-sm text-gray-500">{offer.description}</p>
      <iframe
        src={`https://partner-offer.com/iframe/${offer.offer_id_partner}`}
        className="mt-4 w-full h-60 border rounded-lg"
        title={offer.title}
      />
    </div>
  )
}
