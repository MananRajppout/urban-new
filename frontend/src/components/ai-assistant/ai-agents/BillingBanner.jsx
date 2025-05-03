import React, { useEffect, useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import Link from "next/link";
import useVoiceInfo from "@/hooks/useVoice";

export default function BillingBanner() {
  const { remainingMinutes, isVoiceAiActive, isLoading } = useVoiceInfo();

  return (
    <div
      className="bg-[var(--color-primary)] mb-3 banner border mt-14 sm:mt-0 border-blue-300 py-4 px-6 max-w-4xl mx-auto rounded-lg shadow-lg"
      style={{ transform: "translateY(-130px)" }}
    >
      <div className="flex flex-col gap-3 ml-1 mr-1">
        {/* Time section */}
        {isVoiceAiActive && (
          <div className="flex items-center">
            <FaInfoCircle size={15} />
            <span className="text-white text-sm ml-3">
              {remainingMinutes > 0
                ? `${remainingMinutes} minute${
                    remainingMinutes > 1 ? "s" : ""
                  } left`
                : "0 trial minute left"}
            </span>
          </div>
        )}

        {/* Description text */}
        {!isVoiceAiActive  && (
          <span className="text-sm">
            Your voice AI account is currently disabled. To request a free
            trial, please email us at{" "}
            <a
              href="mailto:alex@urbanchat.ai"
              className="text-blue-400 underline"
            >
              alex@urbanchat.ai
            </a>
          </span>
        )}
        {/* <span className="text-white text-xs sm:text-sm ml-3">
          - Add a payment method to continue using the API.
        </span>

        <Link
          href="billing"
          className="text-[var(--color-on-surface3)] font-bold text-sm no-underline hover:text-[var(--color-on-surface1)]"
        >
          Add card
        </Link> */}
      </div>
    </div>
  );
}
