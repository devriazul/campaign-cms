"use client";

import React, { memo, useState, useEffect } from "react";
import Link from "next/link";
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  TrendingUp, 
  Copy, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { FormSummary } from "../types";

interface FormsRegistryProps {
  forms: FormSummary[];
  loading: boolean;
  onDeleteForm: (id: string) => void;
  onNavigateToLeads: (formId: string) => void;
  onCopyLink: (link: string) => void;
}

const FormsRegistry: React.FC<FormsRegistryProps> = ({
  forms,
  loading,
  onDeleteForm,
  onNavigateToLeads,
  onCopyLink
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "leads" | "title">("newest");
  const [minLeadsFilter, setMinLeadsFilter] = useState<"all" | "any" | "popular">("all");
  const [page, setPage] = useState(1);
  const FORMS_PER_PAGE = 5;

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy, minLeadsFilter]);

  const filteredForms = React.useMemo(() => {
    return forms
      .filter((f) => {
        const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesMinLeads = 
          minLeadsFilter === "all" ||
          (minLeadsFilter === "any" && f.submissionCount > 0) ||
          (minLeadsFilter === "popular" && f.submissionCount >= 5);

        return matchesSearch && matchesMinLeads;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "leads") return b.submissionCount - a.submissionCount;
        return a.title.localeCompare(b.title);
      });
  }, [forms, searchTerm, sortBy, minLeadsFilter]);

  const paginatedForms = React.useMemo(() => {
    return filteredForms.slice((page - 1) * FORMS_PER_PAGE, page * FORMS_PER_PAGE);
  }, [filteredForms, page]);

  const totalPages = Math.max(1, Math.ceil(filteredForms.length / FORMS_PER_PAGE));

  const getStepsCount = (fieldsArray: any[]) => {
    const stepFields = fieldsArray.filter(f => f.type === "step");
    return stepFields.length > 0 ? stepFields.length : 1;
  };

  return (
    <div className="bg-white border border-[#cbd6e2] rounded-lg shadow-sm p-6 space-y-6">
      {/* Filter and Search controls */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center border-b border-[#cbd6e2]/60 pb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#516f90]" />
            <span className="text-xs font-bold text-[#2d3e50] tracking-wide">Leads volume:</span>
            <select
              value={minLeadsFilter}
              onChange={(e) => setMinLeadsFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#f5f8fa] border border-[#cbd6e2] text-xs font-bold rounded-[3px] text-[#33475b] outline-none focus:border-[#ff7a59] focus:ring-1 focus:ring-[#ff7a59]/15"
            >
              <option value="all">All Forms</option>
              <option value="any">Has Leads (&gt;0)</option>
              <option value="popular">Popular (&ge;5 leads)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#516f90]" />
            <span className="text-xs font-bold text-[#2d3e50] tracking-wide">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-[#f5f8fa] border border-[#cbd6e2] text-xs font-bold rounded-[3px] text-[#33475b] outline-none focus:border-[#ff7a59] focus:ring-1 focus:ring-[#ff7a59]/15"
            >
              <option value="newest">Newest First</option>
              <option value="leads">Most Leads First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#cbd6e2]" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-[#f5f8fa] border border-[#cbd6e2] focus:bg-white focus:border-[#ff7a59] rounded-[3px] text-xs font-bold placeholder-slate-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Campaign Table Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff7a59] mx-auto mb-2"></div>
          <p className="text-[#516f90] text-xs font-bold">Loading campaigns...</p>
        </div>
      ) : paginatedForms.length === 0 ? (
        <div className="p-12 text-center text-[#516f90] bg-[#f5f8fa] border border-[#cbd6e2] rounded-[3px] text-xs font-bold">
          No campaigns found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#cbd6e2] text-[10px] text-[#2d3e50] uppercase tracking-wider font-bold bg-[#f5f8fa]/80">
                <th className="p-3 pl-4">Campaign Details</th>
                <th className="p-3">Funnel Steps</th>
                <th className="p-3">Leads Count</th>
                <th className="p-3">Public Landing URL</th>
                <th className="p-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbd6e2]/55">
              {paginatedForms.map((form) => {
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                const publicUrl = `${origin}/form/${form.id}`;
                const stepsCount = getStepsCount(form.fields);
                return (
                  <tr key={form.id} className="hover:bg-[#f5f8fa]/50 transition-colors">
                    <td className="p-3 pl-4 max-w-[200px]">
                      <div className="font-bold text-[#2d3e50] text-sm truncate">{form.title}</div>
                      <div className="text-[#516f90] text-[11px] mt-0.5 line-clamp-1">{form.description || "No description."}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[10px] text-[#2d3e50] font-bold bg-[#f5f8fa] border border-[#cbd6e2] px-2 py-0.5 rounded">
                        {stepsCount} {stepsCount === 1 ? "Step" : "Steps"}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-xs font-bold text-[#2d3e50]">
                        <TrendingUp className="w-3.5 h-3.5 text-[#ff7a59]" />
                        {form.submissionCount}
                      </span>
                    </td>
                    <td className="p-3 font-mono max-w-[150px] truncate text-[#516f90]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{publicUrl}</span>
                        <button 
                          type="button"
                          onClick={() => onCopyLink(publicUrl)}
                          className="text-[#cbd6e2] hover:text-[#ff7a59] p-0.5 cursor-pointer transition-colors"
                          title="Copy link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          href={`/form/${form.id}`}
                          target="_blank"
                          className="p-1.5 hover:bg-[#f5f8fa] border border-transparent hover:border-[#cbd6e2] rounded text-[#516f90] hover:text-[#ff7a59] transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/admin/create?id=${form.id}`}
                          className="p-1.5 hover:bg-[#f5f8fa] border border-transparent hover:border-[#cbd6e2] rounded text-[#516f90] hover:text-[#ff7a59] transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button 
                          type="button"
                          onClick={() => onNavigateToLeads(form.id)}
                          className="hs-button-secondary text-[10px] font-bold py-1.5 px-3"
                        >
                          Leads
                        </button>
                        <button 
                          type="button"
                          onClick={() => onDeleteForm(form.id)}
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

      {/* Campaign Table Pagination */}
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
    </div>
  );
};

export default memo(FormsRegistry);
