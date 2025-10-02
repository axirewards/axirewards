import dynamic from "next/dynamic";
import { useState } from "react";
import TelOrPc from "../components/TelOrPc";
import { supabase } from "../lib/supabaseClient";

const DashboardPc = dynamic(() => import("../components/doublepages/DashboardPc"), { ssr: false });
const DashboardMob = dynamic(() => import("../components/doublepages/DashboardMob"), { ssr: false });

async function updateLastLogin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("email", user.email);
  }
}

export default function Dashboard({ setGlobalLoading }) {
  const [loading, setLoading] = useState(false);

  return (
    <TelOrPc>
      {(isMobile) => {
        // last_login update vykdoma po PC/Mob paskirstymo ir renderio
        updateLastLogin();
        return isMobile ? (
          <DashboardMob setGlobalLoading={setGlobalLoading || setLoading} />
        ) : (
          <DashboardPc setGlobalLoading={setGlobalLoading || setLoading} />
        );
      }}
    </TelOrPc>
  );
}
