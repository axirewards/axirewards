import { useEffect } from 'react'
import Layout from '../components/Layout'

export default function Terms({ setGlobalLoading }) {
  // Enable global loading spinner on mount for UX consistency
  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true)
    const timer = setTimeout(() => {
      if (typeof setGlobalLoading === "function") setGlobalLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [setGlobalLoading])

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl py-12 px-6 md:px-10 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-accent mb-8 text-center drop-shadow">Terms of Service</h1>
          <div className="text-blue-900 text-lg space-y-6 text-left font-semibold">
            <p>
              Welcome to Axi Rewards!
              By accessing or using our platform, you agree to be bound by these Terms of Service.
              Please read them carefully.
            </p>
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <b>Eligibility:</b> You must be at least 18 years old or the legal age of majority in your jurisdiction to use Axi Rewards.
              </li>
              <li>
                <b>Account Registration:</b> You agree to provide accurate information and keep your account secure. Multiple accounts per individual are not permitted.
              </li>
              <li>
                <b>Use of Service:</b> You may not use Axi Rewards for any unlawful, fraudulent, or abusive purposes. All activity must comply with local laws.
              </li>
              <li>
                <b>Rewards & Offers:</b> All rewards, payouts, and offers are subject to availability and may change at any time without notice. We reserve the right to modify or remove offers as needed.
              </li>
              <li>
                <b>Payouts:</b> Payouts will be processed according to our payout schedule. You are responsible for providing accurate wallet and payment details.
              </li>
              <li>
                <b>Account Termination:</b> We reserve the right to suspend or terminate accounts that violate these terms, or for any suspicious or fraudulent activity.
              </li>
              <li>
                <b>Privacy:</b> Your information is handled according to our <a href="/privacy" className="underline hover:text-blue-700">Privacy Policy</a>.
              </li>
              <li>
                <b>Limitation of Liability:</b> Axi Rewards is not liable for any damages or losses arising from the use of our platform. Use at your own risk.
              </li>
              <li>
                <b>Changes to Terms:</b> We may update these Terms of Service at any time. Continued use of Axi Rewards after changes means you accept the new terms.
              </li>
              <li>
                <b>Contact:</b> For questions or support, contact us at <a href="mailto:axirewards@gmail.com" className="underline hover:text-blue-700">axirewards@gmail.com</a>.
              </li>
            </ol>
            <p className="text-center mt-8 text-sm text-blue-800">
              Last updated: 2025-09-30
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .bg-white { background-color: #fff; }
        .text-accent { color: #60A5FA; }
      `}</style>
    </Layout>
  )
}
