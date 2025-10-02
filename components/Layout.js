import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import BannerAads from './BannerAads'
import BannerAadsLeft from './BannerAadsLeft'
import BannerAadsRight from './BannerAadsRight'
import { Transition } from '@headlessui/react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const router = useRouter()

  // Disable layout for anon policy pages
  const anonRoutes = ['/privacy-anon', '/terms-anon', '/contact-anon']
  if (anonRoutes.includes(router.pathname)) {
    return <>{children}</>
  }

  // DB settings for banners
  const [showSideBanners, setShowSideBanners] = useState(true)
  const [showBottomBanner, setShowBottomBanner] = useState(true)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchSettings() {
      const { data, error } = await supabase
        .from('settings')
        .select('show_side_banners, show_bottom_banner')
        .eq('id', 1)
        .single()
      if (!error && data && isMounted) {
        setShowSideBanners(!!data.show_side_banners)
        setShowBottomBanner(!!data.show_bottom_banner)
        setSettingsLoaded(true)
      } else if (isMounted) {
        // fallback: show banners if error
        setShowSideBanners(true)
        setShowBottomBanner(true)
        setSettingsLoaded(true)
      }
    }
    fetchSettings()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans relative">
      {/* Left Banner */}
      {settingsLoaded && showSideBanners && <BannerAadsLeft />}
      {/* Right Banner */}
      {settingsLoaded && showSideBanners && <BannerAadsRight />}
      {/* Main Content */}
      <Navbar />
      <Transition
        appear
        show={true}
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
      {/* Bottom Banner */}
      {settingsLoaded && showBottomBanner && <BannerAads />}
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
