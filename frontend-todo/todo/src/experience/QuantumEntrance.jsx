import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useExperience } from "./ExperienceContext";

function QuantumEntrance(){

  const { quantumEnter } = useExperience();

  if(!quantumEnter) return null;

  return(

    <div className="fixed inset-0 bg-[#f8fafc] flex items-center justify-center z-[999]">

      <motion.div
        initial={{ scale:0.2, opacity:0 }}
        animate={{ scale:1.4, opacity:1 }}
        transition={{ duration:0.6 }}
      >
        <Mail size={120} className="text-blue-600"/>
      </motion.div>

      {/* EXPANDING DASHBOARD SURFACE */}
      <motion.div
        className="absolute bg-white rounded-3xl shadow-xl"
        initial={{ width:0, height:0 }}
        animate={{ width:"100vw", height:"100vh" }}
        transition={{ delay:0.6, duration:0.8 }}
      />

    </div>
  );
}

export default QuantumEntrance;