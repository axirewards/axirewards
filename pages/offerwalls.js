import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import AyetOfferwall from "../components/AyetOfferwall";
import CpaLeadOfferwall from "../components/CpaLeadOfferwall"; // pridėta
import { supabase } from "../lib/supabaseClient";

// Offerwalls providers list (expandable in future)
const OFFERWALL_PROVIDERS = [
  {
    key: "ayet",
    name: "Ayet Studios",
    logo: "/icons/ayetlogo.png",
    color: "#60A5FA",
    adSlot: "23274",
    description: "Try apps, games & tasks for AXI rewards.",
  },
  {
    key: "cpalead",
    name: "CPA Lead",
    logo: "/icons/cpalead.png",
    color: "#5AF599",
    iframeUrl: "https://www.mobtrk.link/list/Zkc2uVm",
    description: "Exclusive offers, apps & bonuses.",
  },
  // Future providers can be added here
];

export default function Offerwalls({ setGlobalLoading }) {
  const router = useRouter();
  const [enabledKeys, setEnabledKeys] = useState([]);
  const [activeOfferwall, setActiveOfferwall] = useState(null);

  // Redirect to /index if not authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/index');
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true);
    const fetchEnabled = async () => {
      // Get enabled providers from Supabase partners (is_enabled)
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

  // Only show enabled offerwall providers
  const filteredProviders = OFFERWALL_PROVIDERS.filter((p) =>
    enabledKeys.includes(p.key)
  );

  // Identical cube layout as dashboard/surveys
  const cardClass =
    "bg-card rounded-2xl shadow-lg flex flex-col items-center animate-fade-in border border-gray-900 cursor-pointer transition hover:scale-105 hover:shadow-2xl offerwall-cube";
  const sectionTitleClass =
    "mb-6 text-2xl font-bold text-white text-center tracking-tight";

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start min-h-[90vh] max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6">
        <h1 className="text-4xl font-extrabold text-white text-center drop-shadow mb-3">
          Offerwalls
        </h1>
        <div className="w-full mt-8 flex flex-col items-center justify-center">
          <h2 className={sectionTitleClass}>Available Offerwalls</h2>
          <div className="flex flex-wrap gap-8 justify-center items-center mt-4 w-full">
            {filteredProviders.map((provider) => (
              <div
                key={provider.key}
                className={cardClass}
                onClick={() => setActiveOfferwall(provider.key)}
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
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ pointerEvents: "none" }}
                />
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
            {/* Placeholder for future offerwalls */}
            {OFFERWALL_PROVIDERS.filter(
              (p) => !filteredProviders.includes(p)
            ).length > 0 && (
              <div className={cardClass + " opacity-70 pointer-events-none"}>
                <div
                  className="flex flex-col items-center justify-center w-full h-full"
                  style={{ minHeight: "150px" }}
                >
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
                    More offerwalls coming soon
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    Stay tuned for new providers!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal: open offerwall provider */}
          {activeOfferwall && (
            <div className="fixed inset-0 z-[1001] bg-black/70 flex items-center justify-center backdrop-blur">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-accent max-w-3xl w-full p-6 relative flex flex-col items-center animate-fade-in">
                <button
                  className="absolute top-3 right-4 text-accent text-3xl font-extrabold hover:text-blue-700 transition"
                  onClick={() => setActiveOfferwall(null)}
                  aria-label="Close"
                >
                  &times;
                </button>
                {activeOfferwall === "ayet" && (
                  <AyetOfferwall adSlot={OFFERWALL_PROVIDERS.find((p) => p.key === "ayet").adSlot} height="700px" />
                )}
                {activeOfferwall === "cpalead" && (
                  <CpaLeadOfferwall height="700px" iframeUrl={OFFERWALL_PROVIDERS.find((p) => p.key === "cpalead").iframeUrl} />
                )}
                {/* Future offerwalls iframe/modal here */}
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
