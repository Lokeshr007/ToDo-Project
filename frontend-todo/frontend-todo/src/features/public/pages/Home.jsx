import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/app/providers/AuthContext";
import { 
  ArrowRight, 
  Sparkles, 
  BrainCircuit, 
  Workflow,
  Target,
  Shield,
  Globe,
  Layers,
  Rocket,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  Clock,
  Users,
  BarChart3,
  Zap,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Award,
  TrendingUp,
  Calendar,
  Star,
  MessageCircle,
  BookOpen,
  Code,
  Briefcase,
  Heart,
  Compass
} from "lucide-react";
import { useState, useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-800">
      <AnimatedBackground />
      <Header onSignIn={handleSignIn} onGetStarted={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
      <HowItWorks />
      <Features />
      <ForWho />
      <AISection />
      <Testimonials />
      <CTA onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
}

export default Home;

/* ================= ANIMATED BACKGROUND ================= */

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Colorful animated blobs matching login page */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-20 right-20 w-[700px] h-[700px] bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-full mix-blend-multiply filter blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-300/20 to-orange-300/20 rounded-full mix-blend-multiply filter blur-3xl"
      />

      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, -30, 30, -30],
            x: [null, 30, -30, 30],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
        />
      ))}

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(37, 99, 235, 0.1)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}

/* ================= HEADER ================= */

function Header({ onSignIn, onGetStarted }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Towin
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {['How it Works', 'Features', 'For Who', 'Testimonials'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignIn}
            className="text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-white/80 transition-all text-sm flex items-center gap-2 border border-slate-200"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Get Started
          </motion.button>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-slate-700 p-2"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-t border-slate-100 p-6"
        >
          <nav className="flex flex-col gap-4">
            {['How it Works', 'Features', 'For Who', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-slate-600 hover:text-blue-600 transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => {
                  onSignIn();
                  setIsMenuOpen(false);
                }}
                className="bg-white text-slate-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 border border-slate-200"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => {
                  onGetStarted();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Get Started
              </button>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}

/* ================= HERO ================= */

function Hero({ onGetStarted, onSignIn }) {
  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-32 lg:pt-32 lg:pb-40">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg px-4 py-2 mb-8 border border-blue-200"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">From To-Do to To-Win</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            <span className="text-slate-800">
              Turn Goals Into
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Structured Execution
            </span>
          </h1>

          <p className="mt-8 text-lg text-slate-600 max-w-xl">
            Not just another todo app. Towin combines task management, learning workflows, and collaborative planning into one unified system. For students, professionals, and teams.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium flex items-center gap-2 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignIn}
              className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-lg font-medium hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </motion.button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200"
            >
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">10k+</div>
              <div className="text-sm text-slate-500">Active Users</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200"
            >
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">94%</div>
              <div className="text-sm text-slate-500">Goal Completion</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200"
            >
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">24/7</div>
              <div className="text-sm text-slate-500">AI Assistance</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Content - Product Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-2xl">
            {/* Dashboard Mockup */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                </div>
                <div className="text-sm text-slate-500 font-medium">Project: DSA in 14 Days</div>
              </div>

              {/* Progress Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
                >
                  <div className="text-sm text-slate-600 mb-2">Progress</div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">64%</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100"
                >
                  <div className="text-sm text-slate-600 mb-2">Tasks</div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">18/28</div>
                </motion.div>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Arrays & Strings - Completed</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  <span className="text-slate-600">Linked Lists - In Progress</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  <span className="text-slate-400">Trees & Graphs - Up Next</span>
                </motion.div>
              </div>
            </div>

            {/* Floating Element */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS ================= */

function HowItWorks() {
  const steps = [
    { 
      name: "Input Goal", 
      icon: <Target className="w-6 h-6" />, 
      desc: "Define your objective - learn DSA, launch project, build habit",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    { 
      name: "AI Analysis", 
      icon: <BrainCircuit className="w-6 h-6" />, 
      desc: "System breaks down goal into structured daily tasks",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    { 
      name: "Structure", 
      icon: <Workflow className="w-6 h-6" />, 
      desc: "Create workflow with timelines and dependencies",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    },
    { 
      name: "Execute", 
      icon: <Rocket className="w-6 h-6" />, 
      desc: "Track progress, adapt, and achieve",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-slate-800">How </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Towin Works</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From goal to execution in four structured steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-100"
            >
              <div className={`w-14 h-14 ${step.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <div className={`text-transparent bg-clip-text bg-gradient-to-r ${step.color}`}>
                  {step.icon}
                </div>
              </div>
              <h3 className={`text-lg font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${step.color}`}>
                {step.name}
              </h3>
              <p className="text-slate-600 text-sm">{step.desc}</p>
              
              {index < steps.length - 1 && (
                <ChevronRight className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 hidden md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURES ================= */

function Features() {
  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "AI-Powered Planning",
      desc: "Break down complex goals into daily actionable tasks",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Workspace Architecture",
      desc: "Organize projects with workspaces and templates",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Device Session Security",
      desc: "Secure access with device-aware authentication",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Team Collaboration",
      desc: "Real-time collaboration with role-based access",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Progress Analytics",
      desc: "Visual progress tracking with predictive insights",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Structured Timelines",
      desc: "Smart scheduling with adaptive planning",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Goal Achievement",
      desc: "Track milestones and celebrate wins",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance Insights",
      desc: "Data-driven recommendations for improvement",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Scheduling",
      desc: "Intelligent deadline management",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50"
    }
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-slate-800">Built for </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Execution</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need to turn goals into structured progress
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
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-100"
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <div className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className={`text-lg font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`}>
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FOR WHO ================= */

function ForWho() {
  const audiences = [
    {
      title: "Students",
      icon: <BookOpen className="w-8 h-8" />,
      desc: "Break down syllabus, track daily study progress, prepare for exams with structured timelines",
      examples: ["Finish DSA in 30 days", "Government exam prep", "Daily study planner"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Professionals",
      icon: <Briefcase className="w-8 h-8" />,
      desc: "Project execution, team workflows, sprint planning with role-based collaboration",
      examples: ["Product launch", "Team sprints", "Client projects"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Individuals",
      icon: <Heart className="w-8 h-8" />,
      desc: "Habit building, personal goals, daily planning with intelligent tracking",
      examples: ["Learn a language", "Fitness goals", "Reading habits"],
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    {
      title: "Mentors & Teachers",
      icon: <Users className="w-8 h-8" />,
      desc: "Guide students remotely, set tasks, track progress, provide structured learning paths",
      examples: ["Student mentorship", "Remote teaching", "Course planning"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <section id="for-who" className="py-24 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-slate-800">Who It's </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">For</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From students to enterprises - one platform for structured execution
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border ${audience.borderColor}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 ${audience.bgColor} rounded-xl flex items-center justify-center`}>
                  <div className={`text-transparent bg-clip-text bg-gradient-to-r ${audience.color}`}>
                    {audience.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${audience.color}`}>
                    {audience.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{audience.desc}</p>
                  <div className="space-y-2">
                    {audience.examples.map((example, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-sm text-slate-500"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${audience.color}`} />
                        <span>{example}</span>
                      </motion.div>
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
}

/* ================= AI SECTION ================= */

function AISection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-32 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center relative overflow-hidden"
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-8 border border-white/30"
        >
          <BrainCircuit className="w-4 h-4 text-white" />
          <span className="text-sm text-white font-medium">Intelligent Assistance</span>
        </motion.div>

        <h2 className="text-5xl lg:text-6xl font-bold mb-6">
          AI That Understands
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
            Your Goals
          </span>
        </h2>

        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          Not AI for hype. Real assistance that breaks down goals, suggests timelines, detects slow progress, and adapts to your pace.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            { value: "Break Goals", label: "Into daily tasks", icon: <Target className="w-8 h-8" /> },
            { value: "Smart Schedule", label: "Adaptive timelines", icon: <Calendar className="w-8 h-8" /> },
            { value: "Progress Alerts", label: "Stay on track", icon: <Bell className="w-8 h-8" /> }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="text-white/80 mb-3">{stat.icon}</div>
              <div className="text-lg font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ================= TESTIMONIALS ================= */

function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "Towin helped me structure my DSA preparation. I went from random practice to a structured 90-day plan. Landed my dream internship!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108777-383ef71f8b3f?w=150",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      content: "Our team's productivity increased by 40% after switching to Towin. The AI-powered task breakdown is a game-changer.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Emily Rodriguez",
      role: "Freelance Designer",
      content: "Finally a tool that understands how creatives work. The workspace templates saved me hours of planning.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-slate-800">Loved by </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Goal Achievers</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            See what our users have to say about their Towin experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-transparent bg-gradient-to-r p-0.5"
                  style={{
                    background: `linear-gradient(to right, ${testimonial.color.split(' ')[1]}, ${testimonial.color.split(' ')[3]})`
                  }}
                />
                <div>
                  <h3 className="font-bold text-slate-800">{testimonial.name}</h3>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-600 mb-4">"{testimonial.content}"</p>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= CTA ================= */

function CTA({ onGetStarted }) {
  return (
    <section className="py-32 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent" />
      
      <div className="relative max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white"
        >
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-slate-800">Ready to Transform</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              How You Execute?
            </span>
          </h2>

          <p className="text-xl text-slate-600 mb-12">
            Join students, professionals, and teams who've moved from to-do to to-win.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-xl font-medium text-lg flex items-center gap-3 mx-auto hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="mt-8 text-sm text-slate-400">
            Free platform • No credit card required • Start organizing today
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Towin
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              From to-do to to-win. A structured execution platform for goals that matter.
            </p>
            <div className="flex gap-4 mt-4">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <motion.a
                  key={i}
                  whileHover={{ y: -3 }}
                  href="#"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Product",
              links: ["Features", "How it Works", "Pricing", "Updates"]
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"]
            },
            {
              title: "Resources",
              links: ["Documentation", "Support", "API", "Community"]
            }
          ].map((column) => (
            <div key={column.title}>
              <h4 className="text-slate-800 font-bold mb-4 text-sm">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 Towin. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Add missing Bell icon
function Bell(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
