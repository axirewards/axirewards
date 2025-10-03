import { useEffect, useState } from "react";
import Layout from "../Layout";
import UserStats from "../UserStats";
import { supabase } from "../../lib/supabaseClient";
import DeleteAccountButton from "../DeleteAccountButton";

export default function ProfileMob({ setGlobalLoading, router }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState("");
  const [completions, setCompletions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletSuccess, setWalletSuccess] = useState("");

  useEffect(() => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true);
    async function fetchUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/index");
        return;
      }

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentUser.email)
        .single();
      if (userError) {
        console.error(userError);
      } else {
        setUser(userData);
        setWallet(userData.wallet_address || "");
      }

      // Fetch last 10 completions for this user using both user_id and user_email
      if (userData) {
        let completionsArr = [];

        // Query by user_id
        const { data: completionsById, error: errorById } = await supabase
          .from("completions")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (errorById) console.error(errorById);
        if (Array.isArray(completionsById)) completionsArr = completionsArr.concat(completionsById);

        // Query by user_email (if needed)
        if (userData.email) {
          const { data: completionsByEmail, error: errorByEmail } = await supabase
            .from("completions")
            .select("*")
            .eq("user_email", userData.email)
            .order("created_at", { ascending: false })
            .limit(10);
          if (errorByEmail) console.error(errorByEmail);
          if (Array.isArray(completionsByEmail)) completionsArr = completionsArr.concat(completionsByEmail);
        }

        // Deduplicate completions by id, and sort by created_at DESC
        const uniqueCompletions = Object.values(
          completionsArr.reduce((acc, c) => {
            acc[c.id] = c;
            return acc;
          }, {})
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setCompletions(uniqueCompletions.slice(0, 10));
      }

      if (typeof setGlobalLoading === "function") setGlobalLoading(false);
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setGlobalLoading]);

  const handleLogout = async () => {
    if (typeof setGlobalLoading === "function") setGlobalLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    if (typeof setGlobalLoading === "function") setGlobalLoading(false);
  };

  const handleWalletUpdate = async () => {
    setWalletError("");
    setWalletSuccess("");
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setWalletError("Wallet must be a valid Polygon (POLYGON Wallet) address starting with 0x...");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("users")
      .update({ wallet_address: wallet })
      .eq("id", user.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      setWalletError("Failed to save wallet. Please try again.");
      console.error(error);
    } else {
      setUser(data);
      setWalletSuccess("Wallet saved successfully!");
    }
  };

  if (!user)
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-center text-lg text-primary animate-pulse">
            Loading profile...
          </p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-between bg-card">
        <div className="max-w-md mx-auto w-full px-3 py-6 space-y-7">
          <div className="flex flex-col items-center mb-7 gap-2">
            <h1 className="text-2xl font-extrabold text-primary mb-2 text-center">
              Profile
            </h1>
            <div className="flex gap-2">
              <DeleteAccountButton email={user.email} />
              <button
                onClick={handleLogout}
                className="rounded-lg bg-card px-3 py-1 text-xs font-semibold text-white transition hover:bg-gray-900 shadow-lg border border-gray-800"
              >
                Logout
              </button>
            </div>
          </div>

          <UserStats user={user} />

          <div className="bg-card shadow-md rounded-xl p-4 mb-2">
            <h2 className="text-lg font-semibold mb-1 text-primary">
              Crypto Wallet <span className="font-normal text-xs text-gray-400">(POLYGON Wallet)</span>
            </h2>
            <div className="flex flex-col gap-2 items-start">
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full border border-gray-700 rounded-lg p-2 bg-black text-white placeholder-gray-400 text-xs"
                placeholder="Enter your Polygon wallet address"
                autoComplete="off"
              />
              <button
                onClick={handleWalletUpdate}
                disabled={saving}
                className="bg-primary text-white px-4 py-1 rounded-lg font-semibold shadow transition hover:bg-blue-700 disabled:opacity-60 text-xs"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            <p className="mt-2 text-xs text-red-500 font-bold">
              * Wallet address should start with 0x...
            </p>
            {walletError && <p className="mt-2 text-xs text-red-500">{walletError}</p>}
            {walletSuccess && <p className="mt-2 text-xs text-green-500">{walletSuccess}</p>}
          </div>

          <div className="bg-card shadow-md rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2 text-primary">Recent Offers</h2>
            {completions.length === 0 ? (
              <p className="text-gray-400 text-xs">No records found.</p>
            ) : (
              <ul className="space-y-2">
                {completions.map((c) => (
                  <li key={c.id} className="border-b border-gray-800 py-2">
                    <p className="font-semibold text-white text-xs">
                      {c.title || "Offer title"}
                    </p>
                    <p className="text-xs text-gray-400">{c.description || ""}</p>
                    <p className="text-xs text-accent">Points: {parseInt(c.credited_points, 10) || 0}</p>
                    <p className="text-xs text-gray-600">{new Date(c.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .bg-card {
          background-color: #0B0B0B;
        }
      `}</style>
    </Layout>
  );
}
