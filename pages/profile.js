import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TelOrPc from "../components/TelOrPc";
import { supabase } from "../lib/supabaseClient";

const ProfilePc = dynamic(() => import("../components/doublepages/ProfilePc"), { ssr: false });
const ProfileMob = dynamic(() => import("../components/doublepages/ProfileMob"), { ssr: false });

export default function Profile({ setGlobalLoading }) {
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
          <ProfileMob setGlobalLoading={setGlobalLoading || setLoading} router={router} />
        ) : (
          <ProfilePc setGlobalLoading={setGlobalLoading || setLoading} router={router} />
        );
      }}
    </TelOrPc>
  );
}
