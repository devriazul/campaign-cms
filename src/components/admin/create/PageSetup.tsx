"use client";

import React, { memo } from "react";
import { FileText } from "lucide-react";

interface PageSetupProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  titleAlign: string;
  setTitleAlign: (val: string) => void;
  pixelId: string;
  setPixelId: (val: string) => void;
  showBanner: boolean;
  setShowBanner: (val: boolean) => void;
  bannerText: string;
  setBannerText: (val: string) => void;
  bannerLink: string;
  setBannerLink: (val: string) => void;
  bannerImage: string;
  setBannerImage: (val: string) => void;
}

const PageSetup: React.FC<PageSetupProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  titleAlign,
  setTitleAlign,
  pixelId,
  setPixelId,
  showBanner,
  setShowBanner,
  bannerText,
  setBannerText,
  bannerLink,
  setBannerLink,
  bannerImage,
  setBannerImage
}) => {
  return (
    <div className="space-y-5">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-200 flex items-center gap-1.5">
        <FileText className="w-4 h-4 text-[#ff7a59]" /> Page Configuration
      </h2>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-655">Campaign Form Title</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="hs-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-655">Campaign Subtitle / description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="hs-input resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-655">Header Text Alignment</label>
          <div className="flex bg-[#f5f8fa] p-1 border border-[#cbd6e2] rounded-[3px] text-xs">
            {["left", "center", "right"].map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => setTitleAlign(align)}
                className={`flex-1 py-1.5 text-center font-bold rounded capitalize cursor-pointer transition-all duration-150 ${
                  titleAlign === align 
                    ? "bg-[#ff7a59] text-white shadow-sm" 
                    : "text-[#516f90] hover:text-[#2d3e50]"
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        {/* Banner Configuration */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-700">Enable Top Banner</span>
            <input 
              type="checkbox"
              checked={showBanner}
              onChange={(e) => setShowBanner(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-0 accent-sky-500 cursor-pointer"
            />
          </div>

          {showBanner && (
            <div className="space-y-3 pl-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Banner Text</label>
                <input 
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="e.g. Special Offer: 20% Off!"
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs text-slate-800 outline-none shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Banner Image Upload</label>
                {bannerImage && (
                  <div className="relative w-full h-16 rounded-lg overflow-hidden border border-slate-200 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setBannerImage("")}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-650 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const img = new Image();
                        img.src = reader.result as string;
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          const MAX_WIDTH = 1200;
                          let width = img.width;
                          let height = img.height;

                          if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                          }

                          canvas.width = width;
                          canvas.height = height;

                          const ctx = canvas.getContext("2d");
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                            setBannerImage(compressedBase64);
                          } else {
                            setBannerImage(reader.result as string);
                          }
                        };
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Banner Link (Optional)</label>
                <input 
                  type="text"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="e.g. https://your-site.com/offer"
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs text-slate-800 outline-none shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5 border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-655 flex items-center gap-1">
              Tracking Pixel Script
            </label>
            <span className="text-[9px] text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded font-bold uppercase">Pixel</span>
          </div>
          <textarea 
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            placeholder="Paste your Facebook Pixel code, Google Analytics ID, custom script, or HTML tracking scripts here..."
            rows={6}
            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs text-slate-705 font-mono outline-none shadow-sm"
          />
          <p className="text-[10px] text-slate-450 mt-1 leading-normal">
            This script tag will be loaded into the dynamic page header of your public landing page form. Perfect for lead conversion tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(PageSetup);
