"use client";

import { useEffect, useState } from "react";

interface HydrationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function HydrationWrapper({
  children,
  fallback,
}: HydrationWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      fallback || (
        <div className="w-full min-h-full" suppressHydrationWarning />
      )
    );
  }

  return <>{children}</>;
}
