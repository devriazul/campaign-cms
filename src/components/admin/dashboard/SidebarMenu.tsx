"use client";

import React, { memo } from "react";
import { 
  Layers, 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  Settings, 
  User, 
  LogOut 
} from "lucide-react";

interface SidebarMenuProps {
  activeTab: "dashboard" | "forms" | "leads" | "settings";
  setActiveTab: (tab: "dashboard" | "forms" | "leads" | "settings") => void;
  onLogout: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  activeTab,
  setActiveTab,
  onLogout
}) => {
  return (
    <aside className="w-64 bg-white border-r border-[#cbd6e2] hidden md:flex flex-col justify-between p-6 shrink-0 relative z-20 shadow-sm">
      <div className="space-y-8">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#cbd6e2]/60">
          <div className="w-9 h-9 rounded bg-[#ff7a59] flex items-center justify-center text-white font-bold shadow">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-[#2d3e50] leading-none text-md">FormCMS</h1>
            <span className="text-[10px] text-[#516f90] font-bold uppercase tracking-wider">HubSpot Engine</span>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-bold transition border-l-4 cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-[#f5f8fa] text-[#ff7a59] border-[#ff7a59]" 
                : "text-[#516f90] hover:text-[#2d3e50] hover:bg-[#f5f8fa] border-transparent"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === "dashboard" ? "text-[#ff7a59]" : "text-[#cbd6e2]"}`} />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("forms")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-bold transition border-l-4 cursor-pointer ${
              activeTab === "forms" 
                ? "bg-[#f5f8fa] text-[#ff7a59] border-[#ff7a59]" 
                : "text-[#516f90] hover:text-[#2d3e50] hover:bg-[#f5f8fa] border-transparent"
            }`}
          >
            <ClipboardList className={`w-4 h-4 ${activeTab === "forms" ? "text-[#ff7a59]" : "text-[#cbd6e2]"}`} />
            Campaign Forms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("leads")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-bold transition border-l-4 cursor-pointer ${
              activeTab === "leads" 
                ? "bg-[#f5f8fa] text-[#ff7a59] border-[#ff7a59]" 
                : "text-[#516f90] hover:text-[#2d3e50] hover:bg-[#f5f8fa] border-transparent"
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === "leads" ? "text-[#ff7a59]" : "text-[#cbd6e2]"}`} />
            Leads Database
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-bold transition border-l-4 cursor-pointer ${
              activeTab === "settings" 
                ? "bg-[#f5f8fa] text-[#ff7a59] border-[#ff7a59]" 
                : "text-[#516f90] hover:text-[#2d3e50] hover:bg-[#f5f8fa] border-transparent"
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === "settings" ? "text-[#ff7a59]" : "text-[#cbd6e2]"}`} />
            Portal Settings
          </button>
        </nav>
      </div>

      {/* Profile Card & Logout */}
      <div className="space-y-4 pt-4 border-t border-[#cbd6e2]/60">
        <div className="flex items-center gap-3 p-2.5 bg-[#f5f8fa] border border-[#cbd6e2] rounded-sm">
          <div className="w-8 h-8 rounded bg-[#2d3e50]/10 text-[#2d3e50] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-[#2d3e50] truncate">Administrator</p>
            <span className="text-[9px] text-[#516f90] font-bold uppercase">Superadmin</span>
          </div>
        </div>
        <button 
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100/80 text-red-650 text-xs font-bold rounded-sm transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default memo(SidebarMenu);
