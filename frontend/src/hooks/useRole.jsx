import AxiosInstance from "@/lib/axios";
import useSWR from "swr";
export function useRole() {
  const { data, error, isLoading } = useSWR("/api/role", AxiosInstance.get);
  const { data: user } = useSWR("/api/fetch-user-details", AxiosInstance.get);
  const roleId = user?.data?.user?.role_id;
  const roles = data?.data?.access_list || [];
  const aiVoicePlanId = user?.data?.user?.ai_price_plan_id;
  const chatbotPlanId = user?.data?.user?.pricing_plan;
  const isRoleExist = (value) => {
    return roles.includes(value);
  };

  return {
    roles,
    error,
    isLoading,
    isRoleExist,
    canChatbotWrite: isRoleExist("chatbot:write"),
    canChatbotRead: isRoleExist("chatbot:read"),
    canChatbotExport: isRoleExist("chatbot:export"),
    canChatbotDelete: isRoleExist("chatbot:delete"),
    canUserInvite: isRoleExist("user:invite"),
    canUserEdit: isRoleExist("user:edit"),
    canPricingRead: isRoleExist("pricing:read"),
    isAdmin: roleId === 1,
    aiVoicePlanId,
    chatbotPlanId
  };
}
