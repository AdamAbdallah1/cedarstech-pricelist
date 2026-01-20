import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase.js";
import { collection, onSnapshot } from "firebase/firestore";

export default function Prices() {
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const colRef = collection(db, "services");
    const unsubscribe = onSnapshot(colRef, snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data(), plans: d.data().plans || [] }));
      setServices(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredServices = services
    .map(s => {
      const plans = s.plans || [];
      if (s.name.toLowerCase().includes(search.toLowerCase())) return { ...s, plans };
      const matchingPlans = plans.filter(p =>
        (p.label || "").toLowerCase().includes(search.toLowerCase())
      );
      return { ...s, plans: matchingPlans };
    })
    .filter(s => (s.plans || []).length > 0 || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-12 text-white relative">
      
      <button
        onClick={() => nav("/admin")}
        className="absolute top-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition flex items-center justify-center"
        title="Admin Panel"
      >
        <FiUser size={24} />
      </button>

      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 tracking-tight">
        CedarsTech Subscriptions
      </h1>

      {/* Search */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center bg-slate-900 px-4 py-2 rounded-xl shadow">
        <FiSearch className="text-slate-400 mr-2" size={20} />
        <input
          type="text"
          placeholder="Search services or plans..."
          className="flex-1 bg-transparent outline-none text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
        {filteredServices.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col hover:shadow-2xl transition-all"
          >
            <div className="text-5xl sm:text-6xl mb-4 text-center">{s.icon}</div>
            <h2 className="text-2xl font-semibold mb-6 text-center">{s.name}</h2>

            <ul className="space-y-2">
              {(s.plans || []).map((p, i) => (
                <motion.li
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 bg-slate-800/60 rounded-xl transition-all hover:bg-slate-700/70"
                >
                  <span className="text-lg">{p.label}</span>
                  <span className="flex flex-col items-end">
                    <span className="font-medium">{p.sellPrice || "-"}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
