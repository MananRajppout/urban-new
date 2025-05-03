import { User } from "lucide-react";
import { Button } from "../../AiChatBot/components/button/Button";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import Pagination from "../../CallHistory/Pagination";
import { deleteAiAgent } from "@/lib/api/ApiAiAssistant";
import { mutate } from "swr";
import useVoiceInfo from "@/hooks/useVoice";

const VoiceAgentTable = ({ data, mutateKey }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const voiceInfo = useVoiceInfo();

  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(data.slice(startIndex, endIndex));
  }, [currentPage, data]);

  const getAvailabilityBadge = (availability) => {
    switch (availability) {
      case "Available":
        return "bg-sentiment-positive/20 text-sentiment-positive";
      case "On Call":
        return "bg-accent-purple/20 text-accent-purple";
      case "On Break":
        return "bg-sentiment-neutral/20 text-sentiment-neutral";
      case "Offline":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getSentimentColor = (score) => {
    if (score >= 80) return "text-sentiment-positive";
    if (score >= 60) return "text-sentiment-neutral";
    return "text-sentiment-negative";
  };

  const handleEditAgent = (id) => {
   
    console.log(id, "handle edit agent");
    router.push(`/voice-agents/${id}`);
  };

  const handleDeleteAgent = async (id, name) => {

    try {
      setIsDeleting(true);
      await deleteAiAgent(id);

      mutate(mutateKey);

      toast.success(`Agent "${name}" deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete agent "${name}"`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr
              className="border-b border-subtle-border"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <th className="text-gray-400 font-semibold text-left py-3 px-4">
                Agent
              </th>
              <th className="text-gray-400 font-semibold text-center py-3 px-4">
                Status
              </th>
              {/* <th className="text-gray-400 font-semibold text-center py-3 px-4 hidden md:table-cell">
                Calls Handled
              </th>
              <th className="text-gray-400 font-semibold text-center py-3 px-4 hidden md:table-cell">
                Avg Duration
              </th> */}
              <th className="text-gray-400 font-semibold text-center py-3 px-4 hidden lg:table-cell">
                Sentiment
              </th>
              {/* <th className="text-gray-400 font-semibold text-center py-3 px-4 hidden lg:table-cell">
                Conversion
              </th> */}
              <th className="text-gray-400 font-semibold text-right py-3 px-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((agent) => (
              <tr
                key={agent.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                className="border-b border-subtle-border hover:bg-glass-panel-light/20"
                onClick={() => {
                  handleEditAgent(agent.id);
                }}
              >
                <td className="py-0 px-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-accent-teal" />
                    </div>
                    <div>
                      <p className="font-medium text-white mb-0 leading-tight">
                        {agent.name}
                      </p>
                      <p className="text-sm text-gray-400 mb-0 leading-tight relative bottom-3">
                        {agent.role}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-center px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getAvailabilityBadge(
                      agent?.availability
                    )}`}
                  >
                    {agent?.availability}
                  </span>
                </td>
                {/* <td className="text-center text-white px-4 hidden md:table-cell">
                  {agent.callsHandled}
                </td>
                <td className="text-center text-white px-4 hidden md:table-cell">
                  {agent.avgDuration}
                </td> */}
                <td className="text-center px-4 hidden lg:table-cell">
                  <span
                    className={`font-medium ${getSentimentColor(
                      agent?.sentimentScore
                    )}`}
                  >
                    {agent?.sentimentScore}%
                  </span>
                </td>
                {/* <td className="text-center text-white px-4 hidden lg:table-cell">
                  {agent.conversionRate}%
                </td> */}
                <td className="text-right px-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer h-9 w-9 p-0 bg-transparent border border-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAgent(agent.id);
                      }}
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer h-9 w-9 p-0 bg-transparent border border-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent.id, agent.name);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-sentiment-negative" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="py-4 px-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default VoiceAgentTable;
