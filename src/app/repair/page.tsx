"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RepairPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pickup");
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Redirecting to Pickup & Drop Service...</p>
      </div>
    </div>
  );
}
