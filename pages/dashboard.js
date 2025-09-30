import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ProviderIframe from "../components/ProviderIFrame";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Receive setGlobalLoading from pageProps (from _app.js)
export default function Dashboard({ setGlobalLoading }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [completions, setCompletions] = useState({}); // {offerId: completedCount}

  useEffect(() => {
    // Set global loading spinner ON
    if (typeof setGlobalLoading === "function") setGlobalLoading(true);

    const getData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push("/");
          return;
        }

        const userEmail = authData.user.email;

        // Get or create user
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
        // Set global loading spinner OFF
        if (typeof setGlobalLoading === "function") setGlobalLoading(false);
      }
    };

    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // keep only [router] dependency

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Local loading state & spinner removed!
  // Render error if needed, otherwise dashboard as normal.

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-primary">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      )}

      {/* User Stats */}
      {user && (
        <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-white shadow flex flex-col items-center animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-700">Points Balance</h3>
            <p className="text-2xl font-bold text-primary">{user.points_balance || 0}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((user.points_balance / 10000) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow flex flex-col items-center animate-fade-in delay-100">
            <h3 className="text-lg font-semibold text-gray-700">Daily Streak</h3>
            <p className="text-2xl font-bold text-green-500">{streak} 🔥</p>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow flex flex-col items-center animate-fade-in delay-200">
            <h3 className="text-lg font-semibold text-gray-700">VIP Tier</h3>
            <p className="text-xl font-bold text-yellow-500">{user.tier || 1}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((user.points_balance || 0) / (10000 * (user.tier || 1))) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow animate-fade-in delay-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Balance History</h3>
            {ledger.length > 0 ? (
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={ledger}>
                  <XAxis dataKey="created_at" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance_after" stroke="#4F46E5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">No balance history yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Offers Section */}
      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Available Offers</h2>
        {offers.length === 0 ? (
          <p className="text-gray-500">No active offers right now. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const earnedPoints = completions[offer.id] || 0;
              const completionPercent = Math.min((earnedPoints / (offer.points_reward || 1)) * 100, 100);

              return (
                <div
                  key={offer.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow hover:shadow-lg transition transform hover:-translate-y-1 animate-fade-in"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{offer.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 relative group">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition">
                        {earnedPoints} / {offer.points_reward || 1} points
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{completionPercent.toFixed(0)}% completed</p>
                  </div>
                  <ProviderIframe
                    url={offer.iframe_url || `https://example-offerwall.com/${offer.id}`}
                    height="500px"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
