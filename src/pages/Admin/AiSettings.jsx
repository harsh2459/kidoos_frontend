import { useState, useEffect } from "react";
import { api } from "../../api/client"; 
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import {
    Save, Key, Bot, Sparkles, Plus, Trash2,
    RefreshCw, CheckCircle, AlertTriangle, Search
} from "lucide-react";

const INPUT_STYLE = "w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none text-[#2C3E38]";

export default function AiSettings() {
    const { token } = useAuth();
    const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("keys");
    const [availableModels, setAvailableModels] = useState([]); 

    const [config, setConfig] = useState({
        provider: "gemini",
        modelName: "gemini-1.5-flash",
        keys: [] 
    });

    const [prompt, setPrompt] = useState("");
    const [newKey, setNewKey] = useState("");
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        setLoading(true);
        try {
            const { data } = await api.get("/settings/ai", auth);
            if (data.ok) {
                setConfig(data.config || { provider: "gemini", modelName: "gemini-1.5-flash", keys: [] });
                setPrompt(data.prompt || "");
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    }

    async function checkModels() {
        if (config.keys.length === 0) {
            return t.err("Add a valid API Key first!");
        }

        const toastId = t.loading("Asking Google for available models...");
        try {
            const { data } = await api.get("/ai/models", auth);
            if (data.ok && data.models.length > 0) {
                setAvailableModels(data.models);
                
                if (!data.models.includes(config.modelName)) {
                    setConfig(prev => ({ ...prev, modelName: data.models[0] }));
                }

                t.dismiss(toastId);
                t.ok(`Found ${data.models.length} models!`);
            } else {
                throw new Error("No models returned");
            }
        } catch (e) {
            t.dismiss(toastId);
            t.err("Could not list models. Check Key or Backend logs.");
        }
    }

    async function save() {
        setSaving(true);
        try {
            await api.put("/settings/ai", { config, prompt }, auth);
            t.ok("Saved!");
        } catch (error) {
            t.err("Failed to save");
        } finally {
            setSaving(false);
        }
    }

    function addKey() {
        if (!newKey.trim()) return t.err("Enter Key");
        setConfig(prev => ({
            ...prev,
            keys: [...(prev.keys || []), { key: newKey.trim(), label: newLabel.trim() || `Key ${prev.keys.length + 1}`, isExhausted: false }]
        }));
        setNewKey(""); setNewLabel("");
    }

    function removeKey(index) {
        if (window.confirm("Remove?")) setConfig(prev => ({ ...prev, keys: prev.keys.filter((_, i) => i !== index) }));
    }

    function resetKeyStatus(index) {
        setConfig(prev => {
            const updated = [...prev.keys];
            updated[index] = { ...updated[index], isExhausted: false };
            return { ...prev, keys: updated };
        });
        t.ok("Reset");
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] pb-20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-[#1A3C34]">AI Configuration</h1>
                    <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold hover:bg-[#2F523F] flex gap-2">
                        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                    </button>
                </div>

                <div className="flex gap-4 mb-6 border-b border-[#E3E8E5]">
                    <button onClick={() => setActiveTab("keys")} className={`pb-3 px-1 font-bold border-b-2 ${activeTab === "keys" ? "border-[#1A3C34] text-[#1A3C34]" : "border-transparent text-gray-400"}`}>API Keys & Model</button>
                    <button onClick={() => setActiveTab("prompt")} className={`pb-3 px-1 font-bold border-b-2 ${activeTab === "prompt" ? "border-[#1A3C34] text-[#1A3C34]" : "border-transparent text-gray-400"}`}>Prompt</button>
                </div>

                {activeTab === "keys" && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5]">
                            <h3 className="text-xl font-bold mb-4 flex gap-2 items-center"><Sparkles className="w-5 h-5"/> Model Selection</h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold block mb-2">Model Version</label>
                                    
                                    <div className="flex gap-2">
                                        <select 
                                            className={INPUT_STYLE}
                                            value={config.modelName}
                                            onChange={e => setConfig({ ...config, modelName: e.target.value })}
                                        >
                                            {availableModels.length > 0 ? (
                                                availableModels.map(m => <option key={m} value={m}>{m}</option>)
                                            ) : (
                                                <>
                                                    <option value={config.modelName}>{config.modelName} (Current)</option>
                                                    <option value="" disabled>--- Click Search to Load Models ---</option>
                                                </>
                                            )}
                                        </select>
                                        
                                        <button 
                                            onClick={checkModels}
                                            className="px-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 flex items-center justify-center"
                                            title="Fetch valid models from Google"
                                        >
                                            <Search className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Click the <Search className="w-3 h-3 inline"/> icon to load the exact models supported by your API Key.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5]">
                            <h3 className="text-xl font-bold mb-4 flex gap-2 items-center"><Key className="w-5 h-5"/> API Keys</h3>
                            <div className="flex gap-3 mb-4">
                                <input className={INPUT_STYLE} placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
                                <input className={INPUT_STYLE} placeholder="API Key (AIza...)" value={newKey} onChange={e => setNewKey(e.target.value)} />
                                <button onClick={addKey} className="px-4 bg-[#1A3C34] text-white rounded-xl"><Plus/></button>
                            </div>
                            <div className="space-y-2">
                                {config.keys.map((k, i) => (
                                    <div key={i} className={`flex justify-between p-3 border rounded-xl ${k.isExhausted ? 'bg-red-50' : 'bg-white'}`}>
                                        <div className="flex gap-3 items-center">
                                            <div className={`w-2 h-2 rounded-full ${k.isExhausted ? 'bg-red-500' : 'bg-green-500'}`} />
                                            <span className="font-bold text-sm">{k.label}</span>
                                            <span className="text-xs font-mono text-gray-400">{k.key.slice(0,8)}...</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => resetKeyStatus(i)}><RefreshCw className="w-4 h-4 text-gray-500"/></button>
                                            <button onClick={() => removeKey(i)}><Trash2 className="w-4 h-4 text-red-400"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ FIXED: PROMPT SECTION RESTORED */}
                {activeTab === "prompt" && (
                    <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5]">
                        <h3 className="text-xl font-bold mb-4 flex gap-2 items-center"><Bot className="w-5 h-5"/> System Prompt</h3>
                        <p className="text-sm text-[#5C756D] mb-4">
                            This prompt tells the AI how to analyze the book cover. 
                            <strong> Warning:</strong> Be careful not to break the JSON structure instructions.
                        </p>
                        <textarea 
                            className="w-full h-[500px] bg-[#2C3E38] text-[#E3E8E5] font-mono text-sm p-6 rounded-xl border border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/50 outline-none leading-relaxed"
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)} 
                            spellCheck="false"
                        />
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => {
                                    if (window.confirm("Reset prompt to default?")) setPrompt(DEFAULT_PROMPT_BACKUP);
                                }}
                                className="text-xs font-bold text-[#5C756D] hover:text-[#1A3C34] underline"
                            >
                                Reset to Default
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const DEFAULT_PROMPT_BACKUP = `You are a senior publishing editor, curriculum designer, and marketing copy expert.

You are given ONE OR MORE BOOK COVER IMAGES.
Analyze the images deeply and infer the book’s intent, audience, subject, tone, and positioning.

CRITICAL RULES (MANDATORY):
- Output MUST be valid JSON only.
- DO NOT include markdown, explanations, or extra text.
- NEVER return null, undefined, or empty strings.
- Arrays must always contain at least one item.
- All text must be professional, clear, and sales-ready.
- Be realistic and conservative in claims.
- If information is not visible, infer logically using publishing standards.

---

🎯 OBJECTIVE  
Generate a complete, production-ready book listing that can directly populate an admin “Add Book” form and page builder.

---

📦 REQUIRED JSON STRUCTURE (STRICT)

{
  "title": "",
  "subtitle": "",
  "language": "English",
  "ageGroup": "",
  "bookType": "",
  "descriptionHtml": "",
  "categories": [],
  "tags": [],
  "whyChooseThis": [],
  "layoutConfig": {
    "story": {
      "heading": "Why We Created This?",
      "text": "",
      "quote": ""
    },
    "curriculum": [
      {
        "title": "",
        "description": "",
        "icon": ""
      }
    ],
    "specs": [
      {
        "label": "",
        "value": ""
      }
    ],
    "testimonials": [
      {
        "name": "",
        "role": "",
        "rating": 5,
        "text": ""
      }
    ]
  }
}

---

🧠 FIELD GUIDELINES (IMPORTANT)

• title  
Clear, parent-facing or learner-facing book title.

• subtitle  
Benefit-driven explanation of what the book helps achieve.

• authors  
If no author visible, use values like:
"Curriculum Experts", "Early Learning Specialists", "Editorial Team".

• ageGroup  
Examples: "3–5", "4–6", "6–8", "All Ages".

• bookType  
Choose ONE:
"Activity Book", "Story Book", "Workbook", "Curriculum Book".

• descriptionHtml  
HTML ONLY.  
Use <p>, <strong>, <ul>, <li>.  
2 short paragraphs + one bullet list.

---

📘 layoutConfig.story

• heading  
Always keep: "Why We Created This?"

• text  
Explain the purpose, learning philosophy, and emotional value.

• quote  
SHORT, emotional highlight quote.
Example:
"A joyful way for families to learn and grow together."

---

🎓 layoutConfig.curriculum (VERY IMPORTANT)

Generate 3–6 curriculum items.

Each item MUST include:
- title → Skill name (e.g. "Systematic Phonics")
- description → One clear learning benefit
- icon → One of the following ONLY:

Allowed icons:
star, brain, book-open, pencil, calculator, globe,
music, palette, puzzle, users, trophy, target,
sparkles, graduation-cap, rocket, feather, eye

Icons must logically match the skill.

---

📐 layoutConfig.specs

Include 3–5 realistic product specifications such as:
- Pages
- Binding
- Paper Quality
- Language
- Ideal Age

---

💬 layoutConfig.testimonials (Manual Testimonials)

Generate 2–3 realistic testimonials.

Rules:
- Use believable human names
- Include role or location (e.g. Parent, Teacher, Mumbai)
- rating must be a number between 4–5
- text must sound natural and specific

Example tone:
"My child looks forward to reading every day now."

---

🛑 HARD FAILURE CONDITIONS  
The output is INVALID if:
- Any required key is missing
- Any array is empty
- Any value is null or placeholder text
- Output is not pure JSON

---

✅ FINAL INSTRUCTION  
Return ONLY the JSON object.  
Do not add anything else.

`;