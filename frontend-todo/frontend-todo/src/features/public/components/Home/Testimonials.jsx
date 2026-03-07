import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CS Architect",
      content: "Towin transformed my DSA preparation from chaotic to algorithmic. The 90-day plan execution was flawless. Interned at Google.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108777-383ef71f8b3f?w=150",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Michael Chen",
      role: "Lead Product Node",
      content: "Team throughput accelerated by 40%. The neural task decomposition logic is a legitimate competitive advantage.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Emily Rodriguez",
      role: "Visual Engineer",
      content: "Finally, a workspace that respects creative entropy while providing structural integrity. Saves me hours of manual orchestration.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="testimonials" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
           <h2 className="text-4xl lg:text-6xl font-black mb-6 text-white uppercase tracking-tighter">
            Neural 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Feedback</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-bold uppercase text-xs tracking-[0.3em]">
            Verified operational successes from the global network
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-10 shadow-2xl border border-slate-700/50 group"
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                   <img
                     src={testimonial.image}
                     alt={testimonial.name}
                     className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800 shadow-xl"
                   />
                   <div className={`absolute -bottom-2 -right-2 w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 shadow-xl`}>
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                   </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{testimonial.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed italic mb-8 opacity-80">"{testimonial.content}"</p>
              <div className="flex gap-1.5 border-t border-slate-800/50 pt-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-blue-500/20 text-blue-500" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
