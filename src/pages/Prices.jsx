import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShoppingBag, FiSearch, FiUser, FiZap, FiSun, FiMoon, 
  FiArrowUpRight, FiFilter, FiInfo, FiX, FiClock, FiActivity, FiCheckCircle, FiChevronLeft,
  FiCopy, FiShare2, FiSlash, FiMessageSquare
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase.js";
import { collection, onSnapshot } from "firebase/firestore";

import WhiteLogo from '../assets/logo-white.png';
import BlackLogo from '../assets/logo-black.png';

export default function Prices() {
  const nav = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("priceLow");
  const [duration, setDuration] = useState("All");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [darkMode, setDarkMode] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [selectedService, setSelectedService] = useState(null);
  const [subType, setSubType] = useState("All");
  const [copyStatus, setCopyStatus] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null); 
  const lbpRate = 89500;

  const typeDescriptions = {
    "Full Account": "Private account. You can change the email and password.",
    "1 User": "Private profile on a shared account. Do not change password.",
    "Private": "Exclusive access. Only you will use this account.",
    "Shared": "Shared access with others. Most affordable option.",
    "Standard": "Standard service terms apply."
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    if (activeTooltip) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeTooltip]);

  useEffect(() => {
    const colRef = collection(db, "services");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        plans: d.data().plans || [],
        category: d.data().category || "Other"
      }));
      setServices(fetched);
      const uniqueCats = Array.from(new Set(fetched.map(s => s.category || "Other")));
      setCategories(["All", ...uniqueCats]);

      const params = new URLSearchParams(window.location.search);
      const serviceId = params.get("s");
      if (serviceId) {
        const found = fetched.find(s => s.id === serviceId || s.name.toLowerCase() === serviceId.toLowerCase());
        if (found) setSelectedService(found);
      }
    });

    return () => unsubscribe();
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const shareService = (service) => {
    const url = `${window.location.origin}${window.location.pathname}?s=${service.id}`;
    navigator.clipboard.writeText(url);
    setCopyStatus('share');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const processedServices = useMemo(() => {
    const filtered = services.map(s => {
      let plans = [...s.plans].filter(p => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        (p.label || "").toLowerCase().includes(search.toLowerCase())
      );
      if (duration !== "All") plans = plans.filter(p => p.duration === duration);
      plans.sort((a, b) => {
        if (sortBy === "priceLow") return (+a.sellPrice || 0) - (+b.sellPrice || 0);
        if (sortBy === "priceHigh") return (+b.sellPrice || 0) - (+a.sellPrice || 0);
        return (a.label || "").localeCompare(b.label || "");
      });
      return { ...s, plans };
    }).filter(s => {
      const matchesSearch = s.plans.length > 0;
      const matchesCategory = category === "All" || s.category === category;
      return matchesSearch && matchesCategory;
    });
    return { filtered };
  }, [services, search, sortBy, duration, category]);

  const availableSubTypes = useMemo(() => {
    if (!selectedService) return ["All"];
    const types = selectedService.plans.map(p => p.type).filter(t => t && t.trim() !== "");
    return ["All", ...new Set(types)];
  }, [selectedService]);

  const formatPrice = (usd) => {
    if (currency === "LBP") return (usd * lbpRate).toLocaleString() + " L.L.";
    return "$" + usd;
  };

  const t = {
    bg: darkMode ? "bg-[#050505]" : "bg-[#fafafa]",
    text: darkMode ? "text-zinc-100" : "text-zinc-900",
    card: darkMode ? "bg-zinc-900/40 border-white/[0.05]" : "bg-white border-zinc-200 shadow-sm",
    item: darkMode ? "bg-white/[0.02] border-white/[0.05]" : "bg-zinc-50 border-zinc-100",
    glass: "backdrop-blur-xl"
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${t.bg} ${t.text} antialiased selection:bg-blue-500/30 font-sans`}>
      
      <nav className={`fixed top-0 w-full z-50 border-b ${darkMode ? 'border-white/[0.05]' : 'border-zinc-200'} ${t.glass}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => {setSelectedService(null); window.scrollTo({top:0, behavior:'smooth'})}}>
            <img src={darkMode ? WhiteLogo : BlackLogo} alt="Cedars Tech" className="w-10 h-10 object-contain transition-transform group-hover:scale-110" />
            <span className="hidden md:block text-[11px] font-black tracking-[0.4em] uppercase">Cedars Tech</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCurrency(currency === "USD" ? "LBP" : "USD")} className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${darkMode ? 'border-white/10 hover:bg-white/5 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-50'} active:scale-95`}>
              {currency}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-zinc-500/10 transition-all">{darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}</button>
            <button onClick={() => nav("/login")} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Account</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-32">
        <AnimatePresence mode="wait">
          {!selectedService ? (
            <motion.div key="grid-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {/* PROFESSIONAL FEATURE: PULSE INDICATOR */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Market Live</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase mb-4">
                    Advanced <span className="text-blue-600">Packages.</span>
                  </h1>
                </div>

                <div className="flex flex-col gap-3">
                   <div className={`relative w-full md:w-72 ${t.glass} rounded-xl border ${darkMode ? 'border-white/10' : 'border-zinc-200'} transition-all focus-within:border-blue-500/50`}>
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className="w-full bg-transparent pl-10 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest outline-none" />
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setShowPayment(true)} className="flex-1 py-3 rounded-xl border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Payments</button>
                      <button className="px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-[9px] font-black uppercase transition-all hover:bg-white/10" onClick={() => {setSearch(""); setCategory("All"); setDuration("All")}}><FiFilter size={15}/></button>
                   </div>
                </div>
              </div>

              <div className="mb-8 flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${category === c ? 'bg-white text-black border-white shadow-lg shadow-white/5' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}>{c}</button>
                ))}
              </div>

              {/* PROFESSIONAL FEATURE: STAGGERED LIST ENTRANCE */}
              <motion.div 
                layout
                className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5"
              >
                {processedServices.filtered.map((s, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    layout key={s.id} onClick={() => { setSelectedService(s); setSubType("All"); }}
                    className={`break-inside-avoid cursor-pointer group p-5 rounded-3xl border ${t.card} relative overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 mb-5`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">{s.category}</span>
                        <h2 className="text-base font-black uppercase tracking-tight leading-none">{s.name}</h2>
                      </div>
                      <FiArrowUpRight size={18} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">View Plans & Options</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-20 p-8 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01] text-center">
                <FiMessageSquare className="mx-auto mb-4 text-blue-500" size={24} />
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Don't see what you need?</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-6">We can provide almost any digital service or subscription.</p>
                <a 
                  href="https://wa.me/96181090757?text=Hi%20Cedars%20Tech,%20I'm%20looking%20for%20a%20service%20not%20listed%20on%20your%20site:" 
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Request Custom Asset <FiArrowUpRight size={14} />
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div key="detail-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => {setSelectedService(null); window.history.replaceState(null, '', window.location.pathname);}} className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                <FiChevronLeft size={16} /> Back to Assets
              </button>
              
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">{selectedService.category}</span>
                  <button 
                    onClick={() => shareService(selectedService)}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    {copyStatus === 'share' ? 'Link Copied' : <><FiShare2 size={12}/> Share Asset</>}
                  </button>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">{selectedService.name}</h1>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {availableSubTypes.map((type) => (
                    <button 
                      key={type} onClick={() => setSubType(type)}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${subType === type ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' : 'border-white/10 text-zinc-500 hover:border-white/20'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedService.plans
                  .filter(p => subType === "All" || p.type === subType)
                  .map((p, i) => {
                    const isStock = p.inStock !== false;
                    const planType = p.type || "Standard";
                    return (
                    <div key={i} className={`p-6 rounded-3xl border ${t.item} relative group ${!isStock && 'opacity-80'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTooltip(activeTooltip === `${i}-type` ? null : `${i}-type`);
                                }}
                                onMouseEnter={() => setActiveTooltip(`${i}-type`)}
                                onMouseLeave={() => setActiveTooltip(null)}
                                className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest group/info cursor-help outline-none"
                              >
                                {planType} <FiInfo size={10} className="opacity-50 group-hover/info:opacity-100 transition-opacity" />
                              </button>
                              
                              <AnimatePresence>
                                {activeTooltip === `${i}-type` && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 5 }} 
                                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                    className="absolute z-[100] left-0 top-full mt-2 w-52 p-4 rounded-2xl bg-zinc-950 border border-blue-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.9)] pointer-events-none"
                                  >
                                    <p className="text-[10px] leading-relaxed text-zinc-100 font-bold uppercase tracking-tight">
                                      {typeDescriptions[planType] || typeDescriptions["Standard"]}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            {!isStock && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-widest">Sold Out</span>
                            )}
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-tight">{p.label}</h3>
                        </div>
                        {/* PROFESSIONAL FEATURE: SMOOTH CURRENCY SWAP */}
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={currency}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="text-2xl font-black tracking-tighter"
                          >
                            {formatPrice(p.sellPrice)}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-6 opacity-60 text-[10px] font-bold uppercase tracking-widest">
                        <FiClock size={12} /> {p.duration}
                      </div>

                      {isStock ? (
                        <a
                          href={`https://wa.me/96181090757?text=ID-${Math.floor(1000+Math.random()*9000)}:%20${encodeURIComponent(selectedService.name + " (" + planType + ") - " + p.label)}`}
                          target="_blank" rel="noreferrer"
                          className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl hover:-translate-y-1"
                        >
                          Order via WhatsApp <FiArrowUpRight size={14} />
                        </a>
                      ) : (
                        <div className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl bg-zinc-500/10 text-zinc-500 font-black text-[10px] uppercase tracking-widest border border-white/5 cursor-not-allowed">
                          Out of Stock <FiSlash size={14} />
                        </div>
                      )}
                    </div>
                  )})}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {processedServices.filtered.length === 0 && !selectedService && (
          <div className="py-20 text-center opacity-30">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Assets Found</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayment(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-sm p-8 rounded-[2rem] border border-white/10 bg-zinc-950"
            >
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Channels</h3>
              <div className="space-y-3">
                {[
                  { name: "Whish Money", detail: "81 090 757", color: "text-blue-500", bg: "bg-blue-500/5" },
                  { name: "OMT", detail: "Adam Abdallah", color: "text-orange-500", bg: "bg-orange-500/5" },
                ].map((m, i) => (
                  <div key={i} className={`p-4 rounded-xl border border-white/5 ${m.bg} flex justify-between items-center group`}>
                    <div className="flex-1">
                      <p className={`text-[9px] font-black uppercase tracking-widest ${m.color} mb-0.5`}>{m.name}</p>
                      <p className="text-xs font-bold text-white/80">{m.detail}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(m.detail, i)}
                      className={`p-2 rounded-lg transition-all ${copyStatus === i ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                    >
                      {copyStatus === i ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-12 border-t border-white/[0.05] opacity-30 text-center">
         <span className="text-[9px] font-black uppercase tracking-[0.4em]">Cedars Tech LB // {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}