"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { FormSummary, Submission, Toast } from "@/components/admin/types";
import SidebarMenu from "@/components/admin/dashboard/SidebarMenu";
import StatCards from "@/components/admin/dashboard/StatCards";
import PerformanceChart from "@/components/admin/dashboard/PerformanceChart";
import FormsRegistry from "@/components/admin/dashboard/FormsRegistry";
import LeadsDatabase from "@/components/admin/dashboard/LeadsDatabase";
import PortalSettings from "@/components/admin/dashboard/PortalSettings";
import ToastNotifications from "@/components/admin/dashboard/ToastNotifications";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "forms" | "leads" | "settings">("dashboard");
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // Interactive Filters
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | "completed" | "partial">("all");
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);

  // Webhook and lead capture API states
  const [webhookUrl, setWebhookUrl] = useState("");
  const [leadLibraryUrl, setLeadLibraryUrl] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  
  const [origin, setOrigin] = useState("");

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const fetchData = useCallback(async () => {
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
  }, [showToast]);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchData();
  }, [fetchData]);

  const fetchWebhookSetting = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (activeTab === "settings") {
      fetchWebhookSetting();
    }
  }, [activeTab, fetchWebhookSetting]);

  const saveWebhookSetting = useCallback(async () => {
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
  }, [webhookUrl, leadLibraryUrl, showToast]);

  const deleteForm = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this form? All associated submissions will be lost.")) {
      return;
    }
    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setForms((prev) => prev.filter((f) => f.id !== id));
        setSubmissions((prev) => prev.filter((s) => s.formId !== id));
        showToast("Campaign deleted successfully", "success");
      }
    } catch (err) {
      console.error("Error deleting form:", err);
      showToast("Delete failed", "error");
    }
  }, [showToast]);

  const deleteSubmission = useCallback(async (subId: string) => {
    if (!confirm("Are you sure you want to delete this lead submission?")) {
      return;
    }
    try {
      const res = await fetch(`/api/submissions/${subId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== subId));
        showToast("Submission deleted successfully", "success");
      }
    } catch (err) {
      console.error("Error deleting submission:", err);
      showToast("Delete failed", "error");
    }
  }, [showToast]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Form link copied to clipboard!", "info");
  }, [showToast]);

  const handleLogout = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/admin/login";
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  }, []);

  const totalLeads = useMemo(() => submissions.length, [submissions]);
  const completedLeads = useMemo(() => submissions.filter((s) => s.progress >= 100).length, [submissions]);
  const completionRate = useMemo(() => (totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0), [totalLeads, completedLeads]);

  const handleNavigateToLeads = useCallback((formId: string) => {
    setSelectedFormId(formId);
    setLeadStatusFilter("all");
    setActiveTab("leads");
  }, []);

  const handleNavigateToLeadsByStatus = useCallback((status: "all" | "completed" | "partial") => {
    setSelectedFormId("all");
    setLeadStatusFilter(status);
    setActiveTab("leads");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans relative">
      <ToastNotifications toasts={toasts} />

      {/* Left Sidebar Menu */}
      <SidebarMenu 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

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
                className="hs-button-primary text-xs font-bold py-2.5 px-4.5"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Create Campaign Form
              </Link>
            )}
            <button 
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="hs-button-secondary text-xs font-bold py-2.5 px-4.5"
            >
              Sync Records
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <StatCards 
              formsCount={forms.length}
              totalLeads={totalLeads}
              completionRate={completionRate}
              onNavigateToForms={() => setActiveTab("forms")}
              onNavigateToLeads={handleNavigateToLeadsByStatus}
            />
            <PerformanceChart 
              forms={forms}
              totalLeads={totalLeads}
              onSelectForm={handleNavigateToLeads}
            />
          </div>
        )}

        {activeTab === "forms" && (
          <FormsRegistry 
            forms={forms}
            loading={loading}
            onDeleteForm={deleteForm}
            onNavigateToLeads={handleNavigateToLeads}
            onCopyLink={copyToClipboard}
          />
        )}

        {activeTab === "leads" && (
          <LeadsDatabase 
            submissions={submissions}
            forms={forms}
            loading={loading}
            selectedFormId={selectedFormId}
            setSelectedFormId={setSelectedFormId}
            leadStatusFilter={leadStatusFilter}
            setLeadStatusFilter={setLeadStatusFilter}
            onDeleteSubmission={deleteSubmission}
          />
        )}

        {activeTab === "settings" && (
          <PortalSettings 
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            leadLibraryUrl={leadLibraryUrl}
            setLeadLibraryUrl={setLeadLibraryUrl}
            savingWebhook={savingWebhook}
            onSaveSettings={saveWebhookSetting}
          />
        )}
      </main>
    </div>
  );
}
