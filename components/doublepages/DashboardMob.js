import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../Layout";
import AyetOfferwall from "../AyetOfferwall";
import BitLabsOfferwall from "../BitLabsOfferwall";
import CpxOfferwall from "../CpxOfferwall";
import TheoremOfferwall from "../TheoremOfferwall";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import UserStatsVip from "../UserStatsVip";
import OfferwallCarousel from "../OfferwallCarousel";
import AchievementWall from "../AchievementWall";
import FloatingActionButton from "../FloatingActionButton";

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

export default function DashboardMob({ setGlobalLoading }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [activeOfferwall, setActiveOfferwall] = useState(null);
  const [enabledKeys, setEnabledKeys] = useState([]);
  const [showFAB, setShowFAB] = useState(true); // mobile visada rodom FAB

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
    // Mobile - visada FAB
    setShowFAB(true);
  }, [router, setGlobalLoading]);

  const filteredOfferwalls = OFFERWALLS.filter(wall => enabledKeys.includes(wall.key));
  function handleOpenOfferwall(key) { setActiveOfferwall(key); }
  function getOfferwallParams(key) { return filteredOfferwalls.find(w => w.key === key); }

  return (
    <Layout>
      <div className="relative flex flex-col items-center justify-start min-h-screen w-full z-10 bg-gradient-to-br from-blue-900 via-accent to-black px-0 pt-0"
        style={{ maxWidth: "100vw", width: "100vw", paddingBottom: "80px" }}>
        {/* Headline */}
        <div className="w-full flex items-center justify-center mt-5 mb-2">
          {user && (
            <span
              className="font-bold text-2xl text-white drop-shadow text-center py-3 px-6 rounded-xl"
              style={{
                background: "linear-gradient(90deg, #60A5FA 0%, #7b6cfb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "0.055em",
                boxShadow: "0 2px 14px #60A5fa22",
              }}
            >
              Welcome, <span style={{
                color: "#FFD700",
                background: "none",
                WebkitBackgroundClip: "unset",
                WebkitTextFillColor: "unset",
                fontWeight: 800,
                letterSpacing: "0.07em",
                textShadow: "0 1px 7px #FFD70066",
              }}>{user.email}</span>!
            </span>
          )}
        </div>

        {/* User Stats / VIP */}
        {user && (
          <div className="w-full px-0" style={{ marginTop: '3vw' }}>
            <UserStatsVip
              tier={user?.tier || 1}
              points={user?.points_balance || 0}
              streak={streak}
              completedOffers={user?.completed_offers || 0}
            />
          </div>
        )}

        {/* Offerwalls */}
        <div className="w-full flex flex-col items-center mt-6 mb-3 px-2" style={{ maxWidth: '99vw' }}>
          <h2 className="mb-3 text-xl font-bold text-white text-center tracking-tight"
            style={{
              letterSpacing: "0.05em",
              fontFamily: "inherit",
              paddingBottom: "2px",
            }}>
            Premium Offerwalls
          </h2>
          <OfferwallCarousel offerwalls={filteredOfferwalls} onOpen={handleOpenOfferwall} />
        </div>

        {/* Achievement Wall */}
        <div className="w-full flex flex-col items-center justify-center" style={{ maxWidth: '99vw', marginTop: '5vw', marginBottom: '3vw' }}>
          {user && (
            <AchievementWall completedOffers={user?.completed_offers || 0} />
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        {showFAB && <FloatingActionButton />}

        {/* Offerwall Modal */}
        {activeOfferwall && (
          <div className="fixed inset-0 z-[1001] bg-black/85 flex items-center justify-center backdrop-blur">
            <div className="glass-card rounded-2xl shadow-2xl border-4 border-accent max-w-lg w-full p-3 flex flex-col items-center relative animate-fade-in"
              style={{ minHeight: "70vh", maxHeight: "99vh", overflowY: "auto" }}>
              <button
                className="absolute top-3 right-5 text-accent text-3xl font-extrabold hover:text-blue-700 transition"
                onClick={() => setActiveOfferwall(null)}
                aria-label="Close"
                style={{
                  background: "rgba(24,32,56,0.8)",
                  borderRadius: "1.4rem",
                  padding: "3px 13px",
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
            </div>
          </div>
        )}

        {/* Bottom Navigation (app style, optional) */}
        <nav className="fixed bottom-0 left-0 right-0 z-[1002] bg-gradient-to-br from-blue-900 via-accent to-black border-t border-accent flex justify-around items-center px-4 py-2"
          style={{ boxShadow: "0 -2px 18px #60A5fa33" }}>
          <button className="flex flex-col items-center focus:outline-none">
            <img src="/icons/offerwall.svg" alt="Offerwalls" className="w-7 h-7 mb-1" />
            <span className="text-xs text-white font-bold">Offerwalls</span>
          </button>
          <button className="flex flex-col items-center focus:outline-none">
            <img src="/icons/achievements.svg" alt="Achievements" className="w-7 h-7 mb-1" />
            <span className="text-xs text-white font-bold">Achievements</span>
          </button>
          <button className="flex flex-col items-center focus:outline-none">
            <img src="/icons/profile.svg" alt="Profile" className="w-7 h-7 mb-1" />
            <span className="text-xs text-white font-bold">Profile</span>
          </button>
        </nav>
      </div>
      <style jsx>{`
        html, body, #__next {
          width: 100vw !important;
          min-height: 100vh !important;
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
