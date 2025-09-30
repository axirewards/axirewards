import Layout from '../components/Layout'

export default function Terms() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card rounded-xl shadow-lg py-12 px-4 md:px-8">
        <h1 className="text-3xl font-extrabold text-primary mb-6 text-center">Terms of Service</h1>
        <div className="text-primary text-lg max-w-2xl mx-auto space-y-6 text-left">
          <p>
            Welcome to AxiRewards!
            By accessing or using our platform, you agree to be bound by these Terms of Service.
            Please read them carefully.
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <b>Eligibility:</b> You must be at least 18 years old or the legal age of majority in your jurisdiction to use AxiRewards.
            </li>
            <li>
              <b>Account Registration:</b> You agree to provide accurate information and keep your account secure. Multiple accounts per individual are not permitted.
            </li>
            <li>
              <b>Use of Service:</b> You may not use AxiRewards for any unlawful, fraudulent, or abusive purposes. All activity must comply with local laws.
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
              <b>Limitation of Liability:</b> AxiRewards is not liable for any damages or losses arising from the use of our platform. Use at your own risk.
            </li>
            <li>
              <b>Changes to Terms:</b> We may update these Terms of Service at any time. Continued use of AxiRewards after changes means you accept the new terms.
            </li>
            <li>
              <b>Contact:</b> For questions or support, contact us at <a href="mailto:axirewards@gmail.com" className="underline hover:text-blue-700">axirewards@gmail.com</a>.
            </li>
          </ol>
          <p className="text-center mt-8 text-sm">
            Last updated: 2025-09-30
          </p>
        </div>
      </div>
    </Layout>
  )
}
