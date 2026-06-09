"use client";

import React, { memo } from "react";
import { Plus } from "lucide-react";
import { FormField } from "../types";

interface SidebarElementsProps {
  onAddField: (type: FormField["type"]) => void;
  activeTab: "fields" | "settings";
  setActiveTab: (tab: "fields" | "settings") => void;
}

const SidebarElements: React.FC<SidebarElementsProps> = ({
  onAddField,
  activeTab,
  setActiveTab
}) => {
  return (
    <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#cbd6e2] bg-[#f5f8fa] p-5 space-y-6 flex-shrink-0">
      <div>
        <h2 className="text-xs font-bold text-[#2d3e50] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#ff7a59]" /> Add Elements
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
          <button 
            type="button"
            onClick={() => onAddField("step")}
            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f5f8fa] border border-[#cbd6e2] hover:border-[#ff7a59]/65 rounded text-left text-xs font-bold text-[#33475b] transition shadow-sm cursor-pointer"
          >
            <span className="w-6 h-6 rounded bg-[#ff7a59]/10 text-[#ff7a59] flex items-center justify-center font-bold text-[9px]">STEP</span>
            Step Separator
          </button>
          <button 
            type="button"
            onClick={() => onAddField("text")}
            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f5f8fa] border border-[#cbd6e2] hover:border-[#ff7a59]/65 rounded text-left text-xs font-bold text-[#33475b] transition shadow-sm cursor-pointer"
          >
            <span className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[9px]">TXT</span>
            Short Text
          </button>
          <button 
            type="button"
            onClick={() => onAddField("textarea")}
            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f5f8fa] border border-[#cbd6e2] hover:border-[#ff7a59]/65 rounded text-left text-xs font-bold text-[#33475b] transition shadow-sm cursor-pointer"
          >
            <span className="w-6 h-6 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-[9px]">AREA</span>
            Long Textarea
          </button>
          <button 
            type="button"
            onClick={() => onAddField("select")}
            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f5f8fa] border border-[#cbd6e2] hover:border-[#ff7a59]/65 rounded text-left text-xs font-bold text-[#33475b] transition shadow-sm cursor-pointer"
          >
            <span className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-[9px]">SEL</span>
            Dropdown Select
          </button>
          <button 
            type="button"
            onClick={() => onAddField("radio")}
            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f5f8fa] border border-[#cbd6e2] hover:border-[#ff7a59]/65 rounded text-left text-xs font-bold text-[#33475b] transition shadow-sm cursor-pointer"
          >
            <span className="w-6 h-6 rounded bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-[9px]">RAD</span>
            Radio List
          </button>
          <button 
            type="button"
            onClick={() => onAddField("checkbox")}
            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f5f8fa] border border-[#cbd6e2] hover:border-[#ff7a59]/65 rounded text-left text-xs font-bold text-[#33475b] transition shadow-sm cursor-pointer"
          >
            <span className="w-6 h-6 rounded bg-[#ff7a59]/10 text-[#ff7a59] flex items-center justify-center font-bold text-[9px]">CHK</span>
            Checklist Field
          </button>
        </div>
      </div>

      <div className="border-t border-[#cbd6e2] pt-5">
        <div className="flex border border-[#cbd6e2] bg-white p-1 rounded text-xs shadow-sm">
          <button 
            type="button"
            onClick={() => setActiveTab("fields")}
            className={`flex-1 py-1.5 text-center font-bold rounded transition cursor-pointer ${
              activeTab === "fields" ? "bg-[#f5f8fa] text-[#ff7a59] border border-[#cbd6e2]/60" : "text-[#516f90] hover:text-[#2d3e50]"
            }`}
          >
            Field Edit
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-1.5 text-center font-bold rounded transition cursor-pointer ${
              activeTab === "settings" ? "bg-[#f5f8fa] text-[#ff7a59] border border-[#cbd6e2]/60" : "text-[#516f90] hover:text-[#2d3e50]"
            }`}
          >
            Page Setup
          </button>
        </div>
      </div>
    </aside>
  );
};

export default memo(SidebarElements);
