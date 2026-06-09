"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  ExternalLink, 
  Layers, 
  Eye, 
  ClipboardList, 
  TrendingUp, 
  FileSpreadsheet,
  LogOut,
  User,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  Database,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  ChevronLeft,
  Filter,
  BarChart3
} from "lucide-react";

interface FormSummary {
  id: string;
  title: string;
  description: string;
  pixelId: string;
  fields: any[];
  createdAt: string;
  submissionCount: number;
}

interface Submission {
  id: string;
  formId: string;
  formTitle?: string;
  data: Record<string, any>;
  progress: number;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "forms" | "leads" | "settings">("dashboard");
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // Interactive Filters
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formsSearchTerm, setFormsSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "leads" | "title">("newest");
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | "completed" | "partial">("all");
  const [formsMinLeadsFilter, setFormsMinLeadsFilter] = useState<"all" | "any" | "popular">("all");
  
  // Pagination States
  const [formsPage, setFormsPage] = useState(1);
  const [leadsPage, setLeadsPage] = useState(1);
  const FORMS_PER_PAGE = 5;
  const LEADS_PER_PAGE = 8;

  // Modals & Toasts
  const [selectedLead, setSelectedLead] = useState<Submission | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);

  // Webhook and lead capture API states
  const [webhookUrl, setWebhookUrl] = useState("");
  const [leadLibraryUrl, setLeadLibraryUrl] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "settings") {
      fetchWebhookSetting();
    }
  }, [activeTab]);

  const fetchWebhookSetting = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setWebhookUrl(data.webhookUrl || "");
        setLeadLibraryUrl(data.leadLibraryUrl || "");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const saveWebhookSetting = async () => {
    setSavingWebhook(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, leadLibraryUrl }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Integration settings saved successfully!", "success");
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating settings", "error");
    } finally {
      setSavingWebhook(false);
    }
  };

  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const formsRes = await fetch("/api/forms");
      const formsData = await formsRes.json();
      let fetchedForms: FormSummary[] = [];
      if (formsData.success) {
        setForms(formsData.forms);
        fetchedForms = formsData.forms;
      }

      const allSubmissions: Submission[] = [];
      for (const form of fetchedForms) {
        const subRes = await fetch(`/api/forms/${form.id}/submissions`);
        const subData = await subRes.json();
        if (subData.success) {
          const mapped = subData.submissions.map((sub: any) => ({
            ...sub,
            formTitle: form.title
          }));
          allSubmissions.push(...mapped);
        }
      }
      
      allSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSubmissions(allSubmissions);
      showToast("Data synchronized", "success");
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      showToast("Sync failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form? All associated submissions will be lost.")) {
      return;
    }
    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setForms(forms.filter((f) => f.id !== id));
        setSubmissions(submissions.filter((s) => s.formId !== id));
        showToast("Campaign deleted successfully", "success");
      }
    } catch (err) {
      console.error("Error deleting form:", err);
      showToast("Delete failed", "error");
    }
  };

  const deleteSubmission = async (subId: string) => {
    if (!confirm("Are you sure you want to delete this lead submission?")) {
      return;
    }
    try {
      const res = await fetch(`/api/submissions/${subId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSubmissions(submissions.filter((s) => s.id !== subId));
        showToast("Submission deleted successfully", "success");
      }
    } catch (err) {
      console.error("Error deleting submission:", err);
      showToast("Delete failed", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Form link copied to clipboard!", "info");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/admin/login";
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Helper scanning functions to find Name, Email, and Phone fields dynamically
  const extractFieldValue = (data: Record<string, any>, matchKeys: string[]) => {
    const dataKeys = Object.keys(data);
    const foundKey = dataKeys.find((dk) => 
      matchKeys.some((mk) => dk.toLowerCase().replace(/[^a-z0-9]/g, "").includes(mk))
    );
    return foundKey ? String(data[foundKey]) : "-";
  };

  // Filter & Sort Forms
  const filteredForms = forms
    .filter((f) => {
      const matchesSearch = f.title.toLowerCase().includes(formsSearchTerm.toLowerCase()) || 
                            (f.description && f.description.toLowerCase().includes(formsSearchTerm.toLowerCase()));
      
      const matchesMinLeads = 
        formsMinLeadsFilter === "all" ||
        (formsMinLeadsFilter === "any" && f.submissionCount > 0) ||
        (formsMinLeadsFilter === "popular" && f.submissionCount >= 5);

      return matchesSearch && matchesMinLeads;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "leads") return b.submissionCount - a.submissionCount;
      return a.title.localeCompare(b.title);
    });

  // Paginated Forms
  const totalFormsPages = Math.max(1, Math.ceil(filteredForms.length / FORMS_PER_PAGE));
  const paginatedForms = filteredForms.slice(
    (formsPage - 1) * FORMS_PER_PAGE,
    formsPage * FORMS_PER_PAGE
  );

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
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

  // Paginated Submissions
  const totalLeadsPages = Math.max(1, Math.ceil(filteredSubmissions.length / LEADS_PER_PAGE));
  const paginatedSubmissions = filteredSubmissions.slice(
    (leadsPage - 1) * LEADS_PER_PAGE,
    leadsPage * LEADS_PER_PAGE
  );

  const getStepsCount = (fieldsArray: any[]) => {
    const stepFields = fieldsArray.filter(f => f.type === "step");
    return stepFields.length > 0 ? stepFields.length : 1;
  };

  const totalLeads = submissions.length;
  const completedLeads = submissions.filter(s => s.progress >= 100).length;
  const completionRate = totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans relative">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 min-w-[280px] bg-white transition-all duration-300 pointer-events-auto transform translate-y-0 animate-scale-in ${
              toast.type === "success" ? "border-emerald-200 text-emerald-800" :
              toast.type === "info" ? "border-sky-200 text-sky-850" : "border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {toast.type === "info" && <Sparkles className="w-4 h-4 text-sky-500" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Left Sidebar Menu */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0 relative z-20 shadow-sm">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-650 flex items-center justify-center text-white font-black shadow-md shadow-sky-500/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 leading-none text-md">FormCMS</h1>
              <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Campaign Hub</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "dashboard" 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-sky-550" />
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab("forms")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "forms" 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              Campaign Forms
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "leads" 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Database className="w-4 h-4 text-indigo-555" />
              Leads Database
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "settings" 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Settings className="w-4 h-4 text-amber-550" />
              Portal Settings
            </button>
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">Administrator</p>
              <span className="text-[9px] text-slate-455 font-bold uppercase">Role: Superadmin</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-205 bg-red-50 hover:bg-red-100/80 text-red-650 text-xs font-bold rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block mb-1">
              Management Portal
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === "dashboard" && "Performance Dashboard"}
              {activeTab === "forms" && "Campaign Forms Registry"}
              {activeTab === "leads" && "Leads Submission Database"}
              {activeTab === "settings" && "Portal System Settings"}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === "forms" && (
              <Link 
                href="/admin/create"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-600 hover:to-indigo-750 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/10"
              >
                <Plus className="w-4 h-4" /> Create Campaign Form
              </Link>
            )}
            <button 
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition"
            >
              Sync Records
            </button>
          </div>
        </header>

        {/* Tab 1: Dashboard Analytics View */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div 
                onClick={() => setActiveTab("forms")}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-sky-500 hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Total Campaigns</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{forms.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-655 group-hover:bg-sky-500 group-hover:text-white transition">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>
              <div 
                onClick={() => {
                  setSelectedFormId("all");
                  setLeadStatusFilter("all");
                  setActiveTab("leads");
                }}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Total Leads Captured</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{totalLeads}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div 
                onClick={() => {
                  setSelectedFormId("all");
                  setLeadStatusFilter("completed");
                  setActiveTab("leads");
                }}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Completion rate</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{completionRate}%</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Analytics Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-500" />
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Top Performing Campaign Funnels</h4>
              </div>
              
              {forms.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                  <span>No campaign data recorded to display analytics.</span>
                </div>
              ) : (
                <div className="flex items-end gap-3 h-56 pt-6 pb-2 px-4 border-b border-slate-100">
                  {forms.slice(0, 5).map((f) => {
                    const pctHeight = totalLeads > 0 ? (f.submissionCount / totalLeads) * 100 : 0;
                    return (
                      <div key={f.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div 
                          className="w-full bg-gradient-to-t from-sky-500 to-indigo-650 hover:from-sky-600 hover:to-indigo-700 rounded-t-lg transition-all duration-500 relative cursor-pointer"
                          style={{ height: `${pctHeight > 0 ? Math.max(8, pctHeight) : 4}%` }}
                          onClick={() => {
                            setSelectedFormId(f.id);
                            setActiveTab("leads");
                          }}
                        >
                          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-[9px] font-bold text-slate-850 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                            {f.submissionCount} leads
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-extrabold truncate max-w-[100px] block" title={f.title}>
                          {f.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Campaigns Table View & Filters & Pagination */}
        {activeTab === "forms" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            
            {/* Filter and Search controls */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">Leads volume:</span>
                  <select
                    value={formsMinLeadsFilter}
                    onChange={(e) => {
                      setFormsMinLeadsFilter(e.target.value as any);
                      setFormsPage(1);
                    }}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none"
                  >
                    <option value="all">All Forms</option>
                    <option value="any">Has Leads (&gt;0)</option>
                    <option value="popular">Popular (&ge;5 leads)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setFormsPage(1);
                    }}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="leads">Most Leads First</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Filter campaigns..."
                  value={formsSearchTerm}
                  onChange={(e) => {
                    setFormsSearchTerm(e.target.value);
                    setFormsPage(1);
                  }}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold placeholder-slate-400 outline-none transition shadow-sm"
                />
              </div>
            </div>

            {/* Campaign Table Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto mb-2"></div>
                <p className="text-slate-500 text-xs font-bold">Loading campaign list...</p>
              </div>
            ) : paginatedForms.length === 0 ? (
              <div className="p-12 text-center text-slate-455 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs font-bold">
                No campaigns match the filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-455 uppercase tracking-widest font-black pb-3">
                      <th className="pb-3 pr-4">Campaign Details</th>
                      <th className="pb-3 pr-4">Funnel Steps</th>
                      <th className="pb-3 pr-4">Leads Count</th>
                      <th className="pb-3 pr-4">Public Landing URL</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedForms.map((form) => {
                      const publicUrl = `${origin}/form/${form.id}`;
                      const stepsCount = getStepsCount(form.fields);
                      return (
                        <tr key={form.id} className="hover:bg-slate-55/50 transition-colors">
                          <td className="py-4 pr-4 max-w-[200px]">
                            <div className="font-extrabold text-slate-900 text-sm truncate">{form.title}</div>
                            <div className="text-slate-450 text-[10px] mt-0.5 line-clamp-1">{form.description}</div>
                          </td>
                          <td className="py-4 pr-4 whitespace-nowrap">
                            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                              {stepsCount} {stepsCount === 1 ? "Step" : "Steps"}
                            </span>
                          </td>
                          <td className="py-4 pr-4 whitespace-nowrap">
                            <span className="flex items-center gap-1 text-xs font-black text-slate-900">
                              <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                              {form.submissionCount}
                            </span>
                          </td>
                          <td className="py-4 pr-4 font-mono max-w-[150px] truncate text-slate-500">
                            <div className="flex items-center gap-1">
                              <span className="truncate">{publicUrl}</span>
                              <button 
                                onClick={() => copyToClipboard(publicUrl)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Copy link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link 
                                href={publicUrl}
                                target="_blank"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-sky-655"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <Link 
                                href={`/admin/create?id=${form.id}`}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-600"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => {
                                  setSelectedFormId(form.id);
                                  setActiveTab("leads");
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold text-slate-700 border border-slate-200/50"
                              >
                                Leads
                              </button>
                              <button 
                                onClick={() => deleteForm(form.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
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
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 text-xs font-bold text-slate-505">
              <span>
                Page {formsPage} of {totalFormsPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormsPage((p) => Math.max(1, p - 1))}
                  disabled={formsPage === 1}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-55 rounded-lg disabled:opacity-40 flex items-center gap-1 transition shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => setFormsPage((p) => Math.min(totalFormsPages, p + 1))}
                  disabled={formsPage === totalFormsPages}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-55 rounded-lg disabled:opacity-40 flex items-center gap-1 transition shadow-sm"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Leads Database Redesigned Table */}
        {activeTab === "leads" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            
            {/* Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Campaign:</span>
                  <select
                    value={selectedFormId}
                    onChange={(e) => {
                      setSelectedFormId(e.target.value);
                      setLeadsPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none"
                  >
                    <option value="all">All Campaigns</option>
                    {forms.map((f) => (
                      <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">Progress:</span>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => {
                      setLeadStatusFilter(e.target.value as any);
                      setLeadsPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none"
                  >
                    <option value="all">All Leads</option>
                    <option value="completed">Completed (100%)</option>
                    <option value="partial">Partial Progress (&lt;100%)</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Filter leads..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setLeadsPage(1);
                  }}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold placeholder-slate-400 outline-none w-full lg:w-64 transition shadow-sm"
                />
              </div>
            </div>

            {/* Redesigned Leads Table */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                <p className="text-slate-500 text-xs font-bold">Syncing leads database...</p>
              </div>
            ) : paginatedSubmissions.length === 0 ? (
              <div className="p-16 text-center text-slate-455 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs font-bold">
                No matching leads found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-450 uppercase tracking-widest font-black pb-3">
                      <th className="pb-3 pr-4">ID</th>
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Phone</th>
                      <th className="pb-3 pr-4">Lead Source</th>
                      <th className="pb-3 pr-4">Progress</th>
                      <th className="pb-3 pr-4">Created Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSubmissions.map((sub, idx) => {
                      const absoluteIndex = (leadsPage - 1) * LEADS_PER_PAGE + idx + 1;
                      
                      // Extract name, email, and phone dynamically
                      const nameVal = extractFieldValue(sub.data, ["fullname", "name"]);
                      const emailVal = extractFieldValue(sub.data, ["email", "mail"]);
                      const phoneVal = extractFieldValue(sub.data, ["phone", "tel", "contact", "mobile"]);

                      return (
                        <tr 
                          key={sub.id} 
                          className="hover:bg-slate-55/80 transition-colors cursor-pointer"
                          onClick={() => setSelectedLead(sub)}
                        >
                          <td className="py-4 pr-4 text-slate-550 font-bold">
                            #{absoluteIndex}
                          </td>
                          <td className="py-4 pr-4 text-slate-900 font-extrabold">
                            {nameVal}
                          </td>
                          <td className="py-4 pr-4 text-slate-700 font-semibold">
                            {emailVal}
                          </td>
                          <td className="py-4 pr-4 text-slate-700 font-semibold">
                            {phoneVal}
                          </td>
                          <td className="py-4 pr-4 text-slate-655 font-bold max-w-[140px] truncate" title={sub.formTitle}>
                            {sub.formTitle}
                          </td>
                          <td className="py-4 pr-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                              sub.progress >= 100 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}>
                              {sub.progress >= 100 ? "Complete" : `${sub.progress}%`}
                            </span>
                          </td>
                          <td className="py-4 pr-4 whitespace-nowrap text-slate-500 font-bold">
                            {formatDate(sub.createdAt)}
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <div className="flex justify-end items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedLead(sub)}
                                className="p-1.5 hover:bg-slate-105 rounded-lg text-slate-500 hover:text-sky-655"
                                title="Inspect Lead"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteSubmission(sub.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
                                title="Delete Lead"
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

            {/* Leads Table Pagination */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 text-xs font-bold text-slate-505">
              <span>
                Page {leadsPage} of {totalLeadsPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
                  disabled={leadsPage === 1}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-55 rounded-lg disabled:opacity-40 flex items-center gap-1 transition shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => setLeadsPage((p) => Math.min(totalLeadsPages, p + 1))}
                  disabled={leadsPage === totalLeadsPages}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-55 rounded-lg disabled:opacity-40 flex items-center gap-1 transition shadow-sm"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* 1. API Webhook Settings Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-500" /> External API Integration
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Connect and forward lead submissions to external systems in real-time. Once a dynamic campaign form is completed, leads are dispatched automatically to the designated services below.
              </p>
              
              <div className="space-y-4">
                {/* Lead Library Backend URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Lead Library Backend Base URL</label>
                  <input
                    type="url"
                    value={leadLibraryUrl}
                    onChange={(e) => setLeadLibraryUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs font-medium outline-none transition shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Base URL of your Lead Library backend system (e.g. <code>http://127.0.0.1:8000</code> or <code>http://dev-bhe-uni.test</code>). Leaving it blank disables direct lead library capture.
                  </span>
                </div>

                {/* Webhook forwarding URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Generic API Webhook URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/v1/leads"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs font-medium outline-none transition shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Third-party URL receiving a JSON POST payload. Leave blank to disable external webhook forwarding.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={saveWebhookSetting}
                    disabled={savingWebhook}
                    className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    {savingWebhook ? "Saving Settings..." : "Save Integration Settings"}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. System Status Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Active System Status
              </h3>
              
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-450 uppercase">Framework:</span>
                  <span className="col-span-3 text-slate-700 font-mono font-bold">Next.js App Router (v16.2.7)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-455 uppercase">Database Engine:</span>
                  <span className="col-span-3 text-slate-700 font-mono font-bold">Prisma Client with SQLite DB (v6.19.3)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-455 uppercase">Database File:</span>
                  <span className="col-span-3 text-slate-700 font-mono">/Users/devriazul/Desktop/form-cms/dev.db</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pb-1">
                  <span className="font-bold text-slate-455 uppercase">Session Strategy:</span>
                  <span className="col-span-3 text-slate-700 font-mono">HttpOnly admin_session secure cookies</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lead Inspector Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedLead(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          ></div>
          
          <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl p-6 md:p-8 space-y-6 z-10 animate-scale-in">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[9px] text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                  Lead Details Record
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-1.5">
                  {selectedLead.formTitle}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Captured Timestamp</span>
                  <span className="font-bold text-slate-800">{formatDate(selectedLead.createdAt)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[9px]">Submission status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase mt-0.5 border ${
                    selectedLead.progress >= 100 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>
                    {selectedLead.progress >= 100 ? "Complete" : `Step ${selectedLead.progress}%`}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Submitted Data Fields:</h4>
                <div className="space-y-3">
                  {Object.entries(selectedLead.data).map(([key, val]) => (
                    <div 
                      key={key} 
                      className="p-3.5 bg-slate-50/30 border border-slate-150 hover:border-slate-200 rounded-xl transition space-y-1"
                    >
                      <span className="text-slate-455 font-extrabold uppercase text-[9px] tracking-wide block">
                        {key}
                      </span>
                      <p className="text-slate-900 font-bold text-xs leading-normal">
                        {Array.isArray(val) ? val.join(", ") : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button 
                onClick={() => {
                  const summaryText = Object.entries(selectedLead.data)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                    .join("\n");
                  navigator.clipboard.writeText(`Campaign: ${selectedLead.formTitle}\nDate: ${formatDate(selectedLead.createdAt)}\n\n${summaryText}`);
                  showToast("Copied lead summary to clipboard", "success");
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Summary
              </button>
              <button 
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/10"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
