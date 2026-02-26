// frontend/src/features/profile/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/app/providers/ThemeContext";
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Smartphone,
  Laptop,
  Tablet,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Loader,
  Check,
  X,
  AlertCircle,
  Info,
  Rocket,
  Sparkles,
  Zap,
  Database,
  Users,
  Lock,
  Key,
  Fingerprint,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Save,
  ToggleLeft,
  ToggleRight,
  Volume2,
  VolumeX,
  BellRing,
  BellOff,
  MailCheck,
  MailX,
  MessageSquare,
  BarChart3,
  Layers,
  Activity,
  Archive,
  Star,
  Gift,
  Award,
  TrendingUp,
  Clock3,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  ListTodo,
  FolderKanban,
  Layout,
  Grid,
  Columns,
  Table,
  GanttChart,
  PieChart,
  LineChart,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Youtube,
  Twitter,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Send,
  Headphones,
  Ticket,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail as MailIcon,
  User,
  Briefcase,
  Building2,
  Globe2,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Cpu,
  HardDrive,
  Network,
  Server,
  Cloud,
  CloudOff,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  SunDim,
  Sunrise,
  Sunset,
  Moon as MoonIcon,
  Stars,
  Eclipse,
  ZapOff,
  ZapOff as ZapDisabled,
  Power,
  PowerOff,
  PowerOff as PowerDisabled,
  Settings as SettingsIcon2,
  Sliders,
  SlidersHorizontal,
  ToggleLeft as ToggleLeftIcon,
  ToggleRight as ToggleRightIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info as InfoIcon,
  Code
} from "lucide-react";
import toast from 'react-hot-toast';

function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      weekStartsOn: 'monday',
      theme: 'system',
      compactMode: false,
      animations: true,
      soundEnabled: true,
      hapticFeedback: true,
      autoSave: true,
      autoSaveInterval: 5,
      undoEnabled: true,
      redoEnabled: true,
      keyboardShortcuts: true,
      mouseGestures: false,
      touchGestures: true
    },
    appearance: {
      theme: theme || 'dark',
      primaryColor: 'purple',
      accentColor: 'indigo',
      backgroundEffect: 'gradient',
      blurEffects: true,
      glassmorphism: true,
      cardStyle: 'rounded',
      fontSize: 'medium',
      fontFamily: 'inter',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      contrast: 'normal',
      brightness: 100,
      saturation: 100,
      hue: 0,
      sepia: 0,
      grayscale: 0,
      invertColors: false,
      highContrast: false,
      reducedMotion: false,
      animationsReduced: false,
      blurStrength: 'medium',
      shadowStrength: 'medium',
      borderWidth: 'normal',
      borderRadius: 'medium',
      paddingSize: 'medium',
      gapSize: 'medium',
      iconStyle: 'outline',
      iconSize: 'medium',
      showLabels: true,
      showTooltips: true,
      showBadges: true,
      showAvatars: true,
      showEmojis: true,
      showIcons: true
    },
    notifications: {
      email: true,
      push: true,
      desktop: true,
      mobile: true,
      inApp: true,
      sound: true,
      vibration: true,
      badge: true,
      priority: 'all',
      taskReminders: true,
      projectUpdates: true,
      mentions: true,
      comments: true,
      assignments: true,
      dueDates: true,
      overdue: true,
      completed: true,
      workspaceInvites: true,
      teamUpdates: true,
      announcements: true,
      tips: false,
      promotions: false,
      newsletter: false,
      digest: 'daily',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      emailDigest: 'daily',
      pushDigest: 'realtime',
      desktopDigest: 'realtime',
      mobileDigest: 'realtime'
    },
    privacy: {
      profileVisibility: 'public',
      emailVisibility: 'private',
      activityVisibility: 'followers',
      taskVisibility: 'workspace',
      projectVisibility: 'workspace',
      showOnlineStatus: true,
      showLastSeen: true,
      showTypingIndicator: true,
      showReadReceipts: true,
      allowTagging: true,
      allowMentions: true,
      allowMessages: 'everyone',
      allowFriendRequests: 'everyone',
      allowInvites: 'workspace',
      shareData: false,
      analytics: true,
      cookies: true,
      personalizedAds: false,
      thirdPartyData: false,
      searchEngineIndexing: false
    },
    security: {
      twoFactorAuth: false,
      twoFactorMethod: 'app',
      backupCodes: [],
      trustedDevices: [],
      sessionTimeout: 30,
      loginAlerts: true,
      newDeviceAlerts: true,
      passwordChangeAlerts: true,
      emailChangeAlerts: true,
      suspiciousActivityAlerts: true,
      ipWhitelist: [],
      ipBlacklist: [],
      countryRestrictions: [],
      deviceRestrictions: [],
      timeRestrictions: [],
      passwordExpiry: 90,
      passwordHistory: 5,
      passwordComplexity: 'medium',
      loginAttempts: 5,
      lockoutDuration: 30,
      captchaEnabled: true,
      recaptchaEnabled: false,
      biometricEnabled: false,
      faceIdEnabled: false,
      fingerprintEnabled: false,
      pinEnabled: false,
      pinCode: '',
      securityQuestions: [],
      backupEmail: '',
      backupPhone: '',
      recoveryCode: ''
    },
    preferences: {
      defaultView: 'board',
      defaultProjectView: 'board',
      defaultTaskView: 'list',
      defaultCalendarView: 'month',
      defaultDashboardView: 'overview',
      defaultTheme: 'dark',
      defaultLanguage: 'en',
      defaultTimezone: 'auto',
      defaultPriority: 'medium',
      defaultStatus: 'pending',
      defaultAssignee: 'self',
      defaultDueDate: 'none',
      defaultReminder: '1h',
      defaultRepeat: 'never',
      defaultTags: [],
      defaultLabels: [],
      defaultCategories: [],
      defaultProjects: [],
      defaultWorkspace: 'last',
      autoArchiveDays: 30,
      autoDeleteDays: 90,
      autoBackup: true,
      autoBackupFrequency: 'weekly',
      autoBackupTime: '00:00',
      backupLocation: 'cloud',
      exportFormat: 'json',
      importFormat: 'json',
      syncEnabled: true,
      syncFrequency: 'realtime',
      offlineMode: false,
      offlineData: true,
      offlineDataSize: 100,
      cacheEnabled: true,
      cacheSize: 500,
      cacheDuration: 7,
      dataSaver: false,
      lowBandwidthMode: false,
      highQualityImages: true,
      lazyLoading: true,
      infiniteScroll: true,
      paginationSize: 20,
      searchDebounce: 300,
      autocomplete: true,
      spellcheck: true,
      grammarCheck: false,
      autoCorrect: true,
      predictiveText: true,
      emojiSuggestions: true,
      mentionSuggestions: true,
      hashtagSuggestions: true,
      linkPreviews: true,
      imagePreviews: true,
      videoPreviews: false,
      filePreviews: true,
      thumbnailPreviews: true
    },
    accessibility: {
      screenReader: false,
      voiceOver: false,
      talkBack: false,
      brailleDisplay: false,
      textToSpeech: false,
      speechToText: false,
      closedCaptions: false,
      subtitles: false,
      transcripts: false,
      signLanguage: false,
      largeText: false,
      extraLargeText: false,
      boldText: false,
      highContrast: false,
      invertedColors: false,
      grayscale: false,
      reduceTransparency: false,
      reduceMotion: false,
      reduceAnimations: false,
      increaseContrast: false,
      decreaseContrast: false,
      increaseBrightness: false,
      decreaseBrightness: false,
      increaseSaturation: false,
      decreaseSaturation: false,
      increaseHue: false,
      decreaseHue: false,
      increaseSepia: false,
      decreaseSepia: false,
      dyslexiaFriendly: false,
      adhdFriendly: false,
      autismFriendly: false,
      colorblindMode: 'none',
      colorblindType: 'protanopia',
      keyboardNavigation: true,
      keyboardShortcuts: true,
      mouseNavigation: true,
      touchNavigation: true,
      gestureNavigation: true,
      voiceNavigation: false,
      eyeTracking: false,
      headTracking: false,
      switchControl: false,
      assistiveTouch: false,
      guidedAccess: false,
      singleAppMode: false,
      reduceMotionOnScroll: false,
      reduceMotionOnHover: false,
      reduceMotionOnClick: false,
      reduceMotionOnFocus: false,
      reduceMotionOnBlur: false
    },
    integrations: {
      google: false,
      googleCalendar: false,
      googleDrive: false,
      googleDocs: false,
      googleSheets: false,
      googleSlides: false,
      googleMeet: false,
      googleChat: false,
      googleTasks: false,
      googleKeep: false,
      googlePhotos: false,
      googleMaps: false,
      googleTranslate: false,
      microsoft: false,
      outlook: false,
      office365: false,
      teams: false,
      onedrive: false,
      sharepoint: false,
      onenote: false,
      toDo: false,
      planner: false,
      project: false,
      excel: false,
      word: false,
      powerpoint: false,
      slack: false,
      discord: false,
      zoom: false,
      meet: false,
      webex: false,
      goto: false,
      notion: false,
      trello: false,
      asana: false,
      monday: false,
      jira: false,
      confluence: false,
      bitbucket: false,
      github: false,
      gitlab: false,
      azureDevOps: false,
      aws: false,
      gcp: false,
      azure: false,
      digitalOcean: false,
      heroku: false,
      netlify: false,
      vercel: false,
      cloudflare: false,
      stripe: false,
      paypal: false,
      square: false,
      shopify: false,
      woocommerce: false,
      magento: false,
      salesforce: false,
      hubspot: false,
      mailchimp: false,
      sendgrid: false,
      twilio: false,
      pusher: false,
      socketio: false,
      firebase: false,
      supabase: false,
      appwrite: false,
      hasura: false,
      graphql: false,
      rest: false,
      websocket: false,
      webhook: false,
      webhookUrl: '',
      webhookSecret: '',
      webhookEvents: []
    },
    advanced: {
      developerMode: false,
      debugMode: false,
      verboseLogging: false,
      performanceMode: false,
      powerUserMode: false,
      expertMode: false,
      experimentalFeatures: false,
      betaFeatures: false,
      earlyAccess: false,
      insiderBuild: false,
      canaryBuild: false,
      nightlyBuild: false,
      devBuild: false,
      stagingMode: false,
      productionMode: true,
      mockData: false,
      mockApi: false,
      mockAuth: false,
      mockStorage: false,
      mockDatabase: false,
      mockServer: false,
      mockNetwork: false,
      mockLocation: false,
      mockTime: false,
      mockDate: false,
      mockWeather: false,
      mockGeo: false,
      mockSocial: false,
      mockAnalytics: false,
      mockTracking: false,
      mockAds: false,
      mockPayments: false,
      mockSubscriptions: false,
      mockLicenses: false,
      mockPermissions: false,
      mockRoles: false,
      mockUsers: false,
      mockWorkspaces: false,
      mockProjects: false,
      mockTasks: false,
      mockBoards: false,
      mockColumns: false,
      mockCards: false,
      mockComments: false,
      mockAttachments: false,
      mockLabels: false,
      mockTags: false,
      mockCategories: false,
      mockPriorities: false,
      mockStatuses: false,
      mockTypes: false,
      mockTemplates: false,
      mockWorkflows: false,
      mockAutomations: false,
      mockIntegrations: false,
      mockPlugins: false,
      mockExtensions: false,
      mockThemes: false,
      mockLanguages: false,
      mockLocales: false,
      mockTimezones: false,
      mockCurrencies: false,
      mockUnits: false,
      mockFormats: false,
      mockStandards: false,
      mockProtocols: false,
      mockAPIs: false,
      mockSDKs: false,
      mockCLIs: false,
      mockGUIs: false,
      mockDashboards: false,
      mockReports: false,
      mockMetrics: false,
      mockKPIs: false,
      mockOKRs: false,
      mockGoals: false,
      mockObjectives: false,
      mockKeyResults: false,
      mockInitiatives: false,
      mockEpics: false,
      mockStories: false,
      mockSubtasks: false,
      mockChecklists: false,
      mockBlueprints: false,
      mockSchemas: false,
      mockModels: false,
      mockEntities: false,
      mockDomains: false,
      mockServices: false,
      mockControllers: false,
      mockRepositories: false,
      mockAdapters: false,
      mockPorts: false,
      mockGateways: false,
      mockProxies: false,
      mockFacades: false,
      mockDecorators: false,
      mockObservers: false,
      mockListeners: false,
      mockSubscribers: false,
      mockPublishers: false,
      mockConsumers: false,
      mockProducers: false,
      mockWorkers: false,
      mockQueues: false,
      mockJobs: false,
      mockCrons: false,
      mockSchedulers: false,
      mockTriggers: false,
      mockEvents: false,
      mockCommands: false,
      mockQueries: false,
      mockRequests: false,
      mockResponses: false,
      mockDTOs: false,
      mockVOs: false,
      mockAggregates: false,
      mockValueObjects: false,
      mockDomainEvents: false,
      mockDomainServices: false,
      mockApplicationServices: false,
      mockInfrastructureServices: false,
      mockPresentationServices: false,
      mockUIServices: false,
      mockUXServices: false,
      mockCXServices: false,
      mockDXServices: false
    },
    billing: {
      plan: 'free',
      subscription: 'none',
      status: 'inactive',
      startDate: null,
      endDate: null,
      trialEnd: null,
      autoRenew: false,
      paymentMethod: 'none',
      paymentDetails: {},
      billingEmail: '',
      billingAddress: {},
      taxInfo: {},
      invoices: [],
      receipts: [],
      transactions: [],
      credits: 0,
      debits: 0,
      balance: 0,
      currency: 'USD',
      timezone: 'UTC',
      locale: 'en-US',
      format: 'monthly',
      period: 'month',
      cycle: 'monthly',
      interval: 1,
      intervalUnit: 'month',
      gracePeriod: 0,
      cancellationPolicy: 'immediate',
      refundPolicy: 'none',
      supportPlan: 'basic',
      supportLevel: 'community',
      supportHours: 24,
      supportDays: 7,
      supportChannels: ['email', 'chat'],
      supportLanguages: ['en'],
      supportLocations: ['global'],
      supportRegions: ['all'],
      supportZones: ['all'],
      supportTiers: ['all'],
      supportPriority: 'normal',
      supportSLA: false,
      supportSLAHours: 24,
      supportSLADays: 7,
      supportSLALevel: 'basic',
      supportSLAZones: ['all'],
      supportSLARegions: ['all'],
      supportSLALocations: ['global']
    }
  });

  const [savedSettings, setSavedSettings] = useState({ ...settings });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon2, description: 'Basic application settings and preferences' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize the look and feel of your workspace' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Manage how and when you receive notifications' },
    { id: 'privacy', label: 'Privacy', icon: Lock, description: 'Control your privacy and data sharing preferences' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Secure your account with advanced security options' },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal, description: 'Fine-tune your application experience' },
    { id: 'accessibility', label: 'Accessibility', icon: Eye, description: 'Make the application work better for you' },
    { id: 'integrations', label: 'Integrations', icon: Globe2, description: 'Connect with your favorite tools and services' },
    { id: 'advanced', label: 'Advanced', icon: Cpu, description: 'Advanced settings for power users and developers' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Manage your subscription and payment methods' }
  ];

  // Simulate feature coming soon
  const handleFeatureClick = (feature) => {
    setComingSoon(prev => ({ ...prev, [feature]: true }));
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {feature} Coming Soon!
              </p>
              <p className="mt-1 text-sm text-purple-200">
                We're working hard to bring you this feature. Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-purple-500">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-purple-200 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    ), {
      duration: 4000,
      position: 'bottom-right',
    });
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    toast.success(`Preview mode ${!previewMode ? 'enabled' : 'disabled'}`);
  };

  // Save settings
  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSavedSettings({ ...settings });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Reset settings
  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({ ...savedSettings });
      toast.success('Settings reset to last saved state');
    }
  };

  // Check if settings have changed
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  // Coming Soon Badge Component
  const ComingSoonBadge = ({ feature, showToast = true }) => (
    <div className="relative group">
      <button
        onClick={() => showToast && handleFeatureClick(feature)}
        className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 rounded-md text-xs font-medium border border-purple-500/30 hover:border-purple-500/50 transition-all"
      >
        <Sparkles className="w-3 h-3" />
        Coming Soon
      </button>
      {previewMode && (
        <div className="absolute inset-0 bg-purple-500/10 rounded-md animate-pulse pointer-events-none" />
      )}
    </div>
  );

  // Coming Soon Section Component
  const ComingSoonSection = ({ title, description, icon: Icon, features = [] }) => (
    <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700 p-6 mb-6 overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.2) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
          <ComingSoonBadge feature={title} showToast={false} />
        </div>

        {/* Preview Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group/feature"
            >
              <button
                onClick={() => handleFeatureClick(feature.name)}
                className="w-full text-left p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feature.color || 'bg-purple-500/20'}`}>
                    {feature.icon && <feature.icon className={`w-4 h-4 ${feature.iconColor || 'text-purple-400'}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{feature.name}</p>
                    <p className="text-xs text-slate-400 truncate">{feature.description}</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover/feature:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Preview Overlay */}
              {previewMode && (
                <div className="absolute inset-0 bg-purple-500/5 rounded-lg pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Coming Soon Message */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Info className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-sm text-slate-300">
              We're actively developing this section. Stay tuned for exciting new features!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render coming soon content based on active tab
  const renderComingSoonContent = () => {
    const featureMaps = {
      general: {
        icon: SettingsIcon2,
        description: 'Configure your basic application settings and preferences',
        features: [
          { name: 'Language & Region', description: 'Set your preferred language and regional formats', icon: Globe, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Date & Time', description: 'Customize date and time display formats', icon: Calendar, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Keyboard Shortcuts', description: 'View and customize keyboard shortcuts', icon: Key, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'File Management', description: 'Configure file upload and storage settings', icon: HardDrive, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'Import/Export', description: 'Import and export your data', icon: Download, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Backup & Restore', description: 'Manage automatic backups and restore points', icon: Database, color: 'bg-pink-500/20', iconColor: 'text-pink-400' }
        ]
      },
      appearance: {
        icon: Palette,
        description: 'Customize the look and feel of your workspace',
        features: [
          { name: 'Theme Customization', description: 'Create and manage custom themes', icon: Moon, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'Color Schemes', description: 'Choose from various color combinations', icon: Palette, color: 'bg-pink-500/20', iconColor: 'text-pink-400' },
          { name: 'Layout Options', description: 'Customize the application layout', icon: Layout, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Typography', description: 'Adjust font settings and text styles', icon: Layers, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Animations', description: 'Control animation effects and transitions', icon: Activity, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Custom CSS', description: 'Add your own CSS styles', icon: Code, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' }
        ]
      },
      notifications: {
        icon: Bell,
        description: 'Manage how and when you receive notifications',
        features: [
          { name: 'Push Notifications', description: 'Configure push notification settings', icon: BellRing, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'Email Preferences', description: 'Choose which emails you receive', icon: Mail, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Desktop Notifications', description: 'Customize desktop notification behavior', icon: Monitor, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Mobile Notifications', description: 'Manage mobile app notifications', icon: Smartphone, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'Quiet Hours', description: 'Set times when notifications are muted', icon: Moon, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Notification Sounds', description: 'Choose notification alert sounds', icon: Volume2, color: 'bg-pink-500/20', iconColor: 'text-pink-400' }
        ]
      },
      privacy: {
        icon: Lock,
        description: 'Control your privacy and data sharing preferences',
        features: [
          { name: 'Profile Visibility', description: 'Control who can see your profile', icon: User, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'Data Sharing', description: 'Manage how your data is shared', icon: Globe, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Activity Tracking', description: 'Control what activity is tracked', icon: Activity, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Cookie Preferences', description: 'Manage cookie and tracking settings', icon: Cookie, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'Blocked Users', description: 'Manage blocked users list', icon: UserX, color: 'bg-red-500/20', iconColor: 'text-red-400' },
          { name: 'Data Export', description: 'Download a copy of your data', icon: Download, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' }
        ]
      },
      security: {
        icon: Shield,
        description: 'Secure your account with advanced security options',
        features: [
          { name: 'Two-Factor Auth', description: 'Enable 2FA for extra security', icon: Lock, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'Session Management', description: 'View and manage active sessions', icon: Smartphone, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Login History', description: 'Review recent login activity', icon: Clock, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'API Keys', description: 'Manage API access tokens', icon: Key, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'Security Questions', description: 'Set up security questions', icon: HelpCircle, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Trusted Devices', description: 'Manage trusted device list', icon: Laptop, color: 'bg-pink-500/20', iconColor: 'text-pink-400' }
        ]
      },
      preferences: {
        icon: SlidersHorizontal,
        description: 'Fine-tune your application experience',
        features: [
          { name: 'Default Views', description: 'Set default view preferences', icon: Grid, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'Task Defaults', description: 'Configure default task settings', icon: ListTodo, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Project Defaults', description: 'Set default project preferences', icon: FolderKanban, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Calendar Settings', description: 'Customize calendar display', icon: Calendar, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'Search Preferences', description: 'Configure search behavior', icon: Search, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Auto-save Settings', description: 'Configure auto-save behavior', icon: Save, color: 'bg-pink-500/20', iconColor: 'text-pink-400' }
        ]
      },
      accessibility: {
        icon: Eye,
        description: 'Make the application work better for you',
        features: [
          { name: 'Screen Reader', description: 'Optimize for screen readers', icon: Headphones, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'High Contrast', description: 'Enable high contrast mode', icon: Contrast, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Large Text', description: 'Increase text size', icon: Type, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Color Blind Mode', description: 'Adjust colors for color blindness', icon: Palette, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'Keyboard Navigation', description: 'Enhanced keyboard controls', icon: Keyboard, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Reduced Motion', description: 'Minimize animations and motion', icon: Wind, color: 'bg-pink-500/20', iconColor: 'text-pink-400' }
        ]
      },
      integrations: {
        icon: Globe2,
        description: 'Connect with your favorite tools and services',
        features: [
          { name: 'Google Workspace', description: 'Connect Google Calendar, Drive, and more', icon: Mail, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Microsoft 365', description: 'Integrate with Outlook, Teams, and Office', icon: Mail, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Slack', description: 'Connect with Slack channels', icon: MessageSquare, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'GitHub', description: 'Link with GitHub repositories', icon: Github, color: 'bg-gray-500/20', iconColor: 'text-gray-400' },
          { name: 'Jira', description: 'Integrate with Jira projects', icon: Activity, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Zapier', description: 'Connect with 3000+ apps via Zapier', icon: Zap, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' }
        ]
      },
      advanced: {
        icon: Cpu,
        description: 'Advanced settings for power users and developers',
        features: [
          { name: 'Developer Mode', description: 'Enable developer tools and features', icon: Code, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'API Access', description: 'Configure API access and tokens', icon: Key, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Webhooks', description: 'Set up webhook integrations', icon: Webhook, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Debug Mode', description: 'Enable debugging and logging', icon: Bug, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'Performance', description: 'Performance optimization settings', icon: TrendingUp, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Experimental', description: 'Try out experimental features', icon: Flask, color: 'bg-pink-500/20', iconColor: 'text-pink-400' }
        ]
      },
      billing: {
        icon: CreditCard,
        description: 'Manage your subscription and payment methods',
        features: [
          { name: 'Subscription Plans', description: 'View and change your plan', icon: Package, color: 'bg-purple-500/20', iconColor: 'text-purple-400' },
          { name: 'Payment Methods', description: 'Manage payment options', icon: CreditCard, color: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { name: 'Billing History', description: 'View past invoices', icon: History, color: 'bg-green-500/20', iconColor: 'text-green-400' },
          { name: 'Usage Statistics', description: 'Monitor your usage and limits', icon: BarChart3, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
          { name: 'Team Billing', description: 'Manage team subscriptions', icon: Users, color: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { name: 'Coupons & Credits', description: 'Apply coupons and view credits', icon: Gift, color: 'bg-pink-500/20', iconColor: 'text-pink-400' }
        ]
      }
    };

    const currentFeature = featureMaps[activeTab] || featureMaps.general;

    return (
      <ComingSoonSection
        title={tabs.find(t => t.id === activeTab)?.label || 'General'}
        description={currentFeature.description}
        icon={currentFeature.icon}
        features={currentFeature.features}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-purple-400" />
                Settings
              </h1>
              <p className="text-slate-400">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Preview Mode Toggle */}
              <button
                onClick={togglePreviewMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  previewMode
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {previewMode ? (
                  <>
                    <Eye size={16} />
                    <span>Preview On</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} />
                    <span>Preview Off</span>
                  </>
                )}
              </button>

              {/* Save Changes Button */}
              {hasChanges && (
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}

              {/* Reset Button */}
              <button
                onClick={resetSettings}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-1 bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left text-sm font-medium">{tab.label}</span>
                    <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      activeTab === tab.id ? 'text-white' : 'text-slate-400'
                    }`} />
                    
                    {/* Coming Soon Indicator */}
                    <Sparkles className={`w-3 h-3 absolute -top-1 -right-1 ${
                      activeTab === tab.id ? 'text-white' : 'text-purple-400'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Info Card */}
            <div className="mt-4 p-4 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-2xl border border-purple-500/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Rocket className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Settings Preview</h3>
                  <p className="text-xs text-slate-400">
                    All settings are currently in preview mode. Full functionality coming soon!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Coming Soon Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl border border-purple-500/30 backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white mb-1">Settings Under Construction</h3>
                  <p className="text-xs text-slate-400">
                    We're building a comprehensive settings panel with all the options you need. 
                    Click on any feature to see what's coming!
                  </p>
                </div>
                <button
                  onClick={() => window.open('https://feedback.taskflow.com', '_blank')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Request Feature
                </button>
              </div>
            </div>

            {/* Coming Soon Content */}
            {renderComingSoonContent()}

            {/* Additional Coming Soon Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <ComingSoonBadge feature="Analytics Dashboard" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Track your productivity, visualize trends, and gain insights into your work patterns.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400">Tasks Completed</p>
                    <p className="text-lg font-semibold text-white">1,234</p>
                  </div>
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400">Productivity</p>
                    <p className="text-lg font-semibold text-green-400">+27%</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <ComingSoonBadge feature="Team Management" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Team Management</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Manage team members, roles, permissions, and collaboration settings.
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                      U{i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-medium border border-slate-600">
                    +5
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 p-6 bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Development Timeline</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { phase: 'Q1 2024', features: ['Basic Settings', 'User Preferences'], status: 'completed' },
                  { phase: 'Q2 2024', features: ['Appearance', 'Notifications'], status: 'in-progress' },
                  { phase: 'Q3 2024', features: ['Security', 'Privacy'], status: 'planned' },
                  { phase: 'Q4 2024', features: ['Integrations', 'Advanced Settings'], status: 'planned' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-purple-400">{item.phase}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'in-progress' ? 'bg-yellow-500 animate-pulse' :
                          'bg-slate-600'
                        }`} />
                        <span className={`text-xs ${
                          item.status === 'completed' ? 'text-green-400' :
                          item.status === 'in-progress' ? 'text-yellow-400' :
                          'text-slate-400'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Help Shape the Future</h3>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Your feedback helps us prioritize features. Let us know what settings you'd like to see!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open('https://feedback.taskflow.com', '_blank')}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => window.open('https://roadmap.taskflow.com', '_blank')}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  View Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;