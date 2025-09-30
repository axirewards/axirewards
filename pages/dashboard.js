// pages/dashboard.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import UserStats from "../components/UserStats";
import ProviderIframe from "../components/ProviderIFrame";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        // 1️⃣ Gauti prisijungusį vartotoją
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push("/"); // jei neautorizuotas – redirect
          return;
        }

        const userEmail = authData.user.email;

        // 2️⃣ Tikrinti ar vartotojas yra DB, jei ne – sukurti
        let { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", userEmail)
          .single();

        if (userError && userError.code === "PGRST116") {
          // User not found, sukuriame
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{ email: userEmail, created_at: new Date() }])
            .select()
            .single();

          if (insertError) {
            console.error("Error creating user profile:", insertError);
            setError("Failed to create user profile.");
            setLoading(false);
            return;
          }

          userData = newUser;
        } else if (userError) {
          console.error(userError);
          setError("Failed to fetch user profile.");
          setLoading(false);
          return;
        }

        setUser(userData);

        // 3️⃣ Gauti aktyvias offers
        const { data: offerData, error: offerError } = await supabase
          .from("offers")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (offerError) {
          console.error(offerError);
        } else {
          setOffers(offerData || []);
        }

      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[70vh] items-center justify-center">
          <p className="animate-pulse text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

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

      {/* User Stats */}
      {user && <UserStats user={user} />}

      {/* Offers Section */}
      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Available Offers</h2>
        {offers.length === 0 ? (
          <p className="text-gray-500">No active offers right now. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                  <p className="text-sm text-gray-500">{offer.description}</p>
                </div>
                <ProviderIframe
                  url={offer.iframe_url || `https://example-offerwall.com/${offer.id}`}
                  height="500px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
