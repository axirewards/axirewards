// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Magic Link login
  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setInfoMsg("Check your email for the magic login link.");
    }
    setLoading(false);
  };

  // Login with email + password
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  // Register with email + password
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setInfoMsg("Account created! Please check your email to confirm.");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  // Login with Google OAuth
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setInfoMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Welcome Back 👋
        </h1>

        {/* Status messages */}
        {errorMsg && (
          <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
            {errorMsg}
          </p>
        )}
        {infoMsg && (
          <p className="mb-4 rounded bg-green-100 p-2 text-sm text-green-600">
            {infoMsg}
          </p>
        )}

        {/* Email + password login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-2 text-white hover:bg-secondary disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Log In"}
          </button>
        </form>

        {/* Register */}
        <button
          onClick={handleRegister}
          className="mt-3 w-full rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-100"
        >
          Sign Up
        </button>

        {/* Magic link login */}
        <button
          onClick={handleMagicLink}
          className="mt-3 w-full rounded border border-blue-400 py-2 text-blue-600 hover:bg-blue-50"
        >
          Send Magic Link ✨
        </button>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <hr className="flex-1 border-gray-300" />
          <span className="px-2 text-sm text-gray-400">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-red-500 py-2 text-white hover:bg-red-600"
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
    </div>
  );
              }          <span className="px-2 text-sm text-gray-400">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-red-500 py-2 text-white hover:bg-red-600"
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
    </div>
  );
}
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Welcome Back 👋
        </h1>

        {/* Status messages */}
        {errorMsg && (
          <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
            {errorMsg}
          </p>
        )}
        {infoMsg && (
          <p className="mb-4 rounded bg-green-100 p-2 text-sm text-green-600">
            {infoMsg}
          </p>
        )}

        {/* Email + password login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-2 text-white hover:bg-secondary disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Log In"}
          </button>
        </form>

        {/* Register */}
        <button
          onClick={handleRegister}
          className="mt-3 w-full rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-100"
        >
          Sign Up
        </button>

        {/* Magic link login */}
        <button
          onClick={handleMagicLink}
          className="mt-3 w-full rounded border border-blue-400 py-2 text-blue-600 hover:bg-blue-50"
        >
          Send Magic Link ✨
        </button>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <hr className="flex-1 border-gray-300" />
          <span className="px-2 text-sm text-gray-400">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-red-500 py-2 text-white hover:bg-red-600"
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
    </div>
  );
          }          <span className="px-2 text-sm text-gray-400">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-red-500 py-2 text-white hover:bg-red-600"
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
    </div>
  );
        }        )}
        {infoMsg && (
          <p className="mb-4 rounded bg-green-100 p-2 text-sm text-green-600">
            {infoMsg}
          </p>
        )}

        {/* Email + password login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-2 text-white hover:bg-secondary disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Log In"}
          </button>
        </form>

        {/* Register */}
        <button
          onClick={handleRegister}
          className="mt-3 w-full rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-100"
        >
          Sign Up
        </button>

        {/* Magic link login */}
        <button
          onClick={handleMagicLink}
          className="mt-3 w-full rounded border border-blue-400 py-2 text-blue-600 hover:bg-blue-50"
        >
          Send Magic Link ✨
        </button>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <hr className="flex-1 border-gray-300" />
          <span className="px-2 text-sm text-gray-400">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-red-500 py-2 text-white hover:bg-red-600"
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
    </div>
  );
              }
