import { getRestriction, getUserDetail } from "@/lib/api/ApiExtra";
import AxiosInstance from "@/lib/axios";
import { useMemo } from "react";
import useSWR from "swr";

export default function useVoiceInfo() {
  const restriction = useSWR("/api/fetch-restriction", async () => {
    const restriction = await getRestriction();
    return restriction.data.restriction;
  });
  const userInfo = useSWR("/api/fetch-user-details", AxiosInstance.get);
  return useMemo(() => {
    let remainingMinutes = 0;
    if (restriction.data) {
      remainingMinutes = parseFloat(
        restriction.data.voice_trial_minutes_limit -
          restriction.data.voice_trial_minutes_used
      ).toFixed(2);
    }
    const isVoiceAiActive =
      userInfo.data?.data?.user?.voice_ai_status === "active" ||
      userInfo.data?.data?.user?.voice_ai_status === "free_trial";

    return {
      remainingMinutes,
      isVoiceAiActive,
      isLoading: restriction.isLoading || userInfo.isLoading,
      voicePlan: userInfo.data?.data?.user?.voice_ai_status,
    };
  }, [userInfo, restriction]);
}

export function useBackgroundSounds() {
  const { data, error, isLoading } = useSWR(
    "/api/voice/settings/background-sounds",
    AxiosInstance.get
  );

  return {
    data: data?.data?.settings?.backgroundSounds || [],
    isLoading,
    error,
  };
}
