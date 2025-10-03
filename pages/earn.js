import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TelOrPc from "../components/TelOrPc";
import { supabase } from "../lib/supabaseClient";

const EarnPc = dynamic(() => import("../components/doublepages/EarnPc"), { ssr: false });
const EarnMob = dynamic(() => import("../components/doublepages/EarnMob"), { ssr: false });

export default function Earn({ setGlobalLoading }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Redirect to /index if user is not logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/index");
      }
    }
    checkAuth();
  }, [router]);

  // No content until TelOrPc decides and login check passes
  return (
    <TelOrPc>
      {(isMobile) => {
        return isMobile ? (
          <EarnMob setGlobalLoading={setGlobalLoading || setLoading} router={router} />
        ) : (
          <EarnPc setGlobalLoading={setGlobalLoading || setLoading} router={router} />
        );
      }}
    </TelOrPc>
  );
}
