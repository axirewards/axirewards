import Layout from '../components/Layout'
import Image from 'next/image'

export default function Contact() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card rounded-xl shadow-lg py-12 px-4 md:px-8">
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
        <h1 className="text-3xl font-extrabold text-primary mb-4 text-center">Contact Us</h1>
        <p className="text-lg text-primary mb-6 text-center max-w-lg">
          If you encounter any issues or have questions, please contact us directly by email.<br />
          Our support team responds within <span className="font-semibold text-primary">24 hours</span>.<br />
          <span className="block mt-2 font-semibold text-primary">
            Email: <a href="mailto:axirewards@gmail.com" className="underline hover:text-blue-700">axirewards@gmail.com</a>
          </span>
          <span className="block text-sm text-primary mt-2">
            Support hours: 08:00 - 19:00 CET
          </span>
        </p>
        <div className="mt-4 text-sm text-primary text-center">
          We’re always here to help. Future options for live chat and more contact methods coming soon!
        </div>
      </div>
    </Layout>
  )
}
