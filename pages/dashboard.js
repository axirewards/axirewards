import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ProviderIframe from "../components/ProviderIFrame";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard({ setGlobalLoading }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [completions, setCompletions] = useState({}); // {offerId: completedCount}

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

        // Get active offers
        const { data: offerData, error: offerError } = await supabase
          .from("offers")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });
        if (offerError) console.error(offerError);
        else setOffers(offerData || []);

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

        // Fetch completions
        const { data: completionData, error: completionError } = await supabase
          .from("completions")
          .select("offer_id,status,points_earned")
          .eq("user_id", userData.id);

        if (!completionError && completionData) {
          const compMap = {};
          completionData.forEach((c) => {
            if (c.status === "completed") {
              compMap[c.offer_id] = (compMap[c.offer_id] || 0) + (c.points_earned || 0);
            }
          });
          setCompletions(compMap);
        }
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

        {/* Offers Section */}
        <div className="w-full">
          <h2 className={sectionTitleClass}>Available Offers</h2>
          {offers.length === 0 ? (
            <p className="text-gray-400 text-center">No active offers right now. Check back later!</p>
          ) : (
            <div
              className="overflow-x-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-card"
              tabIndex={0}
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex gap-6 pb-2 min-w-[350px] snap-x snap-mandatory">
                {offers.map((offer, idx) => {
                  const earnedPoints = completions[offer.id] || 0;
                  const completionPercent = Math.min((earnedPoints / (offer.points_reward || 1)) * 100, 100);
                  return (
                    <div
                      key={offer.id}
                      className={
                        "snap-start min-w-[320px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl " +
                        "overflow-hidden rounded-2xl border border-gray-900 bg-card shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 animate-fade-in flex flex-col"
                      }
                    >
                      <div className="p-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-accent mb-1">{offer.title}</h3>
                        <p className="text-sm text-white/80 mb-2">{offer.description}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 relative group">
                          <div
                            className="bg-accent h-2 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercent}%` }}
                          />
                          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-xs text-accent opacity-0 group-hover:opacity-100 transition">
                            {earnedPoints} / {offer.points_reward || 1} points
                          </span>
                        </div>
                        <p className="text-xs text-accent mt-1">{completionPercent.toFixed(0)}% completed</p>
                      </div>
                      <ProviderIframe
                        url={offer.iframe_url || `https://example-offerwall.com/${offer.id}`}
                        height="400px"
                        offer={{
                          title: offer.title,
                          description: offer.description,
                          steps: offer.steps, // array if available
                          payout_points: offer.payout_points || offer.points_reward,
                          detailsUrl: offer.details_url,
                          pointsTable: offer.pointsTable,
                        }}
                      />
                    </div>
                  );
                })}
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
        @media (max-width: 640px) {
          .snap-x { scroll-snap-type: x mandatory; }
          .snap-start { scroll-snap-align: start; }
        }
      `}</style>
    </Layout>
  );
}
