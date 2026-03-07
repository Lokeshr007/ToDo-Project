import React from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, Layers, Shield, Globe, 
  BarChart3, Clock, Award, TrendingUp, Calendar 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <BrainCircuit size={24} />,
      title: "Neural Planning",
      desc: "Break down complex goals into daily actionable tasks",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-600/10"
    },
    {
      icon: <Layers size={24} />,
      title: "Nexus Architecture",
      desc: "Organize projects with workspaces and templates",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-600/10"
    },
    {
      icon: <Shield size={24} />,
      title: "Hardened Auth",
      desc: "Secure access with device-aware authentication",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-600/10"
    },
    {
      icon: <Globe size={24} />,
      title: "Node Collaboration",
      desc: "Real-time collaboration with role-based access",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-600/10"
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Cognitive Insights",
      desc: "Visual progress tracking with predictive analytics",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-600/10"
    },
    {
      icon: <Clock size={24} />,
      title: "Chronos Logic",
      desc: "Smart scheduling with adaptive planning",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-600/10"
    },
    {
      icon: <Award size={24} />,
      title: "Achievement Unlock",
      desc: "Track milestones and celebrate system wins",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-600/10"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Delta Performance",
      desc: "Data-driven recommendations for evolution",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-600/10"
    },
    {
      icon: <Calendar size={24} />,
      title: "Vector Scheduling",
      desc: "Intelligent deadline management protocols",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-600/10"
    }
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
           <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white uppercase tracking-tighter">
            System 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Capabilities</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-bold uppercase text-xs tracking-[0.3em]">
            Precision engineered for maximum throughput
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-slate-900/40 backdrop-blur-3xl rounded-3xl p-8 border border-slate-800/50 hover:border-blue-500/50 transition-all duration-300 shadow-2xl group"
            >
              <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                <div className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className={`text-xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r ${feature.color} uppercase tracking-tighter`}>
                {feature.title}
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
