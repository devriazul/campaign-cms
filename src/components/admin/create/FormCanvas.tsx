"use client";

import React, { useState, memo, useCallback } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  HelpCircle,
  MousePointer 
} from "lucide-react";
import { FormField } from "../types";

interface FormCanvasProps {
  title: string;
  description: string;
  titleAlign: string;
  fields: FormField[];
  selectedFieldId: string | null;
  showBanner: boolean;
  bannerText: string;
  bannerImage: string;
  bannerLink: string;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onMoveField: (index: number, direction: "up" | "down") => void;
  onReorderFields: (fields: FormField[]) => void;
}

const FormCanvas: React.FC<FormCanvasProps> = ({
  title,
  description,
  titleAlign,
  fields,
  selectedFieldId,
  showBanner,
  bannerText,
  bannerImage,
  bannerLink,
  onSelectField,
  onDeleteField,
  onMoveField,
  onReorderFields
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const updated = [...fields];
    const draggedItem = updated[draggedIdx];
    updated.splice(draggedIdx, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    onReorderFields(updated);
  }, [draggedIdx, fields, onReorderFields]);

  const handleDragEnd = useCallback(() => {
    setDraggedIdx(null);
  }, []);

  return (
    <main className="flex-1 bg-[#f5f8fa] p-6 md:p-8 overflow-y-auto flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header Preview card */}
        <div className="rounded-lg bg-white border border-[#cbd6e2] shadow-sm overflow-hidden">
          {showBanner && (
            <div className="w-full relative overflow-hidden flex items-center justify-center bg-[#f5f8fa] border-b border-[#cbd6e2] h-36 sm:h-44">
              {bannerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover block" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#2d3e50] to-[#ff7a59] flex items-center justify-center px-4 text-center">
                  <p className="text-white text-xs font-bold tracking-tight drop-shadow-md">
                    {bannerText || "Exclusive Campaign Banner"}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className={`p-6 ${
            titleAlign === "center" ? "text-center" : titleAlign === "right" ? "text-right" : "text-left"
          }`}>
            <span className="text-[10px] text-[#ff7a59] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#ff7a59]/10 border border-[#ff7a59]/20 rounded">
              Header Preview
            </span>
            <h2 className="text-xl font-bold text-[#2d3e50] mt-4">{title || "Form Title"}</h2>
            <p className="text-[#516f90] text-xs mt-1.5">{description || "No description specified."}</p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-[#cbd6e2] rounded bg-white">
              <MousePointer className="w-10 h-10 mx-auto mb-2 text-[#cbd6e2]" />
              <p className="font-bold text-sm text-[#2d3e50]">Your Canvas is Empty</p>
              <p className="text-xs text-[#516f90] mt-1">Add components from the left sidebar to start building.</p>
            </div>
          ) : (
            fields.map((field, idx) => {
              const isSelected = field.id === selectedFieldId;
              const isStep = field.type === "step";

              return (
                <div 
                  key={field.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectField(field.id)}
                  className={`p-5 rounded border transition-all duration-150 cursor-grab active:cursor-grabbing relative group ${
                    isStep 
                      ? "bg-[#ff7a59]/5 border-dashed border-[#ff7a59]/40 hover:border-[#ff7a59]" 
                      : "bg-white border-[#cbd6e2] hover:border-[#a3b6cc] shadow-sm"
                  } ${isSelected ? "ring-2 ring-[#ff7a59] border-transparent bg-white shadow-md" : ""}`}
                >
                  {/* Control buttons overlay on hover */}
                  <div className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1 bg-white p-1 border border-[#cbd6e2] shadow-sm rounded">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveField(idx, "up");
                      }}
                      disabled={idx === 0}
                      className="p-1 text-[#516f90] hover:text-[#2d3e50] disabled:opacity-30 transition cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveField(idx, "down");
                      }}
                      disabled={idx === fields.length - 1}
                      className="p-1 text-[#516f90] hover:text-[#2d3e50] disabled:opacity-30 transition cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteField(field.id);
                      }}
                      className="p-1 text-[#516f90] hover:text-red-500 transition cursor-pointer"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Display Label */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      isStep ? "bg-[#ff7a59]/10 text-[#ff7a59] border border-[#ff7a59]/20" : "bg-[#f5f8fa] text-[#516f90] border border-[#cbd6e2]"
                    }`}>
                      {field.type}
                    </span>
                    <span className={`font-bold text-xs ${isStep ? "text-[#ff7a59] text-sm" : "text-[#2d3e50]"}`}>
                      {field.label} {field.required && <span className="text-[#ff7a59]">*</span>}
                    </span>
                  </div>

                  {/* Preview Inputs */}
                  {!isStep && (
                    <div className="mt-2 pointer-events-none">
                      {field.type === "text" && (
                        <input 
                          type="text" 
                          placeholder={field.placeholder || "Enter answer..."}
                          className="w-full px-3 py-2 bg-[#f5f8fa] border border-[#cbd6e2] text-xs rounded-[3px] text-[#33475b]"
                          readOnly
                        />
                      )}
                      {field.type === "textarea" && (
                        <textarea 
                          placeholder={field.placeholder || "Enter long answer..."}
                          rows={2}
                          className="w-full px-3 py-2 bg-[#f5f8fa] border border-[#cbd6e2] text-xs rounded-[3px] text-[#33475b] resize-none"
                          readOnly
                        />
                      )}
                      {field.type === "select" && (
                        <select className="w-full px-3 py-2 bg-[#f5f8fa] border border-[#cbd6e2] text-xs rounded-[3px] text-[#33475b]" disabled>
                          <option>{field.placeholder || "Choose option..."}</option>
                          {field.options?.map((opt, i) => (
                            <option key={i}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {field.type === "radio" && (
                        <div className="space-y-1.5 mt-2">
                          {field.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="radio" checked={false} readOnly className="accent-[#ff7a59] border-[#cbd6e2] w-3.5 h-3.5" />
                              <span className="text-[#516f90] text-xs font-semibold">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {field.type === "checkbox" && (
                        <div className="space-y-1.5 mt-2">
                          {field.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="checkbox" checked={false} readOnly className="accent-[#ff7a59] border-[#cbd6e2] rounded w-3.5 h-3.5" />
                              <span className="text-[#516f90] text-xs font-semibold">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {field.helpText && (
                        <p className="text-[11px] text-[#516f90] mt-1.5 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-[#cbd6e2]" /> {field.helpText}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default memo(FormCanvas);
