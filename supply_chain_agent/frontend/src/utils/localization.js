export const LOCALE_STORAGE_KEY = "chainpulse.locale"

export const SUPPORTED_LANGUAGES = [
  { locale: "en-US", label: "English (United States)", nativeLabel: "English (United States)", region: "United States" },
  { locale: "hi-IN", label: "Hindi (India)", nativeLabel: "हिन्दी (भारत)", region: "India" },
  { locale: "ur-PK", label: "Urdu (Pakistan)", nativeLabel: "اردو (پاکستان)", region: "Pakistan" },
  { locale: "ar-SA", label: "Arabic (Saudi Arabia)", nativeLabel: "العربية (السعودية)", region: "Saudi Arabia" },
  { locale: "es-ES", label: "Spanish (Spain)", nativeLabel: "Español (España)", region: "Spain" },
  { locale: "fr-FR", label: "French (France)", nativeLabel: "Français (France)", region: "France" },
  { locale: "de-DE", label: "German (Germany)", nativeLabel: "Deutsch (Deutschland)", region: "Germany" },
  { locale: "zh-CN", label: "Chinese (Simplified)", nativeLabel: "简体中文", region: "China" }
]

export const ROUTE_TRANSLATION_KEYS = {
  "/dashboard": "routes.dashboard",
  "/war-room": "routes.warRoom",
  "/simulator": "routes.whatIfSimulator",
  "/map": "routes.supplyChainMap",
  "/support": "routes.support",
  "/orders": "routes.orders",
  "/suppliers": "routes.suppliers",
  "/shipments": "routes.shipments",
  "/warehouses": "routes.warehouses",
  "/chat": "routes.copilot",
  "/esg": "routes.esg",
  "/reports": "routes.reports"
}

const TRANSLATIONS = {
  "en-US": {
    appName: "ChainPulse",
    routes: {
      dashboard: "Dashboard",
      warRoom: "War Room",
      whatIfSimulator: "What-If Simulator",
      supplyChainMap: "Supply Chain Map",
      support: "Support",
      orders: "Orders",
      suppliers: "Suppliers",
      shipments: "Shipments",
      warehouses: "Warehouses",
      copilot: "Copilot",
      esg: "ESG Dashboard",
      reports: "Reports"
    },
    roles: {
      admin: "Admin",
      analyst: "Analyst",
      viewer: "Viewer"
    },
    sidebar: {
      tagline: "Supply chain intelligence",
      signedInAs: "Signed in as",
      pipelineStatus: "Pipeline status",
      lastRun: "Last run {{time}}",
      noCompletedRuns: "No completed runs yet",
      healthy: "Healthy",
      idle: "Idle",
      runPipeline: "Run Pipeline",
      signOut: "Sign Out"
    },
    topbar: {
      subtitle: "Operational clarity across suppliers, shipments, and risks.",
      logout: "Logout",
      language: "Language",
      live: "Live",
      offline: "Offline",
      liveConnected: "Live websocket connected",
      disconnected: "Websocket disconnected",
      lastUpdated: "Last updated {{time}}",
      reportIssue: "Report issue"
    }
  },
  "hi-IN": {
    appName: "ChainPulse",
    routes: {
      dashboard: "डैशबोर्ड",
      warRoom: "वॉर रूम",
      whatIfSimulator: "व्हाट-इफ सिम्युलेटर",
      supplyChainMap: "सप्लाई चेन मैप",
      support: "सपोर्ट",
      orders: "ऑर्डर्स",
      suppliers: "आपूर्तिकर्ता",
      shipments: "शिपमेंट्स",
      warehouses: "वेयरहाउस",
      copilot: "कोपायलट",
      esg: "ईएसजी डैशबोर्ड",
      reports: "रिपोर्ट्स"
    },
    roles: {
      admin: "एडमिन",
      analyst: "विश्लेषक",
      viewer: "दर्शक"
    },
    sidebar: {
      tagline: "सप्लाई चेन इंटेलिजेंस",
      signedInAs: "इस रूप में साइन इन",
      pipelineStatus: "पाइपलाइन स्थिति",
      lastRun: "आखिरी रन {{time}}",
      noCompletedRuns: "अभी तक कोई पूर्ण रन नहीं",
      healthy: "सामान्य",
      idle: "निष्क्रिय",
      runPipeline: "पाइपलाइन चलाएँ",
      signOut: "साइन आउट"
    },
    topbar: {
      subtitle: "आपूर्तिकर्ताओं, शिपमेंट्स और जोखिमों पर स्पष्ट परिचालन दृश्य.",
      logout: "लॉगआउट",
      language: "भाषा",
      live: "लाइव",
      offline: "ऑफलाइन",
      liveConnected: "लाइव वेबSocket कनेक्टेड",
      disconnected: "वेबSocket डिस्कनेक्टेड",
      lastUpdated: "आखिरी अपडेट {{time}}",
      reportIssue: "समस्या रिपोर्ट करें"
    }
  },
  "ur-PK": {
    appName: "ChainPulse",
    routes: {
      dashboard: "ڈیش بورڈ",
      warRoom: "وار روم",
      whatIfSimulator: "واٹ اِف سمیولیٹر",
      supplyChainMap: "سپلائی چین نقشہ",
      support: "سپورٹ",
      orders: "آرڈرز",
      suppliers: "سپلائرز",
      shipments: "شپمنٹس",
      warehouses: "ویئرہاؤسز",
      copilot: "کوپائلٹ",
      esg: "ای ایس جی ڈیش بورڈ",
      reports: "رپورٹس"
    },
    roles: {
      admin: "ایڈمن",
      analyst: "تجزیہ کار",
      viewer: "دیکھنے والا"
    },
    sidebar: {
      tagline: "سپلائی چین انٹیلیجنس",
      signedInAs: "اس طور پر سائن اِن",
      pipelineStatus: "پائپ لائن اسٹیٹس",
      lastRun: "آخری رن {{time}}",
      noCompletedRuns: "ابھی تک کوئی مکمل رن نہیں",
      healthy: "صحیح",
      idle: "غیر فعال",
      runPipeline: "پائپ لائن چلائیں",
      signOut: "سائن آؤٹ"
    },
    topbar: {
      subtitle: "سپلائرز، شپمنٹس اور خطرات پر واضح آپریشنل نظر.",
      logout: "لاگ آؤٹ",
      language: "زبان",
      live: "لائیو",
      offline: "آف لائن",
      liveConnected: "لائیو ویب ساکٹ منسلک ہے",
      disconnected: "ویب ساکٹ منقطع ہے",
      lastUpdated: "آخری اپ ڈیٹ {{time}}",
      reportIssue: "مسئلہ رپورٹ کریں"
    }
  },
  "ar-SA": {
    appName: "ChainPulse",
    routes: {
      dashboard: "لوحة التحكم",
      warRoom: "غرفة العمليات",
      whatIfSimulator: "محاكي ماذا لو",
      supplyChainMap: "خريطة سلسلة الإمداد",
      support: "الدعم",
      orders: "الطلبات",
      suppliers: "الموردون",
      shipments: "الشحنات",
      warehouses: "المستودعات",
      copilot: "المساعد",
      esg: "لوحة ESG",
      reports: "التقارير"
    },
    roles: {
      admin: "المسؤول",
      analyst: "المحلل",
      viewer: "المشاهد"
    },
    sidebar: {
      tagline: "ذكاء سلسلة الإمداد",
      signedInAs: "تم تسجيل الدخول باسم",
      pipelineStatus: "حالة خط الأنابيب",
      lastRun: "آخر تشغيل {{time}}",
      noCompletedRuns: "لا توجد عمليات مكتملة بعد",
      healthy: "سليم",
      idle: "خامل",
      runPipeline: "تشغيل الخط",
      signOut: "تسجيل الخروج"
    },
    topbar: {
      subtitle: "وضوح تشغيلي شامل عبر الموردين والشحنات والمخاطر.",
      logout: "تسجيل الخروج",
      language: "اللغة",
      live: "مباشر",
      offline: "غير متصل",
      liveConnected: "اتصال الويب سوكيت المباشر نشط",
      disconnected: "اتصال الويب سوكيت غير نشط",
      lastUpdated: "آخر تحديث {{time}}",
      reportIssue: "الإبلاغ عن مشكلة"
    }
  },
  "es-ES": {
    appName: "ChainPulse",
    routes: {
      dashboard: "Panel",
      warRoom: "Sala de guerra",
      whatIfSimulator: "Simulador What-If",
      supplyChainMap: "Mapa de cadena de suministro",
      support: "Soporte",
      orders: "Pedidos",
      suppliers: "Proveedores",
      shipments: "Envíos",
      warehouses: "Almacenes",
      copilot: "Copiloto",
      esg: "Panel ESG",
      reports: "Informes"
    },
    roles: {
      admin: "Administrador",
      analyst: "Analista",
      viewer: "Visualizador"
    },
    sidebar: {
      tagline: "Inteligencia de cadena de suministro",
      signedInAs: "Sesión iniciada como",
      pipelineStatus: "Estado del pipeline",
      lastRun: "Última ejecución {{time}}",
      noCompletedRuns: "Aún no hay ejecuciones completadas",
      healthy: "Saludable",
      idle: "Inactivo",
      runPipeline: "Ejecutar pipeline",
      signOut: "Cerrar sesión"
    },
    topbar: {
      subtitle: "Claridad operativa en proveedores, envíos y riesgos.",
      logout: "Cerrar sesión",
      language: "Idioma",
      live: "En vivo",
      offline: "Sin conexión",
      liveConnected: "Websocket en vivo conectado",
      disconnected: "Websocket desconectado",
      lastUpdated: "Última actualización {{time}}",
      reportIssue: "Reportar problema"
    }
  },
  "fr-FR": {
    appName: "ChainPulse",
    routes: {
      dashboard: "Tableau de bord",
      warRoom: "Salle de crise",
      whatIfSimulator: "Simulateur What-If",
      supplyChainMap: "Carte logistique",
      support: "Support",
      orders: "Commandes",
      suppliers: "Fournisseurs",
      shipments: "Expéditions",
      warehouses: "Entrepôts",
      copilot: "Copilote",
      esg: "Tableau ESG",
      reports: "Rapports"
    },
    roles: {
      admin: "Administrateur",
      analyst: "Analyste",
      viewer: "Lecteur"
    },
    sidebar: {
      tagline: "Intelligence supply chain",
      signedInAs: "Connecté en tant que",
      pipelineStatus: "État du pipeline",
      lastRun: "Dernière exécution {{time}}",
      noCompletedRuns: "Aucune exécution terminée pour le moment",
      healthy: "Sain",
      idle: "Inactif",
      runPipeline: "Lancer le pipeline",
      signOut: "Se déconnecter"
    },
    topbar: {
      subtitle: "Visibilité opérationnelle sur les fournisseurs, expéditions et risques.",
      logout: "Déconnexion",
      language: "Langue",
      live: "En direct",
      offline: "Hors ligne",
      liveConnected: "Websocket en direct connecté",
      disconnected: "Websocket déconnecté",
      lastUpdated: "Dernière mise à jour {{time}}",
      reportIssue: "Signaler un problème"
    }
  },
  "de-DE": {
    appName: "ChainPulse",
    routes: {
      dashboard: "Dashboard",
      warRoom: "War Room",
      whatIfSimulator: "What-If-Simulator",
      supplyChainMap: "Lieferkettenkarte",
      support: "Support",
      orders: "Bestellungen",
      suppliers: "Lieferanten",
      shipments: "Sendungen",
      warehouses: "Lagerhäuser",
      copilot: "Copilot",
      esg: "ESG-Dashboard",
      reports: "Berichte"
    },
    roles: {
      admin: "Administrator",
      analyst: "Analyst",
      viewer: "Betrachter"
    },
    sidebar: {
      tagline: "Lieferketten-Intelligenz",
      signedInAs: "Angemeldet als",
      pipelineStatus: "Pipeline-Status",
      lastRun: "Letzter Lauf {{time}}",
      noCompletedRuns: "Noch keine abgeschlossenen Läufe",
      healthy: "Stabil",
      idle: "Leerlauf",
      runPipeline: "Pipeline starten",
      signOut: "Abmelden"
    },
    topbar: {
      subtitle: "Operative Transparenz über Lieferanten, Sendungen und Risiken.",
      logout: "Abmelden",
      language: "Sprache",
      live: "Live",
      offline: "Offline",
      liveConnected: "Live-Websocket verbunden",
      disconnected: "Websocket getrennt",
      lastUpdated: "Zuletzt aktualisiert {{time}}",
      reportIssue: "Problem melden"
    }
  },
  "zh-CN": {
    appName: "ChainPulse",
    routes: {
      dashboard: "仪表盘",
      warRoom: "指挥室",
      whatIfSimulator: "假设模拟器",
      supplyChainMap: "供应链地图",
      support: "支持",
      orders: "订单",
      suppliers: "供应商",
      shipments: "货运",
      warehouses: "仓库",
      copilot: "助手",
      esg: "ESG 仪表盘",
      reports: "报告"
    },
    roles: {
      admin: "管理员",
      analyst: "分析师",
      viewer: "查看者"
    },
    sidebar: {
      tagline: "供应链智能",
      signedInAs: "当前登录用户",
      pipelineStatus: "流水线状态",
      lastRun: "上次运行 {{time}}",
      noCompletedRuns: "暂无已完成运行",
      healthy: "正常",
      idle: "空闲",
      runPipeline: "运行流水线",
      signOut: "退出登录"
    },
    topbar: {
      subtitle: "为供应商、货运与风险提供清晰的运营视图。",
      logout: "退出登录",
      language: "语言",
      live: "在线",
      offline: "离线",
      liveConnected: "实时 websocket 已连接",
      disconnected: "websocket 已断开",
      lastUpdated: "最近更新 {{time}}",
      reportIssue: "报告问题"
    }
  }
}

function interpolate(template, vars = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "")
}

function getNestedValue(source, path) {
  return path.split(".").reduce((value, key) => (value && key in value ? value[key] : undefined), source)
}

export function resolveSupportedLanguage(preferredLocale) {
  if (!preferredLocale) return SUPPORTED_LANGUAGES[0]

  const normalized = String(preferredLocale).toLowerCase()
  const exactMatch = SUPPORTED_LANGUAGES.find((entry) => entry.locale.toLowerCase() === normalized)
  if (exactMatch) return exactMatch

  const languageCode = normalized.split("-")[0]
  return SUPPORTED_LANGUAGES.find((entry) => entry.locale.toLowerCase().startsWith(`${languageCode}-`)) || SUPPORTED_LANGUAGES[0]
}

export function detectPreferredLanguage() {
  if (typeof window === "undefined") return SUPPORTED_LANGUAGES[0]

  const storedPreference = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (storedPreference) return resolveSupportedLanguage(storedPreference)

  const browserLanguages = window.navigator.languages?.length ? window.navigator.languages : [window.navigator.language]
  for (const locale of browserLanguages) {
    const match = resolveSupportedLanguage(locale)
    if (match) return match
  }

  return SUPPORTED_LANGUAGES[0]
}

export function translate(locale, key, vars = {}) {
  const dictionary = TRANSLATIONS[resolveSupportedLanguage(locale).locale] || TRANSLATIONS["en-US"]
  const fallback = TRANSLATIONS["en-US"]
  const match = getNestedValue(dictionary, key) ?? getNestedValue(fallback, key) ?? key
  return typeof match === "string" ? interpolate(match, vars) : match
}
