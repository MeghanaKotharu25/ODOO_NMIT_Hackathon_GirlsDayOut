import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Terminal } from 'lucide-react';

export function Startup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-main flex flex-col justify-center items-center overflow-hidden relative page-transition-enter text-primary">
      {/* Background visual elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-heavy rounded-full mix-blend-difference animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] border border-heavy mix-blend-difference animate-[spin_30s_linear_infinite]"></div>
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-3xl px-6">
        <div className="mb-6 flex items-center justify-center space-x-3">
          <Terminal size={32} className="text-primary" />
          <h2 className="font-mono text-sm tracking-[0.2em] text-secondary uppercase">
            System Initialization
          </h2>
        </div>

        <h1 
          className="text-6xl md:text-8xl font-serif mb-8 glitch-text font-bold tracking-tighter" 
          data-text="DAYFLOW HRMS"
        >
          DAYFLOW HRMS
        </h1>

        <p className="text-lg md:text-xl text-secondary mb-12 font-mono max-w-2xl leading-relaxed">
          A sophisticated, cinematic environment for managing human capital. 
          Enter the portal to orchestrate operations with precision.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mt-4 w-full justify-center">
          <Link 
            to="/login"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-mono font-medium text-white bg-black border border-black overflow-hidden transition-all hover:bg-transparent hover:text-black"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center space-x-2 text-white group-hover:text-black">
              <span>INITIALIZE LOGIN</span>
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <Link 
            to="/register"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-mono font-medium text-black bg-transparent border border-strong hover:border-black transition-colors"
          >
            <span className="relative flex items-center space-x-2">
              <span>REGISTER ENTITY</span>
            </span>
          </Link>
        </div>

        {/* Decorative structural elements */}
        <div className="mt-24 flex items-center space-x-4 opacity-30">
          <div className="h-px w-16 bg-heavy"></div>
          <span className="font-mono text-xs uppercase tracking-widest">v2.0.4.beta</span>
          <div className="h-px w-16 bg-heavy"></div>
        </div>
      </div>
    </div>
  );
}
