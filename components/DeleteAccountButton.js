import React from 'react';

function DeleteAccountButton({ email }) {
  const handleRequest = () => {
    window.location.href = `mailto:info@axirewards.eu?subject=Account Deletion Request&body=Please delete my account (${email}) according to GDPR and CCPA regulations.`;
  };

  return (
    <button
      style={{
        background: "#d32f2f",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 24px",
        fontSize: 16,
        cursor: "pointer",
        marginTop: 20
      }}
      onClick={handleRequest}
    >
      Request account deletion
    </button>
  );
}

export default DeleteAccountButton;
