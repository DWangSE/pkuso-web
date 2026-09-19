"use client";

import React from "react";
import { supabase } from "@/lib/supabase";

interface RealtimeBadgeCallbacks {
  onLeaveRequestChange?: () => void;
  onProfileChange?: () => void;
  onNotificationChange?: () => void;
}

export function useAdminRealtime(callbacks: RealtimeBadgeCallbacks) {
  const channelRef = React.useRef<ReturnType<typeof supabase.channel> | null>(null);
  const callbacksRef = React.useRef(callbacks);

  React.useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  React.useEffect(() => {
    const channel = supabase
      .channel("admin-realtime-badges")
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, () =>
        callbacksRef.current.onLeaveRequestChange?.(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: "status=eq.pending" },
        () => callbacksRef.current.onProfileChange?.(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () =>
        callbacksRef.current.onNotificationChange?.(),
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);
}
