"use client";

import React, { memo } from "react";
import { ClipboardList, TrendingUp, CheckCircle2 } from "lucide-react";

interface StatCardsProps {
  formsCount: number;
  totalLeads: number;
  completionRate: number;
  onNavigateToForms: () => void;
  onNavigateToLeads: (status: "all" | "completed" | "partial") => void;
}

const StatCards: React.FC<StatCardsProps> = ({
  formsCount,
  totalLeads,
  completionRate,
  onNavigateToForms,
  onNavigateToLeads
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div 
        onClick={onNavigateToForms}
        className="bg-white p-5 rounded border border-[#cbd6e2] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#ff7a59] hover:shadow transition-all duration-150 group"
      >
        <div>
          <span className="text-[10px] text-[#516f90] font-bold uppercase tracking-wider block">Total Campaigns</span>
          <span className="text-2xl font-bold text-[#2d3e50] mt-1 block">{formsCount}</span>
        </div>
        <div className="w-10 h-10 rounded bg-[#ff7a59]/10 border border-[#ff7a59]/20 flex items-center justify-center text-[#ff7a59] group-hover:bg-[#ff7a59] group-hover:text-white transition">
          <ClipboardList className="w-5 h-5" />
        </div>
      </div>
      
      <div 
        onClick={() => onNavigateToLeads("all")}
        className="bg-white p-5 rounded border border-[#cbd6e2] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#ff7a59] hover:shadow transition-all duration-150 group"
      >
        <div>
          <span className="text-[10px] text-[#516f90] font-bold uppercase tracking-wider block">Total Leads Captured</span>
          <span className="text-2xl font-bold text-[#2d3e50] mt-1 block">{totalLeads}</span>
        </div>
        <div className="w-10 h-10 rounded bg-[#ff7a59]/10 border border-[#ff7a59]/20 flex items-center justify-center text-[#ff7a59] group-hover:bg-[#ff7a59] group-hover:text-white transition">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div 
        onClick={() => onNavigateToLeads("completed")}
        className="bg-white p-5 rounded border border-[#cbd6e2] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#ff7a59] hover:shadow transition-all duration-150 group"
      >
        <div>
          <span className="text-[10px] text-[#516f90] font-bold uppercase tracking-wider block">Completion rate</span>
          <span className="text-2xl font-bold text-[#2d3e50] mt-1 block">{completionRate}%</span>
        </div>
        <div className="w-10 h-10 rounded bg-[#ff7a59]/10 border border-[#ff7a59]/20 flex items-center justify-center text-[#ff7a59] group-hover:bg-[#ff7a59] group-hover:text-white transition">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default memo(StatCards);
