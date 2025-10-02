export default function PrivacyAnon() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl py-12 px-6 md:px-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-accent mb-8 text-center drop-shadow">Privacy Policy (Anonymous)</h1>
        <div className="text-blue-900 text-lg space-y-6 text-left font-semibold">
          <p>
            At Axi Rewards, we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, and safeguard your information.
          </p>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <b>Information We Collect:</b> We collect information you provide during registration (such as email address and wallet address), as well as data related to your use of our services (like IP address and analytics).
            </li>
            <li>
              <b>How We Use Your Information:</b> Your information is used to operate and improve the platform, deliver rewards, process payouts, and provide support. We may also use data for analytics and service improvement.
            </li>
            <li>
              <b>Data Sharing:</b> We do not sell or share your personal information with third parties except as required by law, or to process rewards and payouts through trusted partners.
            </li>
            <li>
              <b>Cookies & Tracking:</b> We use cookies and similar technologies to enhance user experience and analytics. You can manage cookie preferences in your browser.
            </li>
            <li>
              <b>Data Security:</b> We take reasonable measures to protect your data from unauthorized access or disclosure.
            </li>
            <li>
              <b>Your Rights:</b> You may request access, correction, or deletion of your personal information at any time by contacting us at <a href="mailto:axirewards@gmail.com" className="underline">axirewards@gmail.com</a>.
            </li>
            <li>
              <b>International Users:</b> By using Axi Rewards, you consent to the processing of your data in accordance with this policy, regardless of where you are located.
            </li>
            <li>
              <b>Policy Updates:</b> We may update this Privacy Policy from time to time. Changes will be posted on this page, and continued use of Axi Rewards means you accept the updated terms.
            </li>
          </ol>
          <p className="text-center mt-8 text-sm text-blue-800">
            Last updated: 2025-09-30
          </p>
        </div>
      </div>
      <style jsx>{`
        .bg-white { background-color: #fff; }
        .text-accent { color: #60A5FA; }
      `}</style>
    </div>
  )
}
