"use client";

import React, { memo, useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X,
  FileSpreadsheet,
  AlertCircle 
} from "lucide-react";
import { Submission, FormSummary } from "../types";

interface LeadsDatabaseProps {
  submissions: Submission[];
  forms: FormSummary[];
  loading: boolean;
  selectedFormId: string;
  setSelectedFormId: (id: string) => void;
  leadStatusFilter: "all" | "completed" | "partial";
  setLeadStatusFilter: (status: "all" | "completed" | "partial") => void;
  onDeleteSubmission: (id: string) => void;
}

const LeadsDatabase: React.FC<LeadsDatabaseProps> = ({
  submissions,
  forms,
  loading,
  selectedFormId,
  setSelectedFormId,
  leadStatusFilter,
  setLeadStatusFilter,
  onDeleteSubmission
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Submission | null>(null);
  const LEADS_PER_PAGE = 8;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedFormId, leadStatusFilter]);

  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((sub) => {
      const matchesForm = selectedFormId === "all" || sub.formId === selectedFormId;
      const matchesSearch = Object.values(sub.data).some((val) => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      ) || (sub.formTitle && sub.formTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        leadStatusFilter === "all" ||
        (leadStatusFilter === "completed" && sub.progress >= 100) ||
        (leadStatusFilter === "partial" && sub.progress < 100);

      return matchesForm && matchesSearch && matchesStatus;
    });
  }, [submissions, selectedFormId, searchTerm, leadStatusFilter]);

  const paginatedSubmissions = React.useMemo(() => {
    return filteredSubmissions.slice((page - 1) * LEADS_PER_PAGE, page * LEADS_PER_PAGE);
  }, [filteredSubmissions, page]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / LEADS_PER_PAGE));

  const extractFieldValue = (data: Record<string, any>, matchKeys: string[]) => {
    const dataKeys = Object.keys(data);
    const foundKey = dataKeys.find((dk) => 
      matchKeys.some((mk) => dk.toLowerCase().replace(/[^a-z0-9]/g, "").includes(mk))
    );
    return foundKey ? String(data[foundKey]) : "-";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;
    
    // Gather all unique keys across all submission data
    const allKeysSet = new Set<string>();
    filteredSubmissions.forEach(sub => {
      Object.keys(sub.data).forEach(k => allKeysSet.add(k));
    });
    const headerKeys = Array.from(allKeysSet);
    
    const csvHeaders = ["Submission ID", "Campaign", "Progress %", "Submission Date", ...headerKeys];
    const csvRows = filteredSubmissions.map(sub => {
      const rowData = [
        sub.id,
        sub.formTitle || "Unknown",
        `${sub.progress}%`,
        new Date(sub.createdAt).toISOString()
      ];
      headerKeys.forEach(k => {
        const val = sub.data[k];
        rowData.push(val ? `"${String(val).replace(/"/g, '""')}"` : "");
      });
      return rowData.join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [csvHeaders.join(","), ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center border-b border-[#cbd6e2]/60 pb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2d3e50] tracking-wide">Campaign:</span>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="px-3 py-1.5 bg-[#f5f8fa] border border-[#cbd6e2] text-xs font-bold rounded-[3px] text-[#33475b] outline-none focus:border-[#ff7a59] focus:ring-1 focus:ring-[#ff7a59]/15"
            >
              <option value="all">All Campaigns</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2d3e50] tracking-wide">Progress:</span>
            <select
              value={leadStatusFilter}
              onChange={(e) => setLeadStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#f5f8fa] border border-[#cbd6e2] text-xs font-bold rounded-[3px] text-[#33475b] outline-none focus:border-[#ff7a59] focus:ring-1 focus:ring-[#ff7a59]/15"
            >
              <option value="all">All Leads</option>
              <option value="completed">Completed (100%)</option>
              <option value="partial">Partial Progress (&lt;100%)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
            className="hs-button-secondary text-xs font-bold py-1.5 px-3.5"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" /> Export CSV
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#cbd6e2]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#f5f8fa] border border-[#cbd6e2] focus:bg-white focus:border-[#ff7a59] rounded-[3px] text-xs font-bold placeholder-[#cbd6e2] outline-none w-full lg:w-64 transition shadow-sm"
          />
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff7a59] mx-auto mb-2"></div>
          <p className="text-[#516f90] text-xs font-bold">Syncing leads database...</p>
        </div>
      ) : paginatedSubmissions.length === 0 ? (
        <div className="p-16 text-center text-[#516f90] bg-[#f5f8fa] border border-[#cbd6e2] rounded-[3px] text-xs font-bold">
          No matching leads found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#cbd6e2] text-[10px] text-[#2d3e50] uppercase tracking-wider font-bold bg-[#f5f8fa]/80">
                <th className="p-3 pl-4">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Lead Source</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Created Date</th>
                <th className="p-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbd6e2]/55">
              {paginatedSubmissions.map((sub, idx) => {
                const absoluteIndex = (page - 1) * LEADS_PER_PAGE + idx + 1;
                
                // Extract name, email, and phone dynamically
                const nameVal = extractFieldValue(sub.data, ["fullname", "name"]);
                const emailVal = extractFieldValue(sub.data, ["email", "mail"]);
                const phoneVal = extractFieldValue(sub.data, ["phone", "tel", "contact", "mobile"]);

                return (
                  <tr key={sub.id} className="hover:bg-[#f5f8fa]/50 transition-colors">
                    <td className="p-3 pl-4 text-slate-400 font-medium">#{absoluteIndex}</td>
                    <td className="p-3 font-bold text-[#2d3e50]">{nameVal}</td>
                    <td className="p-3 text-[#516f90] font-medium">{emailVal}</td>
                    <td className="p-3 text-[#516f90] font-medium">{phoneVal}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#f5f8fa] border border-[#cbd6e2] font-bold text-[#33475b] truncate max-w-[120px] block" title={sub.formTitle}>
                        {sub.formTitle || "Campaign"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          sub.progress >= 100 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                            : "bg-amber-50 text-amber-700 border-amber-250"
                        }`}>
                          {sub.progress >= 100 ? "Completed" : `${sub.progress}%`}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-[#516f90] font-bold">{formatDate(sub.createdAt)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={() => setSelectedLead(sub)}
                          className="p-1.5 hover:bg-[#f5f8fa] border border-transparent hover:border-[#cbd6e2] rounded text-[#516f90] hover:text-[#ff7a59] transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => onDeleteSubmission(sub.id)}
                          className="p-1.5 hover:bg-red-50 border border-transparent hover:border-red-200 rounded text-[#cbd6e2] hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center border-t border-[#cbd6e2]/60 pt-4 text-xs font-bold text-[#516f90]">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="hs-button-secondary text-xs font-bold py-1.5 px-3 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="hs-button-secondary text-xs font-bold py-1.5 px-3 disabled:opacity-40"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-[#2d3e50]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border-t-4 border-[#ff7a59] border-x border-b border-[#cbd6e2] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <header className="px-6 py-4 border-b border-[#cbd6e2]/60 flex justify-between items-center bg-[#f5f8fa]">
              <div>
                <h3 className="font-bold text-[#2d3e50] text-sm uppercase tracking-wider">Lead Details</h3>
                <span className="text-[10px] text-[#516f90] mt-0.5 block font-bold">Campaign: {selectedLead.formTitle}</span>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1.5 hover:bg-white border border-transparent hover:border-[#cbd6e2] rounded text-[#cbd6e2] hover:text-red-500 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 bg-white">
              {Object.entries(selectedLead.data).map(([label, val]) => (
                <div key={label} className="grid grid-cols-3 border-b border-[#f5f8fa] pb-2.5 last:border-0 last:pb-0 gap-3">
                  <span className="text-[#516f90] text-xs font-bold break-words pr-2">{label}</span>
                  <span className="text-[#2d3e50] text-xs font-bold col-span-2 break-words leading-relaxed">
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </span>
                </div>
              ))}
            </div>
            <footer className="bg-[#f5f8fa] px-6 py-4 border-t border-[#cbd6e2]/60 flex justify-between items-center text-[10px] font-bold text-[#516f90]">
              <span>Status: {selectedLead.progress >= 100 ? "Completed Submission" : `Partial (${selectedLead.progress}%)`}</span>
              <span>Submitted: {new Date(selectedLead.createdAt).toLocaleString()}</span>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(LeadsDatabase);
