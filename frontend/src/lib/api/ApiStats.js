import AxiosInstance from "../axios";
const header = {
  headers: {
    "Content-Type": "application/json",
  },
};

export async function getCounts({ modelId }) {
  return AxiosInstance.get(
    `/api/stats/counts?chat_model_id=${modelId}`,
    header,
  );
}
