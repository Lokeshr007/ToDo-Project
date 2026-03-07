import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

import AnimatedBackground from "./AnimatedBackground";
import HomeHeader from "./HomeHeader";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import ForWho from "./ForWho";
import AISection from "./AISection";
import Testimonials from "./Testimonials";
import CTA from "./CTA";
import Footer from "./Footer";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate]);

  const handleGetStarted = () => navigate("/register");
  const handleSignIn = () => navigate("/login");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 font-sans selection:bg-blue-500/30 selection:text-white">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <HomeHeader onSignIn={handleSignIn} onGetStarted={handleGetStarted} />
        
        <main>
          <Hero onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
          
          <div className="space-y-32 mb-32">
            <HowItWorks />
            <Features />
            <ForWho />
            <AISection />
            <Testimonials />
            <CTA onGetStarted={handleGetStarted} />
          </div>
        </main>

        <Footer />
      </div>

      {/* Global Grain Overlay for Premium Feel */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
};

export default Home;
