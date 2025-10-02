import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

function getIP() {
  // Get public IP from external API
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
      const userIp = await getIP();
      setIp(userIp);

      if (!userIp) {
        setLoading(false);
        setShow(true);
        return;
      }

      const { data, error } = await supabase
        .from('consent')
        .select('consent')
        .eq('ip_address', userIp)
        .single();

      if (error || !data || !data.consent) {
        setShow(true);
      } else {
        setShow(false);
      }
      setLoading(false);
    }
    checkConsent();
  }, []);

  const handleAccept = async () => {
    setLoading(true);
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
      background: "rgba(0,0,0,0.92)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#111",
        borderRadius: "24px",
        maxWidth: 420,
        width: "90%",
        padding: "44px 32px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.45)",
        textAlign: "center",
        fontFamily: "inherit",
        border: "1.5px solid #222"
      }}>
        <p style={{
          fontSize: 17,
          marginBottom: 28,
          color: "#fff",
          fontWeight: 500,
          lineHeight: 1.6,
          letterSpacing: ".01em"
        }}>
          By using our website, you agree to our <span style={{fontWeight:700, color: "#46aaff"}}>Terms of Service</span> and <span style={{fontWeight:700, color: "#46aaff"}}>Privacy Policy</span>.
        </p>
        <div style={{
          fontSize: 13,
          color: "#eee",
          marginBottom: 22,
          letterSpacing: ".01em"
        }}>
          <Link href="/terms" legacyBehavior>
            <a style={{
              marginRight: 18,
              textDecoration: "underline",
              color: "#46aaff",
              fontWeight: 500,
              transition: "color .2s",
            }}>Terms of Service</a>
          </Link>
          <Link href="/privacy" legacyBehavior>
            <a style={{
              textDecoration: "underline",
              color: "#46aaff",
              fontWeight: 500,
              transition: "color .2s"
            }}>Privacy Policy</a>
          </Link>
        </div>
        <button
          style={{
            background: "linear-gradient(90deg,#46aaff 0,#024eaf 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "13px 32px",
            fontSize: 18,
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            boxShadow: "0 4px 18px rgba(70,170,255,0.10)",
            opacity: loading ? 0.6 : 1,
            letterSpacing: ".02em"
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
