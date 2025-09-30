import '../styles/globals.css'
import { supabase } from '../lib/supabaseClient'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} supabase={supabase} />
}

export default MyApp
