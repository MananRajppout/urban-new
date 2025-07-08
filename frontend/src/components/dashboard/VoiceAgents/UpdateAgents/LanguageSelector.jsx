import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LanguageSelector = ({ language, setLanguage, options }) => {
  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="glass-panel border border-subtle-border focus:ring-0 focus:ring-offset-0 focus:border-accent-teal">
        <SelectValue placeholder="Select a Language" />
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

export default LanguageSelector;
