"use client";

import React, { memo } from "react";
import { Settings, Trash2 } from "lucide-react";
import { FormField } from "../types";

interface FieldCustomizerProps {
  selectedField: FormField | undefined;
  onUpdateProperty: (id: string, property: keyof FormField, value: any) => void;
  onDeleteField: (id: string) => void;
}

const FieldCustomizer: React.FC<FieldCustomizerProps> = ({
  selectedField,
  onUpdateProperty,
  onDeleteField
}) => {
  if (!selectedField) {
    return (
      <p className="text-slate-400 text-xs italic">
        Select a field in the canvas to customize its settings.
      </p>
    );
  }

  const isStep = selectedField.type === "step";
  const hasOptions = ["select", "radio", "checkbox"].includes(selectedField.type);

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-[#cbd6e2] flex items-center gap-1.5">
        <Settings className="w-4 h-4 text-[#ff7a59]" /> Field Customization
      </h2>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#516f90]">Field Label</label>
        <input 
          type="text"
          value={selectedField.label}
          onChange={(e) => onUpdateProperty(selectedField.id, "label", e.target.value)}
          className="hs-input"
        />
      </div>

      {!isStep && (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#516f90]">Placeholder</label>
            <input 
              type="text"
              value={selectedField.placeholder || ""}
              onChange={(e) => onUpdateProperty(selectedField.id, "placeholder", e.target.value)}
              className="hs-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#516f90]">Help / Example Text</label>
            <input 
              type="text"
              value={selectedField.helpText || ""}
              onChange={(e) => onUpdateProperty(selectedField.id, "helpText", e.target.value)}
              placeholder="e.g. GPA 4.50 / A+ / CGPA 3.20"
              className="hs-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-655">Field Requirement</label>
            <div className="flex bg-[#f5f8fa] p-1 border border-[#cbd6e2] rounded-[3px] text-xs">
              <button
                type="button"
                onClick={() => onUpdateProperty(selectedField.id, "required", false)}
                className={`flex-1 py-1.5 text-center font-bold rounded cursor-pointer transition-all duration-150 ${
                  !selectedField.required 
                    ? "bg-[#ff7a59] text-white shadow-sm" 
                    : "text-[#516f90] hover:text-[#2d3e50]"
                }`}
              >
                Optional
              </button>
              <button
                type="button"
                onClick={() => onUpdateProperty(selectedField.id, "required", true)}
                className={`flex-1 py-1.5 text-center font-bold rounded cursor-pointer transition-all duration-150 ${
                  selectedField.required 
                    ? "bg-[#ff7a59] text-white shadow-sm" 
                    : "text-[#516f90] hover:text-[#2d3e50]"
                }`}
              >
                Mandatory
              </button>
            </div>
          </div>
        </>
      )}

      {hasOptions && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 block">Configure Options</label>
          <div className="space-y-2">
            {selectedField.options?.map((opt, oIdx) => (
              <div key={oIdx} className="flex gap-2">
                <input 
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...(selectedField.options || [])];
                    newOpts[oIdx] = e.target.value;
                    onUpdateProperty(selectedField.id, "options", newOpts);
                  }}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none shadow-sm"
                />
                <button 
                  type="button"
                  onClick={() => {
                    const newOpts = (selectedField.options || []).filter((_, i) => i !== oIdx);
                    onUpdateProperty(selectedField.id, "options", newOpts);
                  }}
                  disabled={(selectedField.options || []).length <= 1}
                  className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button"
            onClick={() => {
              const newOpts = [...(selectedField.options || []), `Option ${(selectedField.options || []).length + 1}`];
              onUpdateProperty(selectedField.id, "options", newOpts);
            }}
            className="w-full mt-2 py-1.5 bg-white border border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 text-sky-600 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            + Add Option
          </button>
        </div>
      )}

      <div className="pt-3 border-t border-slate-200">
        <button 
          type="button"
          onClick={() => onDeleteField(selectedField.id)}
          className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-lg border border-red-200 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Field
        </button>
      </div>
    </div>
  );
};

export default memo(FieldCustomizer);
