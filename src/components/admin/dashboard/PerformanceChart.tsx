"use client";

import React, { memo } from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import { FormSummary } from "../types";

interface PerformanceChartProps {
  forms: FormSummary[];
  totalLeads: number;
  onSelectForm: (id: string) => void;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  forms,
  totalLeads,
  onSelectForm
}) => {
  // Determine scale of Y-axis
  const maxCount = Math.max(...forms.map(f => f.submissionCount), 1);
  const yAxisTicks = [
    Math.round(maxCount),
    Math.round(maxCount * 0.75),
    Math.round(maxCount * 0.5),
    Math.round(maxCount * 0.25),
    0
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-[#cbd6e2] shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-[#cbd6e2]/60 pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#ff7a59]" />
          <h4 className="font-bold text-[#2d3e50] text-sm uppercase tracking-wider">Campaign Performance Analytics</h4>
        </div>
        <span className="text-[10px] text-[#ff7a59] font-bold bg-[#ff7a59]/10 border border-[#ff7a59]/20 px-2 py-0.5 rounded">
          Live Funnel Share
        </span>
      </div>
      
      {forms.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-xs text-[#516f90] gap-2">
          <AlertCircle className="w-8 h-8 text-[#cbd6e2]" />
          <span>No campaign data available to plot analytics.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bar Chart Area */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex h-64 relative pt-4">
              {/* Y-Axis Labels & Grid Lines */}
              <div className="w-10 h-full flex flex-col justify-between text-[10px] text-[#cbd6e2] font-bold pr-2 select-none">
                {yAxisTicks.map((tick, i) => (
                  <span key={i} className="text-right leading-none">{tick}</span>
                ))}
              </div>

              {/* Chart Plot Wrapper */}
              <div className="flex-1 h-full relative border-l border-b border-[#cbd6e2] flex items-end justify-around px-4">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none pl-1">
                  <div className="border-t border-[#cbd6e2]/25 w-full h-0"></div>
                  <div className="border-t border-[#cbd6e2]/25 w-full h-0"></div>
                  <div className="border-t border-[#cbd6e2]/25 w-full h-0"></div>
                  <div className="border-t border-[#cbd6e2]/25 w-full h-0"></div>
                  <div className="w-full h-0"></div>
                </div>

                {/* Bars */}
                {forms.slice(0, 5).map((f) => {
                  const pctHeight = maxCount > 0 ? (f.submissionCount / maxCount) * 100 : 0;
                  const sharePct = totalLeads > 0 ? Math.round((f.submissionCount / totalLeads) * 100) : 0;
                  
                  return (
                    <div key={f.id} className="flex-1 flex flex-col items-center h-full justify-end max-w-[60px] group relative z-10">
                      <div 
                        className="w-full bg-[#ff7a59] hover:bg-[#ff6a47] rounded-t-[3px] transition-all duration-350 relative cursor-pointer shadow-sm hover:shadow-md"
                        style={{ height: `${pctHeight > 0 ? Math.max(6, pctHeight) : 2}%` }}
                        onClick={() => onSelectForm(f.id)}
                      >
                        {/* Custom Tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#2d3e50] text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition duration-150 whitespace-nowrap z-20 pointer-events-none">
                          <p>{f.title}</p>
                          <p className="text-[#ff7a59]">{f.submissionCount} leads ({sharePct}%)</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex pl-10 pr-4 justify-around text-center">
              {forms.slice(0, 5).map((f) => (
                <span 
                  key={f.id} 
                  className="flex-1 text-[9px] text-[#516f90] font-bold truncate max-w-[65px] mt-2 block cursor-pointer hover:text-[#ff7a59]" 
                  title={f.title}
                  onClick={() => onSelectForm(f.id)}
                >
                  {f.title}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Breakdown Legend */}
          <div className="bg-[#f5f8fa] p-4 rounded border border-[#cbd6e2] flex flex-col justify-center space-y-3">
            <h5 className="text-[10px] font-bold text-[#2d3e50] uppercase tracking-wider">Funnel Breakdown</h5>
            <div className="space-y-2.5">
              {forms.slice(0, 5).map((f) => {
                const sharePct = totalLeads > 0 ? Math.round((f.submissionCount / totalLeads) * 100) : 0;
                return (
                  <div key={f.id} className="flex items-center justify-between text-xs border-b border-[#cbd6e2]/40 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 bg-[#ff7a59] rounded-sm shrink-0"></span>
                      <span className="font-bold text-[#33475b] truncate" title={f.title}>{f.title}</span>
                    </div>
                    <span className="font-bold text-[#2d3e50] shrink-0 pl-2">{sharePct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(PerformanceChart);
