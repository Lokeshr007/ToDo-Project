import React from 'react';
import { motion } from 'framer-motion';
import { Target, BrainCircuit, Workflow, Rocket, ChevronRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { 
      name: "Input Goal", 
      icon: <Target size={28} />, 
      desc: "Define your objective - learn DSA, launch project, build habit",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-600/10"
    },
    { 
      name: "AI Synthesis", 
      icon: <BrainCircuit size={28} />, 
      desc: "System breaks down goal into structured daily tasks",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-600/10"
    },
    { 
      name: "Architect", 
      icon: <Workflow size={28} />, 
      desc: "Create workflow with timelines and dependencies",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-600/10"
    },
    { 
      name: "Execute", 
      icon: <Rocket size={28} />, 
      desc: "Track progress, adapt, and achieve",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-600/10"
    }
  ];

  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white uppercase tracking-tighter">
            Operational 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Protocols</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-bold uppercase text-xs tracking-[0.3em]">
            From raw ambition to atomic execution
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] p-8 border border-slate-800/50 shadow-2xl group flex flex-col items-center text-center"
            >
              <div className={`w-20 h-20 ${step.bgColor} rounded-3xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform`}>
                <div className={`text-transparent bg-clip-text bg-gradient-to-br ${step.color}`}>
                  {step.icon}
                </div>
              </div>
              <h3 className={`text-xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r ${step.color} uppercase tracking-tighter`}>
                {step.name}
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">{step.desc}</p>
              
              {index < steps.length - 1 && (
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 hidden lg:block">
                   <ChevronRight size={24} className="text-slate-800" />
                </div>
              )}

              {/* Step Number Badge */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
                0{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
