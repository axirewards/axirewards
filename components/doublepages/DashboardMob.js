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
import UserStatsVip from "../UserStatsVip";
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
        <div className="w-full flex items-center justify-center mt-4 mb-1 px-2">
          {user && (
            <span
              className="font-extrabold text-[2.1rem] leading-tight text-center"
              style={{
                background: "linear-gradient(90deg, #7b6cfb 0%, #60A5FA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "0.065em",
                boxShadow: "0 2px 14px #60A5fa22",
                maxWidth: "96vw",
                overflowWrap: "break-word",
                textShadow: "0 1px 12px #232e40",
                padding: "0.5em 0.2em",
                borderRadius: "1.2rem"
              }}
            >
              Hey&nbsp;
              <span style={{
                color: "#FFD700",
                background: "none",
                WebkitBackgroundClip: "unset",
                WebkitTextFillColor: "unset",
                fontWeight: 900,
                letterSpacing: "0.08em",
                textShadow: "0 2px 12px #FFD70033, 0 1px 2px #181e38",
                fontSize: "1.05em"
              }}>{user.email.split("@")[0]}</span>
              , welcome to <span style={{
                color: "#7b6cfb",
                background: "none",
                WebkitBackgroundClip: "unset",
                WebkitTextFillColor: "unset",
                fontWeight: 800,
                letterSpacing: "0.07em",
                textShadow: "0 2px 8px #60A5FA77"
              }}>AXI Rewards!</span>
              <br />
              <span style={{
                display: "block",
                fontWeight: 500,
                fontSize: "1.09rem",
                color: "#CFE4FF",
                marginTop: "0.2em",
                opacity: 0.92,
                textShadow: "0 1px 4px #232e40"
              }}>
                Unlock offers, claim rewards, and rise up the leaderboard.
              </span>
            </span>
          )}
        </div>

        {/* User Stats / VIP */}
        {user && (
          <div className="w-full px-2" style={{ marginTop: '2vw', maxWidth: '100vw' }}>
            <UserStatsVip
              tier={user?.tier || 1}
              points={user?.points_balance || 0}
              streak={streak}
              completedOffers={user?.completed_offers || 0}
              size="compact-premium"
            />
          </div>
        )}

        {/* Offerwalls */}
        <section className="w-full flex flex-col items-center mt-5 mb-2 px-1" style={{ maxWidth: '100vw' }}>
          <h2 className="mb-2 text-[1.22rem] font-extrabold text-white text-center tracking-tight"
            style={{
              letterSpacing: "0.06em",
              fontFamily: "inherit",
              paddingBottom: "1px",
              maxWidth: "90vw"
            }}>
            Premium Offerwalls
          </h2>
          <OfferwallCarousel offerwalls={filteredOfferwalls} onOpen={handleOpenOfferwall} compact />
        </section>

        {/* Achievement Wall */}
        <section className="w-full flex flex-col items-center justify-center" style={{
          maxWidth: '100vw',
          marginTop: '3vw',
          marginBottom: '2vw',
          padding: "0 2vw"
        }}>
          {user && (
            <AchievementWall userId={user.id} />
          )}
        </section>

        {/* Offerwall Modal */}
        {activeOfferwall && (
          <div className="fixed inset-0 z-[1001] bg-black/90 flex items-center justify-center backdrop-blur-sm">
            <div
              className="glass-card rounded-2xl shadow-2xl border-4 border-accent max-w-[99vw] w-[99vw] p-1 flex flex-col items-center relative animate-fade-in"
              style={{
                minHeight: "62vh",
                maxHeight: "99vh",
                overflowY: "auto",
                boxSizing: "border-box"
              }}
            >
              <button
                className="absolute top-2.5 right-4 text-accent text-2xl font-extrabold hover:text-blue-700 transition"
                onClick={() => setActiveOfferwall(null)}
                aria-label="Close"
                style={{
                  background: "rgba(24,32,56,0.82)",
                  borderRadius: "1.2rem",
                  padding: "2px 10px",
                  zIndex: 2
                }}
              >
                &times;
              </button>
              {activeOfferwall === "ayet" && (
                <AyetOfferwall adSlot={getOfferwallParams("ayet")?.adSlot} height="520px" />
              )}
              {activeOfferwall === "bitlabs" && (
                <BitLabsOfferwall apiKey={getOfferwallParams("bitlabs")?.apiKey} height="520px" />
              )}
              {activeOfferwall === "cpx" && (
                <CpxOfferwall appId={getOfferwallParams("cpx")?.appId} height="520px" />
              )}
              {activeOfferwall === "theorem" && (
                <TheoremOfferwall appId={getOfferwallParams("theorem")?.appId} height="520px" />
              )}
              {activeOfferwall === "cpalead" && (
                <CpaLeadOfferwall height="520px" iframeUrl={getOfferwallParams("cpalead")?.iframeUrl} />
              )}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="w-full flex items-center justify-center mt-3">
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
          background: rgba(24, 32, 56, 0.97);
          backdrop-filter: blur(22px);
          border-radius: 1.2rem;
          box-shadow: 0 2px 28px 0 #60A5fa22, 0 1.5px 8px 0 #7b6cfb22;
          border: 2.5px solid #7b6cfb55;
        }
        .animate-fade-in {
          animation: fadeInModal 0.23s cubic-bezier(.23,1,.32,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.96);}
          to { opacity: 1; transform: scale(1);}
        }
        @media (max-width: 700px) {
          .glass-card {
            border-radius: 0.75rem;
            padding: 1vw !important;
          }
        }
      `}</style>
    </Layout>
  );
}
