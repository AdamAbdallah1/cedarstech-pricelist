import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2, FiPlus, FiLogOut, FiDownload, FiSearch,
  FiChevronDown, FiChevronUp
} from "react-icons/fi";
import { db } from "../../firebase.js";
import {
  collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";

export default function Admin({ setIsAuthed }) {
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const colRef = collection(db, "services");
    const unsubscribe = onSnapshot(colRef, snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data(), plans: d.data().plans || [] }));
      setServices(data);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => {
    localStorage.removeItem("cedars_admin_auth");
    setIsAuthed(false);
    nav("/login");
  };

  const viewPrices = () => nav("/prices");

  const addService = async () => {
    await addDoc(collection(db, "services"), {
      name: "",
      icon: "",
      plans: [],
      updatedAt: serverTimestamp()
    });
  };

  const removeService = async (id) => {
    await deleteDoc(doc(db, "services", id));
  };

  const updateServiceField = async (id, field, value) => {
    await updateDoc(doc(db, "services", id), { [field]: value, updatedAt: serverTimestamp() });
  };

  const updatePlanField = async (serviceId, plans, index, field, value) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    await updateDoc(doc(db, "services", serviceId), { plans: updatedPlans, updatedAt: serverTimestamp() });
  };

  const addPlan = async (service) => {
    const newPlans = [...service.plans, { label: "", costPrice: "", sellPrice: "" }];
    await updateDoc(doc(db, "services", service.id), { plans: newPlans, updatedAt: serverTimestamp() });
  };

  const removePlan = async (service, index) => {
    const newPlans = [...service.plans];
    newPlans.splice(index, 1);
    await updateDoc(doc(db, "services", service.id), { plans: newPlans, updatedAt: serverTimestamp() });
  };

  const exportToCSV = () => {
    let csv = "Service,Plan,Cost,Sell,Profit,Profit%\n";
    services.forEach(s => {
      (s.plans || []).forEach(p => {
        const cost = +p.costPrice || 0;
        const sell = +p.sellPrice || 0;
        const profit = sell - cost;
        const pct = cost ? ((profit / cost) * 100).toFixed(1) : 0;
        csv += `"${s.name}","${p.label}",${cost},${sell},${profit},${pct}%\n`;
      });
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cedars_pricing_report.csv";
    a.click();
  };

  const filteredServices = services
    .map(s => {
      const plans = s.plans || [];
      if (s.name.toLowerCase().includes(search.toLowerCase())) return { ...s, plans };
      const matchingPlans = plans.filter(p =>
        (p.label || "").toLowerCase().includes(search.toLowerCase())
      );
      return { ...s, plans: matchingPlans };
    })
    .filter(s => (s.plans || []).length > 0 || s.name.toLowerCase().includes(search.toLowerCase()) || s.name === "");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-10 text-white flex justify-center items-start">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">CedarsTech Admin Panel</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sticky top-0 z-10 bg-opacity-90 p-2 sm:p-0 justify-center rounded-xl shadow">
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full sm:w-auto">
            <div className="flex items-center bg-slate-900 px-3 py-2 rounded-xl shadow flex-1 sm:flex-none">
              <FiSearch className="text-slate-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search service or plan..."
                className="bg-transparent outline-none text-white w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button onClick={exportToCSV} className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-500 transition shadow">
              <FiDownload /> Export CSV
            </button>

            <button onClick={addService} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-500 transition shadow">
              <FiPlus /> Add Service
            </button>

            <button onClick={viewPrices} className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-500 transition shadow">
              View Prices
            </button>

            <button onClick={logout} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-xl hover:bg-red-500 transition shadow">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {filteredServices.map((s, i) => {
              const totalProfit = (s.plans || []).reduce((acc, p) => {
                const cost = +p.costPrice || 0;
                const sell = +p.sellPrice || 0;
                return acc + (sell - cost);
              }, 0);

              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-lg hover:shadow-2xl transition flex flex-col"
                >
                  <div className="flex justify-between items-center mb-4 gap-2 cursor-pointer" onClick={() => setExpanded(prev => ({ ...prev, [s.id]: !prev[s.id] }))}>
                    <input
                      className="bg-slate-800 px-3 py-2 rounded w-full sm:w-auto flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={s.name}
                      placeholder="Service name"
                      onChange={e => updateServiceField(s.id, "name", e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        className="w-10 h-10 text-center rounded bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Icon"
                        value={s.icon}
                        onChange={e => updateServiceField(s.id, "icon", e.target.value)}
                      />
                      <button onClick={() => removeService(s.id)} className="text-red-400 hover:text-red-500">
                        <FiTrash2 size={22} />
                      </button>
                      {expanded[s.id] ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                    </div>
                  </div>

                  {expanded[s.id] && (
                    <div className="space-y-2 overflow-x-auto">
                      {(s.plans || []).map((p, pi) => {
                        const cost = +p.costPrice || 0;
                        const sell = +p.sellPrice || 0;
                        const profit = sell - cost;
                        const profitPct = cost ? ((profit / cost) * 100).toFixed(1) : "0";

                        return (
                          <motion.div key={pi} layout className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center bg-slate-800/50 p-2 rounded min-w-75">
                            <input
                              className="col-span-1 sm:col-span-2 bg-slate-800 px-2 py-1 rounded outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="New Plan"
                              value={p.label}
                              onChange={e => updatePlanField(s.id, s.plans, pi, "label", e.target.value)}
                            />
                            <input
                              className="bg-slate-800 px-2 py-1 rounded outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Cost"
                              value={p.costPrice}
                              onChange={e => updatePlanField(s.id, s.plans, pi, "costPrice", e.target.value)}
                            />
                            <input
                              className="bg-slate-800 px-2 py-1 rounded outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Sell"
                              value={p.sellPrice}
                              onChange={e => updatePlanField(s.id, s.plans, pi, "sellPrice", e.target.value)}
                            />
                            <div className={`text-sm font-semibold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {profit >= 0 ? "+" : ""}{profit.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-400">{profitPct}%</div>
                            <button onClick={() => removePlan(s, pi)} className="text-red-400 hover:text-red-500">
                              <FiTrash2 />
                            </button>
                          </motion.div>
                        );
                      })}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => addPlan(s)}
                        className="mt-2 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <FiPlus /> Add Plan
                      </motion.button>

                      <div className="mt-2 text-right font-semibold text-lg text-emerald-400">
                        Total Profit: {totalProfit.toFixed(2)}
                      </div>

                      {s.updatedAt && (
                        <div className="text-right text-xs text-slate-400">
                          Last Updated: {new Date(s.updatedAt.seconds * 1000).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
