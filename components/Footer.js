import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-card text-white py-6 mt-8 border-t border-blue-900 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        {/* Left: Nuorodos */}
        <div className="flex flex-wrap gap-6 text-sm">
          <a href="/privacy" className="hover:underline opacity-80">Privacy Policy</a>
          <a href="/terms" className="hover:underline opacity-80">Terms of Service</a>
          <a href="/contact" className="hover:underline opacity-80">Contact</a>
        </div>
        {/* Middle: Social icons */}
        <div className="flex gap-4">
          <a
            href="https://instagram.com/axirewards"
            target="_blank"
            rel="noopener"
            className="opacity-80 hover:opacity-100"
            aria-label="Instagram"
          >
            <Image src="/icons/instagram.png" alt="Instagram" width={24} height={24} />
          </a>
          <a
            href="https://twitter.com/axirewards"
            target="_blank"
            rel="noopener"
            className="opacity-80 hover:opacity-100"
            aria-label="Twitter"
          >
            <Image src="/icons/twitter.png" alt="Twitter" width={24} height={24} />
          </a>
          <a
            href="mailto:support@axirewards.com"
            className="opacity-80 hover:opacity-100"
            aria-label="Email"
          >
            <Image src="/icons/email.png" alt="Email" width={24} height={24} />
          </a>
        </div>
        {/* Right: Copyright */}
        <div className="text-xs opacity-70">
          &copy; {new Date().getFullYear()} Axi Rewards. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
