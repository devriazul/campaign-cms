"use client";

import React, { memo } from "react";
import { Settings, Save } from "lucide-react";

interface PortalSettingsProps {
  webhookUrl: string;
  setWebhookUrl: (val: string) => void;
  leadLibraryUrl: string;
  setLeadLibraryUrl: (val: string) => void;
  savingWebhook: boolean;
  onSaveSettings: () => void;
}

const PortalSettings: React.FC<PortalSettingsProps> = ({
  webhookUrl,
  setWebhookUrl,
  leadLibraryUrl,
  setLeadLibraryUrl,
  savingWebhook,
  onSaveSettings
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6 max-w-2xl">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-sky-500" /> Lead Library Integrations
        </h3>
        <p className="text-slate-450 text-[11px] mt-1">
          Configure outgoing webhook integrations to feed submissions into your unified sales systems.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-655 block">Outgoing Webhook Endpoint</label>
          <input
            type="text"
            placeholder="e.g. https://api.your-crm.com/v1/leads"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="px-4 py-2.5 w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold placeholder-slate-400 outline-none transition shadow-sm"
          />
          <p className="text-[10px] text-slate-450 leading-relaxed pl-1">
            Every time a form is completed, a POST request containing the lead data JSON payload will be sent to this endpoint.
          </p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-655 block">Unified Lead Capture API URL</label>
          <input
            type="text"
            placeholder="e.g. http://localhost:8000/api/leads"
            value={leadLibraryUrl}
            onChange={(e) => setLeadLibraryUrl(e.target.value)}
            className="px-4 py-2.5 w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold placeholder-slate-400 outline-none transition shadow-sm"
          />
          <p className="text-[10px] text-slate-450 leading-relaxed pl-1">
            Optionally specify the unified backend lead-library capture API. If specified, leads will also be captured there dynamically.
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={onSaveSettings}
            disabled={savingWebhook}
            className="hs-button-primary text-xs font-bold py-2.5 px-4.5"
          >
            <Save className="w-4 h-4 mr-1.5" /> {savingWebhook ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(PortalSettings);
