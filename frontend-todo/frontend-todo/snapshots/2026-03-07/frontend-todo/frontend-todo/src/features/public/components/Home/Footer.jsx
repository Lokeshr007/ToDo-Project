import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: <Github size={18} />, href: '#' },
    { icon: <Twitter size={18} />, href: '#' },
    { icon: <Linkedin size={18} />, href: '#' },
    { icon: <Mail size={18} />, href: '#' }
  ];

  const columns = [
    {
      title: "Core Logic",
      links: ["Capabilities", "Protocols", "Pricing", "Updates"]
    },
    {
      title: "Organization",
      links: ["About Axis", "Neural Blog", "Careers", "Contact"]
    },
    {
      title: "Knowledge",
      links: ["Documentation", "Node Support", "Vector API", "Community"]
    }
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                <Zap size={24} className="text-white fill-white" />
              </div>
              <span className="font-black text-3xl text-white uppercase tracking-tighter">
                Towin
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mb-8">
              The premier structured execution environment. Evolve from passive planning to persistent success through high-fidelity operational protocols.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  whileHover={{ y: -5, scale: 1.1 }}
                  href={social.href}
                  className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-500/20 transition-all"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-8">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                © 2026 Towin Nexus. All packets registered.
              </p>
           </div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
