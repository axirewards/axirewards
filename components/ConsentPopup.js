import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

function getIP() {
  // Gauk viešą IP iš API (arba backend)
  return fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => data.ip)
    .catch(() => null);
}

function ConsentPopup() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ip, setIp] = useState(null);

  useEffect(() => {
    async function checkConsent() {
      setLoading(true);
      // Gauk IP
      const userIp = await getIP();
      setIp(userIp);

      if (!userIp) {
        setLoading(false);
        setShow(true); // Jei nepavyko gauti IP, vis tiek rodom consent
        return;
      }

      // Patikrink DB ar jau yra consent
      const { data, error } = await supabase
        .from('consent')
        .select('consent')
        .eq('ip_address', userIp)
        .single();

      if (error || !data || !data.consent) {
        setShow(true); // consent nėra
      } else {
        setShow(false); // consent jau duotas
      }
      setLoading(false);
    }
    checkConsent();
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    // Išsaugom consent į DB
    await supabase
      .from('consent')
      .upsert({ ip_address: ip, consent: true });
    setShow(false);
    setLoading(false);
  };

  if (!show || loading) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.38)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        maxWidth: 420,
        width: "90%",
        padding: "40px 28px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.20)",
        textAlign: "center",
        fontFamily: "inherit"
      }}>
        <h2 style={{
          marginBottom: 10,
          color: "#222",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: ".01em"
        }}>
          Consent Required
        </h2>
        <p style={{
          fontSize: 16,
          marginBottom: 24,
          color: "#444",
          fontWeight: 500
        }}>
          By using this website, you agree to our <span style={{fontWeight:600}}>Terms of Service</span> and <span style={{fontWeight:600}}>Privacy Policy</span>.
        </p>
        <div style={{
          fontSize: 13,
          color: "#888",
          marginBottom: 18,
          letterSpacing: ".01em"
        }}>
          <Link href="/terms" legacyBehavior>
            <a style={{marginRight: 18, textDecoration: "underline", color: "#0070f3"}}>Terms of Service</a>
          </Link>
          <Link href="/privacy" legacyBehavior>
            <a style={{textDecoration: "underline", color: "#0070f3"}}>Privacy Policy</a>
          </Link>
        </div>
        <button
          style={{
            background: "linear-gradient(90deg,#0070f3 0,#1c55b2 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 28px",
            fontSize: 17,
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            boxShadow: "0 2px 10px rgba(0,112,243,0.08)",
            opacity: loading ? 0.6 : 1
          }}
          onClick={handleAccept}
          disabled={loading}
        >
          {loading ? "Saving..." : "I Agree"}
        </button>
      </div>
    </div>
  );
}

export default ConsentPopup;
