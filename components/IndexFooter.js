import Image from "next/image";

export default function IndexFooter() {
  return (
    <footer className="bg-card text-white py-5 border-t border-blue-900 shadow-lg w-full">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        {/* Links */}
        <div className="flex flex-wrap gap-6 text-sm items-center justify-center">
          <a href="/privacy-anon" className="hover:underline opacity-80">Privacy Policy</a>
          <a href="/terms-anon" className="hover:underline opacity-80">Terms of Service</a>
          <a href="/contact-anon" className="hover:underline opacity-80">Contact</a>
        </div>
        {/* Social icons */}
        <div className="flex gap-4 items-center justify-center">
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
            href="mailto:axirewards@gmail.com"
            className="opacity-80 hover:opacity-100"
            aria-label="Email"
          >
            <Image src="/icons/email.png" alt="Email" width={24} height={24} />
          </a>
        </div>
        {/* Copyright */}
        <div className="text-xs opacity-70 text-center md:text-right">
          &copy; {new Date().getFullYear()} Axi Rewards. All rights reserved.
        </div>
      </div>
      <style jsx>{`
        .bg-card { background: #0B0B0B; }
        @media (max-width: 640px) {
          .max-w-3xl {
            flex-direction: column !important;
            gap: 12px !important;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
