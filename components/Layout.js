import Navbar from './Navbar'
import Footer from './Footer'
import { Transition } from '@headlessui/react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      <Transition
        appear
        show={true}
        enter="transition-opacity transition-transform duration-500 ease-in-out"
        enterFrom="opacity-0 translate-y-6"
        enterTo="opacity-100 translate-y-0"
      >
        <main
          role="main"
          className="
            flex-grow
            max-w-7xl
            mx-auto
            w-full
            lg:px-8
            md:px-6
            sm:px-4
            py-6
            bg-background
            rounded-xl
            shadow-xl
            transition hover:shadow-2xl focus:shadow-2xl
          "
          tabIndex={-1}
        >
          {children}
        </main>
      </Transition>
      <Footer />
    </div>
  )
}
