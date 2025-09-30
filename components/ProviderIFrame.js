import { useState } from 'react'

export default function ProviderIframe({
  url,
  height = '400px',
  offer, // expects { title, description, steps, payout_points, detailsUrl }
}) {
  const [showDetails, setShowDetails] = useState(false)

  if (!url) return null

  // Responsive iframe container and overlay modal styles
  return (
    <div className="w-full relative mb-6 flex flex-col items-center">
      {/* Offer Card Shadow + Clickable Overlay */}
      <div className="w-full relative max-w-2xl mx-auto">
        <div
          className="absolute inset-0 z-20 cursor-pointer bg-black/0 hover:bg-black/15 transition rounded-lg"
          onClick={() => setShowDetails(true)}
          title="View Offer Details"
        />
        <iframe
          src={url}
          className="w-full rounded-lg shadow-lg min-h-[320px] max-h-[600px] md:min-h-[400px] md:max-h-[700px] border border-gray-900"
          style={{ height }}
          frameBorder="0"
          scrolling="no"
          title="Offerwall"
        />
        <span className="absolute bottom-2 right-3 bg-accent px-2 py-1 rounded text-xs font-bold text-white shadow pointer-events-none">Tap for details</span>
      </div>

      {/* Offer Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border border-accent relative flex flex-col items-center animate-fade-in">
            <button
              className="absolute right-5 top-5 text-accent text-2xl font-bold hover:text-blue-700 transition"
              onClick={() => setShowDetails(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-extrabold text-accent mb-3 text-center">{offer?.title || "Offer Details"}</h2>
            <p className="text-base text-blue-900 font-semibold mb-3 text-center">{offer?.description}</p>
            {/* Steps / Instructions */}
            {offer?.steps && Array.isArray(offer.steps) && offer.steps.length > 0 && (
              <div className="w-full mb-3">
                <h3 className="text-md text-accent font-bold mb-2 text-left">How to complete:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-900 text-sm">
                  {offer.steps.map((step, idx) => (
                    <li key={idx} className="bg-blue-50 rounded px-3 py-2">{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {/* Points Table */}
            {(offer?.payout_points || offer?.pointsTable) && (
              <div className="w-full mb-3">
                <h3 className="text-md text-accent font-bold mb-2 text-left">Reward:</h3>
                <div className="w-full bg-blue-50 rounded-lg px-4 py-2 flex items-center justify-between font-bold text-blue-900 text-md shadow border border-accent">
                  <span>Points:</span>
                  <span className="text-accent">{offer?.payout_points || (offer?.pointsTable && offer.pointsTable.join(', '))}</span>
                </div>
              </div>
            )}
            {/* External Details / More Info */}
            {offer?.detailsUrl && (
              <a
                href={offer.detailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-sm text-accent underline my-2"
              >
                More info
              </a>
            )}
            {/* Start Offer Button */}
            <button
              className="mt-6 bg-accent text-white font-extrabold px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition text-lg w-full"
              onClick={() => {
                window.open(url, '_blank')
                setShowDetails(false)
              }}
            >
              START OFFER &gt;
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-card { background-color: #0B0B0B; }
        .bg-accent { background-color: #60A5FA; }
        .text-accent { color: #60A5FA; }
        .animate-fade-in {
          animation: fadeInModal 0.25s cubic-bezier(.23,1,.32,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  )
}
