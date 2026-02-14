// src/pages/admin/ShiprocketPanel.jsx
import { useState } from "react";
import { ShipAPI } from "../../api/shiprocket";
import t from "../../lib/toast";
import { Truck, Printer, FileText, RefreshCw, Rocket } from "lucide-react";

export default function ShiprocketPanel({ selected, auth, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // 1. Auto-Ship Orders
  const handleCreate = async () => {
    if (selected.size === 0) return t.error("Select orders first");
    setLoading(true);
    try {
      const data = await ShipAPI.create(Array.from(selected), auth);
      
      if (data.ok) {
        const results = data.data;
        const success = results.success?.length || 0;
        const failed = results.failed?.length || 0;
        
        if (success > 0) t.success(`${success} Orders Shipped!`);
        if (failed > 0) t.error(`${failed} Failed. Check logs.`);
        if (onSuccess) onSuccess();
      } else {
        t.error(data.error || "Shiprocket Creation Failed");
      }
    } catch (e) {
      t.error(e.response?.data?.error || "Shiprocket Creation Failed");
    } finally {
      setLoading(false);
    }
  }; 

  // ✅ FIX: Download Labels
  const handleLabel = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      // ✅ DON'T destructure - ShipAPI.label() returns response directly
      const response = await ShipAPI.label(Array.from(selected), auth);
      
      console.log("Label Response:", response); // Debug log
      
      if (response.ok) {
        const labelUrl = response.data?.label_url;
        if (labelUrl) {
          window.open(labelUrl, "_blank");
          t.success("Label Generated!");
        } else {
          t.error("Label URL not found in response");
        }
      } else {
        t.error(response.error || "Label generation failed");
      }
    } catch (e) {
      console.error("Label Error:", e);
      t.error(e.response?.data?.error || "Label Generation Failed");
    } finally {
      setLoading(false);
    }
  };    

  // ✅ FIX: Download Manifest
  const handleManifest = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      // ✅ DON'T destructure - ShipAPI.manifest() returns response directly
      const response = await ShipAPI.manifest(Array.from(selected), auth);
      
      console.log("Manifest Response:", response); // Debug log
      
      if (response.ok) {
        const manifestUrl = response.data?.manifest_url;
        if (manifestUrl) {
          window.open(manifestUrl, "_blank");
          t.success("Manifest Generated!");
        } else {
          t.error("Manifest URL not found in response");
        }
      } else {
        t.error(response.error || "Manifest generation failed");
      }
    } catch (e) {
      console.error("Manifest Error:", e);
      t.error(e.response?.data?.error || "Manifest Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 animate-in fade-in">
      <div className="h-8 w-px bg-gray-300 mx-2"></div>
      
      {/* Main Create Button */}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-[#384959] text-white text-sm font-medium rounded-lg hover:bg-[#6A89A7] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Rocket className="w-4 h-4" />
        )}
        Shiprocket
      </button>

      {/* Print Label */}
      {/* <button
        onClick={handleLabel}
        disabled={loading}
        className="p-2 text-[#384959] bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#C8E6C9] rounded-lg disabled:opacity-50 transition-colors"
        title="Print Shiprocket Label"
      >
        <Printer className="w-4 h-4" />
      </button> */}

      {/* Download Manifest */}
      {/* <button
        onClick={handleManifest}
        disabled={loading}
        className="p-2 text-[#384959] bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#C8E6C9] rounded-lg disabled:opacity-50 transition-colors"
        title="Download Manifest"
      >
        <FileText className="w-4 h-4" />
      </button> */}
    </div>
  );
}
