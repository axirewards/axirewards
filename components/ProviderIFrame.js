export default function ProviderIframe({ url, height = '700px' }) {
  if (!url) return null
  return (
    <div className="w-full mb-6">
      <iframe
        src={url}
        className="w-full rounded-lg shadow-md"
        style={{ height }}
        frameBorder="0"
        scrolling="no"
        title="Offerwall"
      />
    </div>
  )
}
