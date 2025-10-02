import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import AyetOfferwall from "../components/AyetOfferwall";
import BitLabsOfferwall from "../components/BitLabsOfferwall";
import CpxOfferwall from "../components/CpxOfferwall";
import TheoremOfferwall from "../components/TheoremOfferwall";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PremiumBadge from "../components/PremiumBadge";
import VIPTierProgress from "../components/VIPTierProgress";
import OfferwallCarousel from "../components/OfferwallCarousel";
import FloatingActionButton from "../components/FloatingActionButton";

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

export default function Dashboard({ setGlobalLoading }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [activeOfferwall, setActiveOfferwall] = useState(null);
  const [enabledKeys, setEnabledKeys] = useState([]);
  const [showFAB, setShowFAB] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

    // Detect mobile/desktop
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 700);
        setShowFAB(window.innerWidth < 700);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router, setGlobalLoading]);

  const filteredOfferwalls = OFFERWALLS.filter(wall => enabledKeys.includes(wall.key));
  function handleOpenOfferwall(key) { setActiveOfferwall(key); }
  function getOfferwallParams(key) { return filteredOfferwalls.find(w => w.key === key); }

  // PC DESKTOP
  if (!isMobile) {
    return (
      <Layout>
        <div className="relative flex flex-col items-center justify-start min-h-[90vh] max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-center w-full mb-8 gap-4">
            <h1 className="text-4xl font-extrabold text-white text-center drop-shadow mb-3">
              Dashboard
            </h1>
          </div>

          {/* Stats Cards / User / VIP */}
          {user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 w-full justify-center">
              <div className="bg-gradient-to-br from-[#232e40dd] to-[#0B0B0Bcc] rounded-3xl shadow-2xl p-7 border-2 border-accent backdrop-blur flex flex-col items-center">
                {/* Avatar, badge, status REMOVED from here */}
                <div className="w-full flex items-center justify-center mt-1">
                  <VIPTierProgress tier={user?.tier || 1} points={user?.points_balance || 0} email={user?.email} />
                </div>
              </div>
              <StatsCard title="Points Balance" value={user?.points_balance || 0} unit="AXI" icon="/icons/coin.svg" animateConfetti />
              <StatsCard title="Daily Streak" value={streak} unit="🔥" icon="/icons/fire.svg" animatePulse />
              <StatsCard title="VIP Tier" value={user?.tier || 1} unit="🏆" icon="/icons/vip.svg" animateShine />
            </div>
          )}

          {/* Balance History */}
          {user && (
            <div className="rounded-2xl glass-card p-6 mb-8 border-2 border-accent shadow-xl w-full max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-accent mb-2">Balance History</h3>
              {ledger.length > 0 ? (
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={ledger}>
                    <XAxis dataKey="created_at" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="balance_after" stroke="#60A5FA" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400">No balance history yet.</p>
              )}
            </div>
          )}

          {/* Offerwalls Section */}
          <div className="w-full mt-8 flex flex-col items-center justify-center">
            <h2 className="mb-6 text-2xl font-bold text-white text-center tracking-tight">Premium Offerwalls</h2>
            <div className="w-full flex flex-col items-center justify-center">
              <OfferwallCarousel offerwalls={filteredOfferwalls} onOpen={handleOpenOfferwall} />
            </div>
            {/* Modal offerwall open */}
            {activeOfferwall && (
              <div className="fixed inset-0 z-[1001] bg-black/80 flex items-center justify-center backdrop-blur">
                <div className="glass-card rounded-3xl shadow-2xl border-4 border-accent max-w-3xl w-full p-8 flex flex-col items-center relative animate-fade-in">
                  <button
                    className="absolute top-4 right-6 text-accent text-4xl font-extrabold hover:text-blue-700 transition"
                    onClick={() => setActiveOfferwall(null)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  {activeOfferwall === "ayet" && (
                    <AyetOfferwall adSlot={getOfferwallParams("ayet")?.adSlot} height="700px" />
                  )}
                  {activeOfferwall === "bitlabs" && (
                    <BitLabsOfferwall apiKey={getOfferwallParams("bitlabs")?.apiKey} height="700px" />
                  )}
                  {activeOfferwall === "cpx" && (
                    <CpxOfferwall appId={getOfferwallParams("cpx")?.appId} height="700px" />
                  )}
                  {activeOfferwall === "theorem" && (
                    <TheoremOfferwall appId={getOfferwallParams("theorem")?.appId} height="700px" />
                  )}
                </div>
              </div>
            )}
          </div>
          {showFAB && <FloatingActionButton />}
        </div>
        <style jsx>{`
          html, body, #__next {
            width: 100vw !important;
            min-height: 100vh !important;
            overflow-x: hidden !important;
            box-sizing: border-box;
          }
          .glass-card {
            background: rgba(24, 32, 56, 0.86);
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

  // MOBILE VERSION LAYOUT
  return (
    <Layout>
      <div className="relative flex flex-col items-center justify-center min-h-screen w-full z-10">
        <div
          className="relative bg-gradient-to-br from-[#2C3E50aa] via-[#34495Edd] to-[#000000ee] rounded-3xl shadow-2xl border border-accent backdrop-blur-xl p-4"
          style={{
            maxWidth: "100vw",
            width: "100vw",
            marginTop: "22px",
            marginBottom: "22px",
            boxShadow: "0 8px 48px 0 #60A5fa44, 0 2px 12px 0 #60A5fa66",
            border: "3px solid #60A5FA33",
          }}
        >
          {/* Premium Badge & Avatar removed from VIPTierProgress container */}
          {user && (
            <div className="flex flex-col items-center mb-6 gap-2">
              <div className="w-full flex items-center justify-center mt-1">
                <VIPTierProgress tier={user?.tier || 1} points={user?.points_balance || 0} email={user?.email} />
              </div>
            </div>
          )}

          {/* Balance History */}
          {user && (
            <div className="rounded-2xl glass-card p-4 mb-6 border-2 border-accent shadow-xl w-full">
              <h3 className="text-md font-bold text-accent mb-2">Balance History</h3>
              {ledger.length > 0 ? (
                <ResponsiveContainer width="100%" height={70}>
                  <LineChart data={ledger}>
                    <XAxis dataKey="created_at" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="balance_after" stroke="#60A5FA" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-gray-400">No balance history yet.</p>
              )}
            </div>
          )}

          {/* Stats Cards */}
          {user && (
            <div className="flex flex-col gap-4 mb-8 w-full">
              <StatsCard title="Points Balance" value={user?.points_balance || 0} unit="AXI" icon="/icons/coin.svg" animateConfetti />
              <StatsCard title="Daily Streak" value={streak} unit="🔥" icon="/icons/fire.svg" animatePulse />
            </div>
          )}

          {/* Offerwall Carousel */}
          <div className="w-full flex flex-col items-center mt-8 mb-8">
            <OfferwallCarousel offerwalls={filteredOfferwalls} onOpen={handleOpenOfferwall} />
          </div>
        </div>
        {showFAB && <FloatingActionButton />}
        {activeOfferwall && (
          <div className="fixed inset-0 z-[1001] bg-black/80 flex items-center justify-center backdrop-blur">
            <div className="glass-card rounded-3xl shadow-2xl border-4 border-accent max-w-3xl w-full p-6 flex flex-col items-center relative animate-fade-in">
              <button
                className="absolute top-4 right-6 text-accent text-4xl font-extrabold hover:text-blue-700 transition"
                onClick={() => setActiveOfferwall(null)}
                aria-label="Close"
              >
                &times;
              </button>
              {activeOfferwall === "ayet" && (
                <AyetOfferwall adSlot={getOfferwallParams("ayet")?.adSlot} height="700px" />
              )}
              {activeOfferwall === "bitlabs" && (
                <BitLabsOfferwall apiKey={getOfferwallParams("bitlabs")?.apiKey} height="700px" />
              )}
              {activeOfferwall === "cpx" && (
                <CpxOfferwall appId={getOfferwallParams("cpx")?.appId} height="700px" />
              )}
              {activeOfferwall === "theorem" && (
                <TheoremOfferwall appId={getOfferwallParams("theorem")?.appId} height="700px" />
              )}
            </div>
          </div>
        )}
        <style jsx>{`
          html, body, #__next {
            width: 100vw !important;
            min-height: 100vh !important;
            overflow-x: hidden !important;
            box-sizing: border-box;
          }
          .glass-card {
            background: rgba(24, 32, 56, 0.86);
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
      </div>
    </Layout>
  );
}

function StatsCard({ title, value, unit, icon, animateConfetti, animatePulse, animateShine, animateSparkle }) {
  return (
    <div
      className={`glass-card flex flex-col items-center justify-center py-6 px-4 border border-accent shadow-xl transition-all duration-400 hover:scale-105`}
      style={{
        minWidth: "180px",
        maxWidth: "100%",
        boxShadow: "0 2px 16px 0 #60A5fa22",
        position: "relative",
      }}
    >
      <img src={icon} alt={title} className="w-10 h-10 mb-2" />
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <span className="text-3xl font-extrabold text-accent">{value}</span>
      <span className="text-md text-secondary">{unit}</span>
      {animateConfetti && <span className="absolute top-2 right-2 confetti" />}
      {animatePulse && <span className="absolute bottom-2 left-2 pulse" />}
      {animateShine && <span className="absolute bottom-2 right-2 shine" />}
      {animateSparkle && <span className="absolute top-2 left-2 sparkle" />}
    </div>
  );
}
