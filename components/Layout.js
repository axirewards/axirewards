import Navbar from './Navbar'
import Footer from './Footer'
import { Transition } from '@headlessui/react'
import { useState, useEffect } from 'react'
import MiniLoadingSpinner from './MiniLoadingSpinner'

export default function Layout({ children }) {
  // Simulated global loading state for demo, replace with your own global loading logic (Redux, Context, etc)
  const [loading, setLoading] = useState(false);

  // Example: show spinner for 1s on mount (replace/remove for real usage)
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans relative">
      <Navbar />
      <MiniLoadingSpinner loading={loading} />
      <Transition
        appear
        show={!loading}
        enter="transition-opacity transition-transform duration-500 ease-in-out"
        enterFrom="opacity-0 translate-y-8 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
      >
        <main
          role="main"
          className="
            flex-grow
            min-h-[60vh]
            w-full
            max-w-7xl
            mx-auto
            px-2
            sm:px-4
            md:px-6
            lg:px-8
            py-6
            bg-background
            rounded-xl
            shadow-xl
            backdrop-blur-lg
            transition
            hover:shadow-2xl
            focus:shadow-2xl
          "
          tabIndex={-1}
        >
          {children}
        </main>
      </Transition>
      <Footer />
      <style jsx global>{`
        body {
          background-image: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #060a38 100%);
          background-attachment: fixed;
          background-size: cover;
          background-repeat: no-repeat;
        }
        @media (max-width: 640px) {
          body {
            background-image: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 70%, #060a38 100%);
          }
        }
      `}</style>
    </div>
  )
}
