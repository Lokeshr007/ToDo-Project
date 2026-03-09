import React, { useState, useEffect } from "react";
import { 
  Globe, Calendar, Key, HardDrive, Download, Database, Palette, Layout, Moon, 
  Layers, Activity, Code, Bell ring as BellRing, Mail, Monitor, Smartphone, 
  Volume2, Lock, User, UserX, Shield, Laptop, HelpCircle, SlidersHorizontal, 
  Grid, ListTodo, FolderKanban, Search, Save, Headphones, Contrast, Type, 
  Keyboard, Wind, Globe2, MessageSquare, Github, Zap, Cpu, TrendingUp, 
  FlaskConical, CreditCard, Package, History, BarChart3, Users, Gift, 
  Rocket, Sparkles, MessageCircle, Info, ChevronRight, Settings as SettingsIcon
} from "lucide-react";
import { taskToast } from '@/shared/components/QuantumToaster';
import { useTheme } from "@/app/providers/ThemeContext";

import SettingsHeader from "./SettingsHeader";
import SettingsSidebar from "./SettingsSidebar";
import { ComingSoonSection } from "./ComingSoonSection";
import SettingsTimeline from "./SettingsTimeline";
import SettingsInfoCards from "./SettingsInfoCards";

const Settings = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab ] = useState('general');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [settings, setSettings] = useState({
    general: { language: 'en', compactMode: false, animations: true },
    appearance: { theme: theme || 'dark', primaryColor: 'purple' }
    // ... other settings can be added here
  });

  const [savedSettings, setSavedSettings] = useState({ ...settings });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, description: 'Basic application settings' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Workspace customization' },
    { id: 'notifications', label: 'Alerts', icon: BellRing, description: 'Notification management' },
    { id: 'privacy', label: 'Privacy', icon: Lock, description: 'Data sharing control' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Access control' },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal, description: 'Fine-tuned experience' },
    { id: 'accessibility', label: 'Experience', icon: Headphones, description: 'Inclusion settings' },
    { id: 'integrations', label: 'Network', icon: Globe2, description: 'External service sync' },
    { id: 'advanced', label: 'Developer', icon: Cpu, description: 'Power user tools' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Subscription assets' }
  ];

  const featureMaps = {
    general: {
      description: 'Configure your core operating parameters and localization matrices.',
      features: [
        { name: 'Localization & Dialect', description: 'Set primary interface language and regional protocols', icon: Globe, color: 'bg-blue-500/10' },
        { name: 'Temporal Sync', description: 'Synchronize date/time display with atomic precision', icon: Calendar, color: 'bg-emerald-500/10' },
        { name: 'Macro Commands', description: 'Initialize and rebind global keyboard accelerators', icon: Key, color: 'bg-amber-500/10' },
        { name: 'Array Management', description: 'Configure persistent storage and asset injection paths', icon: HardDrive, color: 'bg-indigo-500/10' },
        { name: 'Data Ingress/Egress', description: 'Execute comprehensive project telemetry export', icon: Download, color: 'bg-purple-500/10' },
        { name: 'State Persistence', description: 'Manage automated backup cycles and restore points', icon: Database, color: 'bg-pink-500/10' }
      ]
    },
    appearance: {
      description: 'Refine the visual vectors and aesthetic atmosphere of your environment.',
      features: [
        { name: 'Atmospheric Themes', description: 'Calibrate environmental luminance and chromatic profiles', icon: Moon, color: 'bg-purple-500/10' },
        { name: 'Spectrum Profiles', description: 'Deploy custom color gamuts across the interface', icon: Palette, color: 'bg-pink-500/10' },
        { name: 'Structural Grid', description: 'Reconfigure workspace spatial distribution and density', icon: Layout, color: 'bg-blue-500/10' },
        { name: 'Interface Typology', description: 'Regulate font-face matrices and text rendering', icon: Layers, color: 'bg-indigo-500/10' },
        { name: 'Dynamics & Motion', description: 'Modulate transition velocity and kinetic feedback', icon: Activity, color: 'bg-emerald-500/10' },
        { name: 'Source Overrides', description: 'Inject custom CSS syntax directly into the core', icon: Code, color: 'bg-amber-500/10' }
      ]
    },
    notifications: {
      description: 'Orchestrate the telemetry alerts and communication signal pathways.',
      features: [
        { name: 'Signal Pushes', description: 'Broadcast critical event alerts to active nodes', icon: BellRing, color: 'bg-purple-500/10' },
        { name: 'Comm-Logs', description: 'Direct operational briefs to designated email nodes', icon: Mail, color: 'bg-blue-500/10' },
        { name: 'Desktop Overlays', description: 'Initialize head-up display notification matrices', icon: Monitor, color: 'bg-emerald-500/10' },
        { name: 'Mobile Handhelds', description: 'Sync alerts with remote mobile hardware units', icon: Smartphone, color: 'bg-amber-500/10' },
        { name: 'Blackout Protocol', description: 'Establish temporal windows for signal suppression', icon: Moon, color: 'bg-indigo-500/10' },
        { name: 'Acoustic Output', description: 'Select auditory alert signatures for event triggers', icon: Volume2, color: 'bg-pink-500/10' }
      ]
    },
    privacy: {
       description: 'Calibrate the visibility matrices and data exposure parameters.',
       features: [
         { name: 'Profile Visibility', description: 'Regulate node visibility across the global nexus', icon: User, color: 'bg-purple-500/10' },
         { name: 'Data Sovereignty', description: 'Control telemetric data sharing and telemetry', icon: Globe, color: 'bg-blue-500/10' },
         { name: 'Activity Traces', description: 'Manage operational session logging and tracking', icon: Activity, color: 'bg-emerald-500/10' },
         { name: 'Cookie Matrices', description: 'Regulate persistent browser-side data caches', icon: Database, color: 'bg-amber-500/10' },
         { name: 'Node Quarantine', description: 'Manage restricted entity and node access lists', icon: UserX, color: 'bg-red-500/10' },
         { name: 'Identity Salvage', description: 'Extract or purge all personal record snapshots', icon: Download, color: 'bg-indigo-500/10' }
       ]
    },
    security: {
      description: 'Fortify access protocols and harden node authentication layers.',
      features: [
        { name: 'Dual-Factor Logic', description: 'Initialize secondary authentication challenge-responses', icon: Lock, color: 'bg-purple-500/10' },
        { name: 'Session Scopes', description: 'Review and terminate active unauthorized node sessions', icon: Smartphone, color: 'bg-blue-500/10' },
        { name: 'Event Forensics', description: 'Trace historical access logs for anomaly detection', icon: History, color: 'bg-emerald-500/10' },
        { name: 'Access Tokens', description: 'Generate high-entropy API authentication vectors', icon: Key, color: 'bg-amber-500/10' },
        { name: 'Challenge-Questions', description: 'Establish legacy account recovery proof-of-identity', icon: HelpCircle, color: 'bg-indigo-500/10' },
        { name: 'Hardware Registry', description: 'Authorize specific MAC addresses for system entry', icon: Laptop, color: 'bg-pink-500/10' }
      ]
    },
    preferences: {
      description: 'Optimize default operational behaviors for maximum throughput.',
      features: [
        { name: 'Initial Perspectives', description: 'Set standard viewport for new project initialization', icon: Grid, color: 'bg-purple-500/10' },
        { name: 'Directive Defaults', description: 'Standardize task priority and status for new entries', icon: ListTodo, color: 'bg-blue-500/10' },
        { name: 'Registry Schemes', description: 'Define primary column architecture for work-boards', icon: FolderKanban, color: 'bg-emerald-500/10' },
        { name: 'Chronos-Sync', description: 'Calibrate calendar interpolation and week offsets', icon: Calendar, color: 'bg-yellow-500/10' },
        { name: 'Neural Search', description: 'Fine-tune search indexing and fuzzy-match depth', icon: Search, color: 'bg-indigo-500/10' },
        { name: 'Persistence Logic', description: 'Configure data auto-save and delta frequency', icon: Save, color: 'bg-pink-500/10' }
      ]
    },
    accessibility: {
      description: 'Ensure system interoperability with diverse human interface nodes.',
      features: [
        { name: 'Audio-Transcripts', description: 'Optimize telemetry for screen-reading hardware', icon: Headphones, color: 'bg-purple-500/10' },
        { name: 'Contrast Vectors', description: 'Deploy high-visibility interface chroma profiles', icon: Contrast, color: 'bg-blue-500/10' },
        { name: 'Scale Matrices', description: 'Globally adjust font-scale and interface density', icon: Type, color: 'bg-emerald-500/10' },
        { name: 'Chroma-Correction', description: 'Apply color-gamut correction for visual variances', icon: Palette, color: 'bg-yellow-500/10' },
        { name: 'Logical Navigation', description: 'Enhance focus-pathing for keyboard-only operation', icon: Keyboard, color: 'bg-indigo-500/10' },
        { name: 'Motion Dampening', description: 'Suppress high-frequency transition and animation', icon: Wind, color: 'bg-pink-500/10' }
      ]
    },
    integrations: {
      description: 'Synchronize operation data with external neural networks and services.',
      features: [
        { name: 'Nexus G-Suite', description: 'Map drive, calendar, and mail to workspace nodes', icon: Globe2, color: 'bg-blue-500/10' },
        { name: 'MS-365 Bridge', description: 'Establish data tunnels to Outlook and Team hubs', icon: Globe, color: 'bg-emerald-500/10' },
        { name: 'Slack Realtime', description: 'Stream system activity directly into comms channels', icon: MessageSquare, color: 'bg-purple-500/10' },
        { name: 'Git-Nexus', description: 'Establish version control linkage for repository sync', icon: Github, color: 'bg-gray-500/10' },
        { name: 'Jira-Sync', description: 'Map project status between heterogenous systems', icon: Activity, color: 'bg-blue-500/10' },
        { name: 'Zapier Logic', description: 'Orchestrate workflows across 3000+ remote nodes', icon: Zap, color: 'bg-yellow-500/10' }
      ]
    },
    advanced: {
      description: 'Extreme-level system tuning for high-performance data architects.',
      features: [
        { name: 'Dev-Shell Access', description: 'Initialize command-line tools and debug inspectors', icon: Code, color: 'bg-purple-500/10' },
        { name: 'Vector APIs', description: 'Generate and calibrate raw data access protocols', icon: Key, color: 'bg-blue-500/10' },
        { name: 'Web-Node Hooks', description: 'Configure event-driven HTTP data stream callbacks', icon: Globe, color: 'bg-emerald-500/10' },
        { name: 'Error Forensics', description: 'Enable deep-trace logging and anomaly capturing', icon: Cpu, color: 'bg-yellow-500/10' },
        { name: 'Throughput Tuning', description: 'Optimize system resource allocation and caching', icon: TrendingUp, color: 'bg-indigo-500/10' },
        { name: 'Lab Protocols', description: 'Enable alpha-phase experimental feature injection', icon: FlaskConical, color: 'bg-pink-500/10' }
      ]
    },
    billing: {
      description: 'Manage the economic assets and license provisions of your workspace.',
      features: [
        { name: 'Asset Tiering', description: 'Select and reconfigure subscription service levels', icon: Package, color: 'bg-purple-500/10' },
        { name: 'Credit Matrices', description: 'Log and update financial transaction hardware', icon: CreditCard, color: 'bg-blue-500/10' },
        { name: 'Ledger Records', description: 'View detailed historical invoice and receipt data', icon: History, color: 'bg-green-500/10' },
        { name: 'Resource Quotas', description: 'Monitor operational usage limits and data ceilings', icon: BarChart3, color: 'bg-yellow-500/10' },
        { name: 'Unit Aggregation', description: 'Centralize billing for multi-node team structures', icon: Users, color: 'bg-indigo-500/10' },
        { name: 'Voucher Injection', description: 'Apply promotional credits and internal assets', icon: Gift, color: 'bg-pink-500/10' }
      ]
    }
  };

  const handleFeatureClick = (feature) => {
    tasktaskToast.info(`${feature} Logic Imminent`, { 
      description: "Neural pathways for this feature are currently initializing. Deployment expected in upcoming cycles."
    });
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSavedSettings({ ...settings });
      tasktaskToast.success('Configuration Commited');
    } catch (error) {
       tasktaskToast.error('Transaction Aborted');
    } finally {
      setLoading(false);
    }
  };

  const timelineItems = [
    { phase: 'PHASE 01', features: ['Core Engine', 'State Logic'], status: 'completed' },
    { phase: 'PHASE 02', features: ['UI/UX Vectors', 'Neural Comms'], status: 'in-progress' },
    { phase: 'PHASE 03', features: ['Hardened Security', 'Nexus Control'], status: 'planned' },
    { phase: 'PHASE 04', features: ['Global Sync', 'Neural Bridges'], status: 'planned' },
  ];

  const currentFeature = featureMaps[activeTab] || featureMaps.general;
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-blue-500/30 selection:text-white pb-20">
      <SettingsHeader 
         previewMode={previewMode}
         togglePreviewMode={() => setPreviewMode(!previewMode)}
         hasChanges={hasChanges}
         saveSettings={saveSettings}
         resetSettings={() => { setSettings({ ...savedSettings }); tasktaskToast.info('State Reverted'); }}
         loading={loading}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <SettingsSidebar 
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="flex-1 min-w-0">
             {/* Construction Banner */}
             <div className="mb-10 p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl border border-blue-500/20 shadow-xl backdrop-blur-md flex items-center gap-6">
                <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/30">
                  <Sparkles size={24} className="text-blue-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Architectural Refinement</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter leading-relaxed">
                    Systems are currently undergoing deep-level architectural refinement. All nodes below represent planned operational capabilities.
                  </p>
                </div>
                <button
                   onClick={() => window.open('https://feedback.taskflow.com', '_blank')}
                   className="hidden sm:block px-6 py-3 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all border border-slate-700/50 shadow-lg"
                >
                  Request Protocol
                </button>
             </div>

             <ComingSoonSection 
               title={tabs.find(t => t.id === activeTab)?.label || 'General'}
               description={currentFeature.description}
               icon={tabs.find(t => t.id === activeTab)?.icon || SettingsIcon}
               features={currentFeature.features}
               previewMode={previewMode}
               onFeatureClick={handleFeatureClick}
             />

             <SettingsInfoCards previewMode={previewMode} />

             <SettingsTimeline timelineItems={timelineItems} />

             {/* Tactical Feedback */}
             <div className="mt-8 p-10 bg-gradient-to-br from-blue-600/10 to-transparent rounded-[2.5rem] border border-blue-500/20 flex flex-col items-center text-center shadow-2xl">
                <div className="p-5 bg-blue-600/20 rounded-3xl border border-blue-500/30 mb-6">
                  <MessageCircle size={32} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Evolve the Ecosystem</h3>
                <p className="text-sm font-medium text-slate-400 max-w-lg leading-relaxed mb-8 opacity-70 italic">
                  "Your telemetric feedback is the primary catalyst for system evolution. Help us prioritize the next phase of deployment."
                </p>
                <div className="flex flex-wrap justify-center gap-4 w-full max-w-md">
                   <button className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/40">
                     Submit Feedback
                   </button>
                   <button className="flex-1 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-slate-700/50">
                     View Roadmap
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
