import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import IndexFooter from "../components/IndexFooter";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace("/dashboard");
    };
    checkUser();
  }, [router]);

  // Magic Link login
  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setInfoMsg("Check your email for the magic login link. If you don't see it, check your spam folder. Link is valid for 5 minutes.");
    }

    setLoading(false);
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary via-blue-600 to-blue-900">
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-black/90 p-8 shadow-2xl backdrop-blur-lg border border-blue-100">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/icons/logo.png"
              alt="AxiRewards Logo"
              width={96}
              height={96}
              className="drop-shadow-lg animate-fade-in"
              priority
            />
          </div>
          {/* Status messages */}
          {errorMsg && (
            <p className="mb-4 rounded bg-red-900/80 p-2 text-sm text-red-100 shadow animate-shake">
              {errorMsg}
            </p>
          )}
          {infoMsg && (
            <p className="mb-4 rounded bg-blue-900/80 p-2 text-sm text-blue-100 shadow animate-fade-in">
              {infoMsg}
            </p>
          )}
          {/* Email input for Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-blue-950 text-blue-100 placeholder-blue-400"
              required
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg border border-blue-400 py-2 text-blue-100 font-semibold hover:bg-blue-950 hover:text-blue-400 transition active:scale-95 disabled:opacity-50 shadow ${loading ? "cursor-wait" : ""}`}
            >
              {loading ? (
                <span className="animate-pulse">Sending Magic Link...</span>
              ) : (
                "Send Magic Link ✨"
              )}
            </button>
          </form>
          {/* Divider */}
          <div className="mt-6 flex items-center">
            <hr className="flex-1 border-blue-800" />
            <span className="px-2 text-sm text-blue-400">or</span>
            <hr className="flex-1 border-blue-800" />
          </div>
          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-white font-semibold hover:bg-red-700 active:scale-95 shadow transition"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
              fill="currentColor"
            >
              <path d="M488 261.8c0-17.8-1.6-35-4.7-51.8H249v98.1h134c-5.8 31.1-23.2 57.4-49.4 74.8v62.1h79.7c46.6-42.9 74-106.2 74-183.2z" />
              <path d="M249 492c66.5 0 122.2-22 162.9-59.7l-79.7-62.1c-22.1 14.8-50.5 23.6-83.2 23.6-63.9 0-118-43.1-137.4-100.9H30.1v63.7C70.7 441.4 154.4 492 249 492z" />
              <path d="M111.6 293.1c-9.3-27.6-9.3-57.7 0-85.2V144H30.1C10.9 184.4 0 229.4 0 275.9c0 46.6 10.9 91.5 30.1 131.9l81.5-63.7z" />
              <path d="M249 97.6c35.9-.5 69.5 12.5 95.3 36.3l71.3-71.3C370.9 24.8 311.8 0 249 0 154.4 0 70.7 50.6 30.1 131.9l81.5 63.7C131 140.7 185.1 97.6 249 97.6z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </main>
      <IndexFooter />
      {/* Animacijos */}
      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.55s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px);}
          20%, 80% { transform: translateX(2px);}
          30%, 50%, 70% { transform: translateX(-4px);}
          40%, 60% { transform: translateX(4px);}
        }
      `}</style>
    </div>
  );
}
