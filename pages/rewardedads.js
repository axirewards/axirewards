import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";

// Example providers: hardcoded for now, can expand and add device_type field
const REWARDED_ADS_PROVIDERS = [
  {
    key: "adgate",
    name: "AdGate Media",
    logo: "/icons/adgate.png",
    color: "#3B82F6",
    device_type: "all", // "pc", "mobile", or "all"
    description: "Watch short ads & get instant AXI rewards.",
    // iframeUrl: "https://adgate.com/your-iframe-link"
  },
  {
    key: "adgem",
    name: "AdGem",
    logo: "/icons/adgem.png",
    color: "#F59E42",
    device_type: "mobile",
    description: "Exclusive mobile rewarded ads.",
    // iframeUrl: "https://adgem.com/your-iframe-link"
  },
  // ...future providers
];

function getDeviceType() {
  // Basic device detection (can be improved)
  if (typeof window !== "undefined") {
    if (/Mobi|Android/i.test(window.navigator.userAgent)) return "mobile";
  }
  return "pc";
}

export default function RewardedAds({ setGlobalLoading }) {
  const [enabledKeys, setEnabledKeys] = useState([]);
  const [activeAd, setActiveAd] = useState(null);
  const [deviceType, setDeviceType] = useState("pc");

  useEffect(() => {
    setDeviceType(getDeviceType());
    if (typeof setGlobalLoading === "function") setGlobalLoading(true);
    const fetchEnabled = async () => {
      const { data: partnersData, error: partnersError } = await supabase
        .from("partners")
        .select("code")
        .eq("is_enabled", true);
      if (partnersError) {
        setEnabledKeys([]);
      } else {
        setEnabledKeys(partnersData.map((p) => p.code));
      }
      if (typeof setGlobalLoading === "function") setGlobalLoading(false);
    };
    fetchEnabled();
  }, [setGlobalLoading]);

  // Show only enabled and device-compatible providers
  const filteredProviders = REWARDED_ADS_PROVIDERS.filter(
    (p) =>
      enabledKeys.includes(p.key) &&
      (p.device_type === "all" || p.device_type === deviceType)
  );

  const cardClass =
    "bg-card rounded-2xl shadow-lg flex flex-col items-center animate-fade-in border border-gray-900 cursor-pointer transition hover:scale-105 hover:shadow-2xl offerwall-cube";
  const sectionTitleClass =
    "mb-6 text-2xl font-bold text-white text-center tracking-tight";

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start min-h-[90vh] max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6">
        <h1 className="text-4xl font-extrabold text-white text-center drop-shadow mb-3">
          Rewarded Ads
        </h1>
        <div className="w-full mt-8 flex flex-col items-center justify-center">
          <h2 className={sectionTitleClass}>
            {deviceType === "mobile" ? "Mobile" : "PC"} Rewarded Ads
          </h2>
          <div className="flex flex-wrap gap-8 justify-center items-center mt-4 w-full">
            {filteredProviders.map((provider) => (
              <div
                key={provider.key}
                className={cardClass}
                onClick={() => setActiveAd(provider.key)}
                style={{
                  minWidth: "230px",
                  minHeight: "230px",
                  maxWidth: "300px",
                  maxHeight: "300px",
                  width: "33vw",
                  height: "33vw",
                  backdropFilter: "blur(8px)",
                }}
              >
                <img
                  src={provider.logo}
                  alt={provider.name + " logo"}
                  className="w-24 h-24 object-contain mb-2 opacity-85 drop-shadow-lg"
                  style={{
                    filter: `drop-shadow(0 0 16px ${provider.color})`,
                    marginTop: "18px",
                  }}
                />
                <div className="text-accent font-extrabold text-lg text-center mb-2">
                  {provider.name}
                </div>
                <div className="text-xs text-gray-400 px-2 text-center">
                  {provider.description}
                </div>
                <span className="absolute bottom-4 right-4 text-[11px] text-accent opacity-0 group-hover:opacity-100 transition">
                  Open
                </span>
              </div>
            ))}
            {/* Placeholder for future providers */}
            {filteredProviders.length === 0 && (
              <div className={cardClass + " opacity-70 pointer-events-none"}>
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                    <svg
                      width={36}
                      height={36}
                      fill="none"
                      viewBox="0 0 24 24"
                      className="text-gray-500"
                    >
                      <path
                        d="M12 7v5l3 3"
                        stroke="#999"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx={12}
                        cy={12}
                        r={10}
                        stroke="#999"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="text-gray-400 font-bold text-lg text-center mb-2">
                    More rewarded ads coming soon
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    Stay tuned for new providers!
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Modal: open rewarded ad */}
          {activeAd && (
            <div className="fixed inset-0 z-[1001] bg-black/70 flex items-center justify-center backdrop-blur">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-accent max-w-3xl w-full p-6 relative flex flex-col items-center animate-fade-in">
                <button
                  className="absolute top-3 right-4 text-accent text-3xl font-extrabold hover:text-blue-700 transition"
                  onClick={() => setActiveAd(null)}
                  aria-label="Close"
                >
                  &times;
                </button>
                {/* Example: show iframe/modal for provider (not implemented yet) */}
                {/* {activeAd === "adgate" && (
                  <iframe src={REWARDED_ADS_PROVIDERS.find((p) => p.key === "adgate").iframeUrl} width="100%" height="650px" />
                )} */}
                <div className="text-xl text-gray-700 font-bold text-center p-10">
                  Rewarded ads integration coming soon!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .bg-card { background-color: #0B0B0B; }
        .border-accent { border-color: #60A5FA; }
        .text-accent { color: #60A5FA; }
        .animate-fade-in {
          animation: fadeInModal 0.22s cubic-bezier(.23,1,.32,1);
        }
        .offerwall-cube {
          aspect-ratio: 1 / 1;
        }
        @media (max-width: 700px) {
          .offerwall-cube {
            min-width: 150px;
            min-height: 150px;
            width: 90vw;
            height: 90vw;
            max-width: 98vw;
            max-height: 98vw;
          }
        }
      `}</style>
    </Layout>
  );
}
