import { motion } from "framer-motion";
import { useExperience } from "./ExperienceContext";

function CoreLoader(){

  const { loadingCore } = useExperience();

  if(!loadingCore) return null;

  return(

    <div className="fixed inset-0 bg-[#f8fafc] flex items-center justify-center z-[999]">

      <motion.div
        animate={{
          rotate:360
        }}
        transition={{
          repeat:Infinity,
          duration:6,
          ease:"linear"
        }}
        className="relative"
      >

        {/* HEXAGON CORE */}
        <div className="w-24 h-24 bg-blue-600 clip-hexagon shadow-xl"/>

        {/* ENERGY AURA */}
        <motion.div
          className="absolute inset-0 border-4 border-blue-300 rounded-full"
          animate={{ scale:[1,1.6], opacity:[0.6,0] }}
          transition={{ repeat:Infinity, duration:1.5 }}
        />

      </motion.div>

    </div>
  );
}

export default CoreLoader;