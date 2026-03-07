import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, Heart, Users } from 'lucide-react';

const ForWho = () => {
  const audiences = [
    {
      title: "Students",
      icon: <BookOpen size={32} />,
      desc: "Deconstruct syllabus, track daily cognitive progress, and execute exam prep with temporal precision.",
      examples: ["Finish DSA in 30 days", "Competitive Exam Protocol", "Study Path Serialization"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-600/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Engineers",
      icon: <Briefcase size={32} />,
      desc: "Project architecture, sprint planning, and team orchestration with high-fidelity telemetry.",
      examples: ["System Deployment", "Agile Sprints", "Client Node Management"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-600/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Visionaries",
      icon: <Heart size={32} />,
      desc: "Initialize neural habits, scale personal ambition, and map life goals onto executable grids.",
      examples: ["Polyglot Protocol", "Fitness Optimization", "Deep Work Rituals"],
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-600/10",
      borderColor: "border-pink-500/20"
    },
    {
      title: "Mentors",
      icon: <Users size={32} />,
      desc: "Calibrate student trajectories, deploy structured paths, and monitor growth across the network.",
      examples: ["Neural Mentorship", "Curriculum Ops", "Cohort Performance Tracking"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-600/10",
      borderColor: "border-orange-500/20"
    }
  ];

  return (
    <section id="for-who" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white uppercase tracking-tighter">
            Target 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Sectors</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-bold uppercase text-xs tracking-[0.3em]">
            Multi-tenant support for every cognitive workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-2xl hover:shadow-blue-900/10 transition-all border ${audience.borderColor} group`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
                <div className={`w-20 h-20 ${audience.bgColor} rounded-3xl flex items-center justify-center border border-white/5 shadow-inner`}>
                  <div className={`text-transparent bg-clip-text bg-gradient-to-br ${audience.color}`}>
                    {audience.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r ${audience.color} uppercase tracking-tighter`}>
                    {audience.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 italic opacity-80">{audience.desc}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {audience.examples.map((example, i) => (
                      <span
                        key={i}
                        className={`px-4 py-2 bg-slate-800/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-700/50 group-hover:border-blue-500/20 transition-all`}
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWho;
