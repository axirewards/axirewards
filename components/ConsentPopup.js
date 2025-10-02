import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface ConsentPopupProps {
  userId: string;
  consent: boolean;
}

const ConsentPopup: React.FC<ConsentPopupProps> = ({ userId, consent }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!consent) setShow(true);
  }, [consent]);

  const handleAccept = async () => {
    await axios.post('/api/consent', { userId, consent: true });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: "15px", maxWidth: 420,
        padding: "32px 24px", boxShadow: "0 2px 24px rgba(0,0,0,0.18)"
      }}>
        <h2 style={{marginBottom: 8}}>Sutikimas su taisyklėmis ir privatumu</h2>
        <p style={{fontSize: 16, marginBottom: 20}}>
          Naudodamiesi šiuo puslapiu, sutinkate su mūsų taisyklėmis bei privatumo politika.
        </p>
        <div style={{fontSize: 13, color: "#666", marginBottom: 16}}>
          <Link href="/terms" legacyBehavior>
            <a style={{marginRight: 20}}>Taisyklės</a>
          </Link>
          <Link href="/privacy" legacyBehavior>
            <a>Privatumo politika</a>
          </Link>
        </div>
        <button
          style={{
            background: "#0070f3", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 24px", fontSize: 16, cursor: "pointer"
          }}
          onClick={handleAccept}
        >
          Sutinku
        </button>
      </div>
    </div>
  );
};

export default ConsentPopup;
