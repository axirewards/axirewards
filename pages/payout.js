import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TelOrPc from "../components/TelOrPc";
import { supabase } from "../lib/supabaseClient";

const PayoutPc = dynamic(() => import("../components/doublepages/PayoutPc"), { ssr: false });
const PayoutMob = dynamic(() => import("../components/doublepages/PayoutMob"), { ssr: false });

export default function Payout({ setGlobalLoading }) {
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

  return (
    <TelOrPc>
      {(isMobile) => {
        return isMobile ? (
          <PayoutMob setGlobalLoading={setGlobalLoading || setLoading} router={router} />
        ) : (
          <PayoutPc setGlobalLoading={setGlobalLoading || setLoading} router={router} />
        );
      }}
    </TelOrPc>
  );
}
