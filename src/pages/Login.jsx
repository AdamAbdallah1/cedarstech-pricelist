import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";

export default function Login({ setIsAuthed }) {
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false); 
  const [remember, setRemember] = useState(false);
  const nav = useNavigate();

  const login = async () => {
    try {
      const docRef = doc(db, "admin", "main");
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Admin password not set!");
        return;
      }

      const correctPass = docSnap.data().password;

      if (pass === correctPass) {
        if (remember) {
          localStorage.setItem("cedars_admin_auth", "true");
        } else {
          sessionStorage.setItem("cedars_admin_auth", "true");
        }

        setIsAuthed(true);
        nav("/admin");
      } else {
        alert("Wrong password");
      }
    } catch (err) {
      alert("Login error: " + err.message);
    }
  };

  const mainPage = () => {
    nav("/prices");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900 p-10 rounded-2xl shadow-xl w-80">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            className="w-full p-3 rounded bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPass(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>

        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          Remember Me
        </label>

        <div className="flex flex-col gap-3">
          <button
            onClick={login}
            className="w-full bg-blue-600 py-3 rounded-xl hover:bg-blue-500 transition font-medium shadow"
          >
            Login
          </button>

          <button
            onClick={mainPage}
            className="w-full bg-red-600 py-3 rounded-xl hover:bg-red-500 transition font-medium shadow"
          >
            Main Page
          </button>
        </div>
      </div>
    </div>
  );
}
