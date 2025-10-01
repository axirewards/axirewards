import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import BitLabsOfferwall from "../components/BitLabsOfferwall";
import CpxOfferwall from "../components/CpxOfferwall";
import TheoremOfferwall from "../components/TheoremOfferwall";
import { supabase } from "../lib/supabaseClient";

const SURVEY_PROVIDERS = [
  {
    key: "bitlabs",
    name: "BitLabs",
    logo: "/icons/bitlabslogo.png",
    color: "#62D6FB",
    apiKey: "2dfb7d19-2974-4085-b686-181bcb681b70",
    description: "Complete surveys and earn AXI points with BitLabs.",
  },
  {
    key: "cpx",
    name: "CPX Research",
    logo: "/icons/cpxlogo.png",
    color: "#5AF599",
    appId: "29422",
    description: "Complete surveys and earn AXI points with CPX Research.",
  },
  {
    key: "theorem",
    name: "TheoremReach",
    logo: "/icons/theoremreachlogo.png",
    color: "#7b6cfb",
    appId: "24198",
    description: "Complete surveys and earn AXI points with TheoremReach.",
  },
];

export default function Surveys({ setGlobalLoading }) {
  const [enabledKeys, setEnabledKeys] = useState([]);
  const [activeSurvey, setActiveSurvey] = useState(null);

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

  // Only show enabled survey providers
  const filteredProviders = SURVEY_PROVIDERS.filter((p) =>
    enabledKeys.includes(p.key)
  );

  // Identical cube layout as dashboard
  const cardClass =
    "bg-card rounded-2xl shadow-lg flex flex-col items-center animate-fade-in border border-gray-900 cursor-pointer transition hover:scale-105 hover:shadow-2xl offerwall-cube";
  const sectionTitleClass =
    "mb-6 text-2xl font-bold text-white text-center tracking-tight";

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start min-h-[90vh] max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6">
        <div className="w-full mt-8 flex flex-col items-center justify-center">
          <h2 className={sectionTitleClass}>Survey Providers</h2>
          <div className="flex flex-wrap gap-8 justify-center items-center mt-4 w-full">
            {filteredProviders.map((provider) => (
              <div
                key={provider.key}
                className={cardClass}
                onClick={() => setActiveSurvey(provider.key)}
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
          </div>

          {/* Modal: open survey provider */}
          {activeSurvey && (
            <div className="fixed inset-0 z-[1001] bg-black/70 flex items-center justify-center backdrop-blur">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-accent max-w-3xl w-full p-6 relative flex flex-col items-center animate-fade-in">
                <button
                  className="absolute top-3 right-4 text-accent text-3xl font-extrabold hover:text-blue-700 transition"
                  onClick={() => setActiveSurvey(null)}
                  aria-label="Close"
                >
                  &times;
                </button>
                {activeSurvey === "bitlabs" && (
                  <BitLabsOfferwall apiKey={SURVEY_PROVIDERS.find((p) => p.key === "bitlabs").apiKey} height="700px" />
                )}
                {activeSurvey === "cpx" && (
                  <CpxOfferwall appId={SURVEY_PROVIDERS.find((p) => p.key === "cpx").appId} height="700px" />
                )}
                {activeSurvey === "theorem" && (
                  <TheoremOfferwall appId={SURVEY_PROVIDERS.find((p) => p.key === "theorem").appId} height="700px" />
                )}
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
