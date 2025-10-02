import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import TelOrPc from "../components/TelOrPc";
import { supabase } from "../lib/supabaseClient";

// Pridedame last_login update on dashboard load
useEffect(() => {
  async function updateLastLogin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("email", user.email);
    }
  }
  updateLastLogin();
}, []);

const DashboardPc = dynamic(() => import("../components/doublepages/DashboardPc"), { ssr: false });
const DashboardMob = dynamic(() => import("../components/doublepages/DashboardMob"), { ssr: false });

export default function Dashboard({ setGlobalLoading }) {
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
