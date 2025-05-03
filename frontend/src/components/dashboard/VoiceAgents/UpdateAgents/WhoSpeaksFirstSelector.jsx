import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WhoSpeaksFirstSelector = ({
  whoSpeaksFirst,
  setWhoSpeaksFirst,
  options,
}) => {
  return (
    <Select value={whoSpeaksFirst} onValueChange={setWhoSpeaksFirst}>
      <SelectTrigger className="glass-panel border border-subtle-border focus:ring-0 focus:ring-offset-0 focus:border-accent-teal">
        <SelectValue placeholder="Select who speaks first" />
      </SelectTrigger>
      <SelectContent className="glass-panel border border-subtle-border">
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default WhoSpeaksFirstSelector;
