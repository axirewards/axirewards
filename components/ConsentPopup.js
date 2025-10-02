import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

function ConsentPopup({ userId, consent }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!consent) setShow(true);
  }, [consent]);

  const handleAccept = async () => {
    try {
      await axios.post('/api/consent', { userId, consent: true });
      setShow(false);
    } catch (err) {
      // Optionally handle error
    }
  };

  if (!show) return null;

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
          By using this website, you agree to our Terms of Service and Privacy Policy.
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
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,112,243,0.08)"
          }}
          onClick={handleAccept}
        >
          I Agree
        </button>
      </div>
    </div>
  );
}

export default ConsentPopup;
