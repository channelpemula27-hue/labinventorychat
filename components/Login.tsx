import React, { useState } from 'react';
// Hapus import User jika tidak digunakan di file ini, atau sesuaikan path-nya
// import { User } from '../types'; 
import { ShieldCheck, ArrowRight } from 'lucide-react'; // Hapus import Sparkles

// Definisikan tipe User secara lokal jika belum ada file types global
interface User {
  name: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    // Simulate login delay for effect
    setTimeout(() => {
      onLogin({ name: name.trim() });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      
      {/* --- Abstract Animated Background --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        
        {/* Animated Glowing Blobs */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* --- Login Card --- */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden group">
          
          {/* Shine Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            {/* UPDATE: Mengurangi margin bawah dari mb-6 menjadi mb-0 agar teks lebih dekat ke logo */}
            <div className="relative mb-0">
               {/* Glow Effect di belakang logo */}
               <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 rounded-full"></div>
               
               {/* Logo Image tanpa Container Background */}
               {/* UPDATE: Ukuran logo diperbesar dari w-20 menjadi w-28 */}
               <img 
                 src="https://i.postimg.cc/1R7DCsV0/Lab-Flow-Logo-Transparent.png" 
                 alt="LabFlow Logo" 
                 className="w-20 h-20 object-contain relative z-10"
               />
               
               {/* Ikon Spark biru telah dihapus */}
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              LabFlow <span className="text-teal-400">Inventory</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Demo Access for Laboratory Assistant
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-teal-200/80 uppercase tracking-wider ml-1">
                Identity Verification
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 focus:bg-slate-900/80 transition-all outline-none"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ShieldCheck className={`w-5 h-5 transition-colors ${name ? 'text-teal-500' : 'text-slate-600'}`} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              {/* Button Shine Overlay */}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              LabFlow Indonesia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper untuk menjalankan komponen secara independen di preview
export default function App() {
  return <Login onLogin={(user) => console.log("Login user:", user)} />;
}