import Image from 'next/image'

export default function ContactAnon() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center">
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl py-12 px-6 md:px-10 flex flex-col items-center">
        {/* Contact Icon */}
        <div className="mb-6">
          <Image
            src="/icons/email.png"
            alt="Contact us"
            width={64}
            height={64}
            className="drop-shadow-lg"
          />
        </div>
        <h1 className="text-4xl font-extrabold text-accent mb-6 text-center drop-shadow">Contact Us (Anonymous)</h1>
        <p className="text-lg text-blue-900 mb-6 text-center max-w-lg font-semibold">
          If you encounter any issues or have questions, please contact us directly by email.<br />
          Our support team responds within <span className="font-bold text-accent">24 hours</span>.<br />
          <span className="block mt-2 font-bold text-accent">
            Email: <a href="mailto:axirewards@gmail.com" className="underline hover:text-blue-700 transition">axirewards@gmail.com</a>
          </span>
          <span className="block text-sm text-blue-800 mt-2">
            Support hours: 08:00 - 19:00 CET
          </span>
        </p>
        <div className="mt-4 text-sm text-blue-800 text-center">
          We’re always here to help.<br />
          <span className="block mt-2 font-semibold text-accent animate-pulse">
            Live chat and additional contact options coming soon!
          </span>
        </div>
      </div>
      <style jsx>{`
        .bg-white {
          background-color: #fff;
        }
        .text-accent {
          color: #60A5FA;
        }
      `}</style>
    </div>
  )
}
