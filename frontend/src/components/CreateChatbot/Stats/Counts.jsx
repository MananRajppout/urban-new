import Skeleton from "@/components/Widget/Skeleton";
import { useCount } from "@/hooks/stats";

export default function Counts({ id, range, period, showModelCount }) {
  const { data: counts = {}, isLoading } = useCount({ id, range, period });

  return (
    <div className="flex gap-4">
      {showModelCount && (
        <Count
          title="Total Chatbot"
          count={counts.chatModels}
          isLoading={isLoading}
        />
      )}
      <Count
        title="Total users"
        count={counts.sessions}
        isLoading={isLoading}
      />
      <Count title="Total Chats" count={counts.chats} isLoading={isLoading} />
      <Count title="Total Leads" count={counts.leads} isLoading={isLoading} />
    </div>
  );
}

function Count({ title, count, isLoading }) {
  return (
    <div className="py-3 px-4 bg-gray-800 text-white rounded-[16px] w-min-[120px] h-min-[90px] ">
      <div className="font-normal text-sm leading-[1.57143]">{title}</div>
      {isLoading ? (
        <Skeleton className="my-2" width={50} height={22} />
      ) : (
        <div className="font-medium text-2xl leading-[1.5]">{count}</div>
      )}
    </div>
  );
}
