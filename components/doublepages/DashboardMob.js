import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../Layout";
import AyetOfferwall from "../AyetOfferwall";
import BitLabsOfferwall from "../BitLabsOfferwall";
import CpxOfferwall from "../CpxOfferwall";
import TheoremOfferwall from "../TheoremOfferwall";
import CpaLeadOfferwall from "../CpaLeadOfferwall";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import UserStatsVipMobile from "../UserStatsVipMobile";
import OfferwallCarousel from "../OfferwallCarousel";
import AchievementWall from "../AchievementWall";

const OFFERWALLS = [
  {
    key: "ayet",
    name: "Ayet Studios",
    logo: "/icons/ayetlogo.png",
    color: "#60A5FA",
    adSlot: "23274",
    description: "Complete surveys, apps and tasks for premium AXI rewards.",
  },
  {
    key: "bitlabs",
    name: "Bit Labs",
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
    name: "Theorem Reach",
    logo: "/icons/theoremreachlogo.png",
    color: "#7b6cfb",
    appId: "24198",
    description: "Complete surveys and earn AXI points with TheoremReach.",
  },
  {
    key: "cpalead",
    name: "CPA Lead",
    logo: "/icons/cpalead.png",
    color: "#5AF599",
    iframeUrl: "https://www.mobtrk.link/list/Zkc2uVm",
    description: "Exclusive offers, apps & bonuses.",
  },
];

export default function DashboardMob({ setGlobalLoading }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [activeOfferwall, setActiveOfferwall] = useState(null);
  const [enabledKeys, setEnabledKeys] = useState([]);
  
  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true);
    const getData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push("/");
          return;
        }
        const userEmail = authData.user.email;
        let { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", userEmail)
          .single();
        if (userError && userError.code === "PGRST116") {
          const dummyPasswordHash = uuidv4();
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{ email: userEmail, password_hash: dummyPasswordHash, created_at: new Date() }])
            .select()
            .single();
          if (insertError) {
            console.error("Error creating user profile:", insertError);
            setError("Failed to create user profile. Contact support.");
            setUser({ email: userEmail });
          } else {
            userData = newUser;
          }
        } else if (userError) {
          console.error(userError);
          setError("Failed to fetch user profile.");
        }
        setUser(userData);

        // Ledger history
        const { data: ledgerData, error: ledgerError } = await supabase
          .from("ledger")
          .select("amount,balance_after,created_at")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: true });
        if (ledgerError) console.error(ledgerError);
        else setLedger(ledgerData || []);

        // Daily streak
        let currentStreak = 1;
        if (userData.last_login) {
          const lastLogin = new Date(userData.last_login);
          const today = new Date();
          const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
          currentStreak = diffDays === 1 ? (userData.streak || 0) + 1 : 1;
        }
        setStreak(currentStreak);

        await supabase
          .from("users")
          .update({ last_login: new Date(), streak: currentStreak })
          .eq("id", userData.id);

        // Fetch enabled partner keys from Supabase
        const { data: partnersData, error: partnersError } = await supabase
          .from("partners")
          .select("code")
          .eq("is_enabled", true);
        if (partnersError) {
          console.error("Error fetching enabled partners:", partnersError);
          setEnabledKeys([]);
        } else {
          setEnabledKeys(partnersData.map(p => p.code));
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Something went wrong.");
      } finally {
        if (typeof setGlobalLoading === "function") setGlobalLoading(false);
      }
    };
    getData();
  }, [router, setGlobalLoading]);

  const filteredOfferwalls = OFFERWALLS.filter(wall => enabledKeys.includes(wall.key));
  function handleOpenOfferwall(key) { setActiveOfferwall(key); }
  function getOfferwallParams(key) { return filteredOfferwalls.find(w => w.key === key); }

  // -- MOBILE APPSHELL --
  return (
    <Layout>
      <main
        className="relative flex flex-col items-center justify-start min-h-[100dvh] w-full max-w-full z-10"
        style={{
          padding: 0,
          margin: 0,
          width: '100vw',
          minHeight: '100dvh',
          boxSizing: 'border-box',
          background: 'none',
          overflowX: 'hidden'
        }}
      >
        {/* Headline */}
        <div className="w-full flex flex-col items-center justify-center mt-6 mb-2 px-2">
          {user && (
            <div className="w-full flex flex-col items-center justify-center">
              {/* Welcome row */}
              <div
                className="w-full flex items-center justify-center"
                style={{ marginBottom: "0.3rem" }}
              >
                <span
                  className="font-bold text-[2.05rem] md:text-3xl"
                  style={{
                    color: "#fff",
                    textShadow: "0 2px 18px #7b6cfb33, 0 1px 6px #181e3888",
                    WebkitTextStroke: "0.5px #fff",
                    letterSpacing: "0.04em",
                    fontWeight: 900,
                    lineHeight: "1.17",
                    fontFamily: "inherit",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Welcome,
                </span>
              </div>
              {/* Email row */}
              <div
                className="w-full flex items-center justify-center"
                style={{ marginBottom: "0.22rem" }}
              >
                <span
                  className="font-bold"
                  style={{
                    fontSize: "1.43rem",
                    background: "linear-gradient(90deg,#60A5FA 0%,#7b6cfb 50%,#FFD700 85%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 800,
                    letterSpacing: "0.07em",
                    textShadow: "0 1px 10px #FFD70033, 0 2px 8px #60A5fa33",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {user.email}
                </span>
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    paddingLeft: "7px",
                    textShadow: "0 1px 10px #60A5FA33",
                    fontSize: "1.08rem",
                  }}
                >
                  !
                </span>
              </div>
              {/* Subtitle */}
              <div className="w-full flex flex-col items-center mt-1 mb-0">
                <span
                  className="font-semibold text-center px-2"
                  style={{
                    fontSize: "0.88rem",
                    color: "#e5e7eb",
                    letterSpacing: "0.015em",
                    textShadow: "0 2px 8px #1e3a8a22",
                    fontFamily: "inherit",
                    maxWidth: "95vw",
                  }}
                >
                  Your AXI journey starts here. Unlock rewards, complete offers, level up, and join the ranks of top earners. Every action moves you closer to legendary status!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Stats / VIP */}
        {user && (
          <div className="w-full px-2" style={{ marginTop: '3vw', maxWidth: '100vw' }}>
            <UserStatsVipMobile />
          </div>
        )}

        {/* Offerwalls */}
        <section className="w-full flex flex-col items-center mt-6 mb-3 px-2" style={{ maxWidth: '100vw' }}>
          <h2 className="mb-3 text-xl font-bold text-white text-center tracking-tight"
            style={{
              letterSpacing: "0.05em",
              fontFamily: "inherit",
              paddingBottom: "2px",
              maxWidth: "92vw"
            }}>
            Premium Offerwalls
          </h2>
          <OfferwallCarousel offerwalls={filteredOfferwalls} onOpen={handleOpenOfferwall} />
        </section>

        {/* Achievement Wall */}
        <section className="w-full flex flex-col items-center justify-center" style={{ maxWidth: '100vw', marginTop: '5vw', marginBottom: '3vw' }}>
          {user && (
            <AchievementWall userId={user.id} />
          )}
        </section>

        {/* Offerwall Modal */}
        {activeOfferwall && (
          <div className="fixed inset-0 z-[1001] bg-black/85 flex items-center justify-center backdrop-blur-sm">
            <div
              className="glass-card rounded-2xl shadow-2xl border-4 border-accent max-w-[99vw] w-[99vw] p-1 flex flex-col items-center relative animate-fade-in"
              style={{
                minHeight: "70vh",
                maxHeight: "99vh",
                overflowY: "auto",
                boxSizing: "border-box"
              }}
            >
              <button
                className="absolute top-3 right-5 text-accent text-3xl font-extrabold hover:text-blue-700 transition"
                onClick={() => setActiveOfferwall(null)}
                aria-label="Close"
                style={{
                  background: "rgba(24,32,56,0.82)",
                  borderRadius: "1.4rem",
                  padding: "3px 13px",
                  zIndex: 2
                }}
              >
                &times;
              </button>
              {activeOfferwall === "ayet" && (
                <AyetOfferwall adSlot={getOfferwallParams("ayet")?.adSlot} height="600px" />
              )}
              {activeOfferwall === "bitlabs" && (
                <BitLabsOfferwall apiKey={getOfferwallParams("bitlabs")?.apiKey} height="600px" />
              )}
              {activeOfferwall === "cpx" && (
                <CpxOfferwall appId={getOfferwallParams("cpx")?.appId} height="600px" />
              )}
              {activeOfferwall === "theorem" && (
                <TheoremOfferwall appId={getOfferwallParams("theorem")?.appId} height="600px" />
              )}
              {activeOfferwall === "cpalead" && (
                <CpaLeadOfferwall height="600px" iframeUrl={getOfferwallParams("cpalead")?.iframeUrl} />
              )}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="w-full flex items-center justify-center mt-4">
            <span className="text-red-500 font-bold text-center text-sm" style={{ maxWidth: '90vw' }}>{error}</span>
          </div>
        )}
      </main>
      <style jsx>{`
        html, body, #__next {
          width: 100vw !important;
          min-height: 100dvh !important;
          overflow-x: hidden !important;
          box-sizing: border-box;
        }
        .glass-card {
          background: rgba(24, 32, 56, 0.94);
          backdrop-filter: blur(22px);
          border-radius: 1.5rem;
          box-shadow: 0 2px 32px 0 #60A5fa22, 0 1.5px 8px 0 #60A5fa33;
          border: 2.5px solid #60A5FA55;
        }
        .animate-fade-in {
          animation: fadeInModal 0.28s cubic-bezier(.23,1,.32,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98);}
          to { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </Layout>
  );
}
