import dynamic from "next/dynamic";
import { useState } from "react";
import TelOrPc from "../components/TelOrPc";

// Dinamiškai importuojame puslapių komponentus dėl SSR/CSR
const DashboardPc = dynamic(() => import("../components/doublepages/DashboardPc"), { ssr: false });
const DashboardMob = dynamic(() => import("../components/doublepages/DashboardMob"), { ssr: false });

export default function Dashboard({ setGlobalLoading }) {
  // Galima naudoti state, jei reikia perduoti globalLoading, bet perduodame props iš viršaus
  const [loading, setLoading] = useState(false);

  return (
    <TelOrPc>
      {(isMobile) =>
        isMobile ? (
          <DashboardMob setGlobalLoading={setGlobalLoading || setLoading} />
        ) : (
          <DashboardPc setGlobalLoading={setGlobalLoading || setLoading} />
        )
      }
    </TelOrPc>
  );
}
