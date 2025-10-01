import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import AyetOfferwall from "../components/AyetOfferwall";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Example offerwall providers (expand with more in future)
const OFFERWALLS = [
  {
    key: "ayet",
    name: "Ayet Studios",
    logo: "https://cdn.ayetstudios.com/img/logo/ayet_logo_full.png",
    color: "#60A5FA",
    adSlot: "23274",
    description: "Complete surveys, apps and tasks for premium AXI rewards.",
  },
  // Add more providers here! Example:
  // {
  //   key: "lootably",
  //   name: "Lootably",
  //   logo: "https://www.lootably.com/img/logo.svg",
  //   color: "#FBBF24",
  //   adSlot: "YOUR_ADSLOT_ID",
  //   description: "Lootably tasks and offers.",
  // },
];

export default function Dashboard({ setGlobalLoading }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [activeOfferwall, setActiveOfferwall] = useState(null);

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

      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Something went wrong.");
      } finally {
        if (typeof setGlobalLoading === "function") setGlobalLoading(false);
      }
    };
    getData();
  }, [router]);

  // UI constants
  const cardClass = "bg-card rounded-2xl shadow-lg flex flex-col items-center animate-fade-in border border-gray-900";
  const gridCardClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10";
  const sectionTitleClass = "mb-6 text-2xl font-bold text-white text-center tracking-tight";

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[90vh] max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-white text-center md:text-left drop-shadow mb-3 md:mb-0">
            Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        {user && (
          <div className={gridCardClass}>
            <div className={cardClass + " px-4 py-6"}>
              <h3 className="text-lg font-bold text-accent mb-2">Points Balance</h3>
              <p className="text-3xl font-extrabold text-white">{user.points_balance || 0}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((user.points_balance / 10000) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className={cardClass + " px-4 py-6"}>
              <h3 className="text-lg font-bold text-secondary mb-2">Daily Streak</h3>
              <p className="text-3xl font-extrabold text-green-400">{streak} 🔥</p>
            </div>
            <div className={cardClass + " px-4 py-6"}>
              <h3 className="text-lg font-bold text-primary mb-2">VIP Tier</h3>
              <p className="text-2xl font-extrabold text-yellow-400">{user.tier || 1}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((user.points_balance || 0) / (10000 * (user.tier || 1))) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className={cardClass + " px-4 py-6"}>
              <h3 className="text-lg font-bold text-blue-500 mb-2">Balance History</h3>
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
          </div>
        )}

        {/* Offerwalls Section */}
        <div className="w-full mt-12">
          <h2 className={sectionTitleClass}>Premium Offerwalls</h2>
          {/* Offerwall cards */}
          <div className="flex flex-wrap gap-8 justify-center items-stretch mt-4">
            {OFFERWALLS.map((wall) => (
              <div
                key={wall.key}
                className={`relative group bg-gradient-to-tr from-black/80 via-[#0B0B0B] to-black/60 border-2 border-gray-900 hover:border-accent rounded-2xl shadow-lg w-[200px] h-[200px] flex flex-col items-center justify-center cursor-pointer transition hover:scale-105 hover:shadow-2xl`}
                onClick={() => setActiveOfferwall(wall.key)}
                style={{
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="absolute inset-0 rounded-2xl" style={{ pointerEvents: "none" }} />
                <img
                  src={wall.logo}
                  alt={wall.name + " logo"}
                  className="w-20 h-20 object-contain mb-2 opacity-80 drop-shadow-lg"
                  style={{ filter: `drop-shadow(0 0 8px ${wall.color})`, marginTop: '12px' }}
                />
                <div className="text-accent font-extrabold text-lg text-center mb-2">{wall.name}</div>
                <div className="text-xs text-gray-400 px-2 text-center">{wall.description}</div>
                <span className="absolute bottom-4 right-4 text-[11px] text-accent opacity-0 group-hover:opacity-100 transition">Open offerwall</span>
              </div>
            ))}
          </div>
          {/* Modal offerwall open */}
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
                {/* Offerwall branding */}
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={OFFERWALLS.find(w => w.key === activeOfferwall)?.logo}
                    alt={OFFERWALLS.find(w => w.key === activeOfferwall)?.name + " logo"}
                    className="w-12 h-12 object-contain"
                  />
                  <span className="text-2xl font-bold text-accent">{OFFERWALLS.find(w => w.key === activeOfferwall)?.name}</span>
                </div>
                <div className="mb-4 text-gray-700 font-semibold text-center">
                  {OFFERWALLS.find(w => w.key === activeOfferwall)?.description}
                </div>
                {/* Actual offerwall iframe */}
                {activeOfferwall === "ayet" && (
                  <AyetOfferwall adSlot={OFFERWALLS.find(w => w.key === "ayet").adSlot} height="700px" />
                )}
                {/* Future: add other offerwall components here */}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Custom Scrollbar & Animations */}
      <style jsx>{`
        .bg-card { background-color: #0B0B0B; }
        .scrollbar-thin { scrollbar-width: thin; }
        .scrollbar-thumb-accent { scrollbar-color: #60A5FA #0B0B0B; }
        .scrollbar-track-card::-webkit-scrollbar { background: #0B0B0B; }
        .scrollbar-thumb-accent::-webkit-scrollbar-thumb { background: #60A5FA; }
        .scrollbar-thin::-webkit-scrollbar { height: 8px; }
        .border-accent { border-color: #60A5FA; }
        .text-accent { color: #60A5FA; }
        .animate-fade-in {
          animation: fadeInModal 0.22s cubic-bezier(.23,1,.32,1);
        }
      `}</style>
    </Layout>
  );
}
