import React, { useEffect } from "react";
import { useRouter } from "next/router";

function Index() {
  const router = useRouter();

  useEffect(() => {
    router.push(`/`);
  }, [router]);
  return <div>index</div>;
}

export default Index;
