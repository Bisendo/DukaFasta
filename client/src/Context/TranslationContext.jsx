// TranslationContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Translation data
const translations = {
  en: {


        // Dashboard
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    welcomeBack: 'Welcome Back',
    dashboardSummary: 'Dashboard Summary',
    dashboardSummaryMessage: "Here's what's happening with your store today.",
    refresh: 'Refresh',
    refreshing: 'Refreshing data...',
    date: 'Date',
    
    // Navigation
    orders: 'Orders',
    products: 'Products',
    users: 'Users',
    help: 'Help & Support',
    logout: 'Logout',
    
    // Stats
    totalSales: 'Total Sales',
    totalPurchases: 'Total Purchases',
    totalProducts: 'Total Products',
    totalOrders: 'Total Orders',
    
    // Products
    soldProducts: 'Sold Products',
    managedBy: 'Managed by',
    pricePerUnit: 'Price per unit',
    itemsSold: 'Items sold',
    total: 'Total',
    totalRevenueFromSales: 'Total revenue from sales',
    item: 'item',
    items: 'items',
    sold: 'sold',
    
    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    
    // System
    inventoryManagementSystem: 'Inventory Management System',
    allRightsReserved: 'All rights reserved',
    version: 'Version',
    lastUpdated: 'Last updated',
    
    // User roles
    administrator: 'Administrator',
    storekeeper: 'Storekeeper',
    shopkeeper: 'Shopkeeper',
    user: 'User',
    admin: 'Admin',
    
    // Recent Activity
    recentActivity: 'Recent Activity',
    newOrderPlaced: 'New order placed',
    productRestocked: 'Product restocked',
    lowStockAlert: 'Low stock alert',
    minutesAgo: '{{count}} min ago',
    hourAgo: '{{count}} hour ago',
    hoursAgo: '{{count}} hours ago',
       // Common
    dashboard: "Dashboard",
    orders: "Orders",
    products: "Products",
    users: "Users",
    help: "Help & Support",
    logout: "Logout",
    welcome: "Welcome",
    refresh: "Refresh",
    allRightsReserved: "All rights reserved",
    version: "Version",
    inventoryManagementSystem: "Inventory Management System",
    
    // Help Center specific
    helpCenter: "Help Center",
    helpSupport: "Help & Support Center",
    getHelpDescription: "Get help, contact support, or browse our documentation",
    howCanWeHelp: "How can we help you today?",
    supportDescription: "Our support team is here to assist you with any questions or issues.",
    
    // Support categories
    liveChat: "Live Chat Support",
    liveChatDesc: "Chat with our support team in real-time",
    phoneSupport: "Phone Support",
    phoneSupportDesc: "Call us for immediate assistance",
    emailSupport: "Email Support",
    emailSupportDesc: "Send us an email and we'll respond within 24 hours",
    knowledgeBase: "Knowledge Base",
    knowledgeBaseDesc: "Browse our documentation and tutorials",
    
    // Availability
    available24_7: "24/7 Available",
    businessHours: "Business Hours",
    response24h: "Response within 24h",
    alwaysAvailable: "Always Available",
    
    // Contact info
    contactInformation: "Contact Information",
    phone: "Phone",
    email: "Email",
    location: "Location",
    callForSupport: "Call us for immediate support",
    emailForSupport: "Email us for detailed inquiries",
    physicalAddress: "Our physical office location",
    workingHours: "Working Hours",
    website: "Website",
    
    // FAQ
    frequentlyAskedQuestions: "Frequently Asked Questions",
    faqHowToAddProduct: "How do I add a new product?",
    faqHowToAddProductAnswer: "Go to Products section, click 'Add New Product' button, fill in the product details, and save.",
    faqTrackOrders: "How can I track my orders?",
    faqTrackOrdersAnswer: "Navigate to Orders section where you can view all orders and their current status.",
    faqResetPassword: "How do I reset my password?",
    faqResetPasswordAnswer: "Click on your profile, select 'Settings', then 'Change Password'. You'll receive an email with instructions.",
    faqGenerateReport: "How to generate inventory reports?",
    faqGenerateReportAnswer: "Go to Reports section, select report type and date range, then click 'Generate Report'.",
    
    // Call to action
    stillHaveQuestions: "Still have questions? We're here to help!",
    callNow: "Call Now",
    sendEmail: "Send Email",
    supportAvailable: "Support available",
    home: "Dashboard",
    inventory: "Inventory",
    orders: "Orders",
    customers: "Customers",
    reports: "Reports",
    settings: "Settings",
    searchPlaceholder: "Search inventory...",
    profile: "Profile",
    logout: "Logout",
    notifications: "Notifications",
    language: "Language",
    english: "English",
    swahili: "Kiswahili",
    // New landing page translations
    trustedByBusinesses: "Trusted by 2,500+ businesses worldwide",
    heroTitle1: "Master Your",
    heroTitle2: "Inventory Flow",
    heroDescription: "Streamline your inventory management with AI-powered insights. Reduce costs by up to 40%, eliminate stockouts, and make data-driven decisions with real-time analytics.",
    startFreeTrial: "Start Free 14-Day Trial",
    watchProductTour: "Watch Product Tour",
    ratedByBusinesses: "Rated by 1,200+ businesses",

    // Dashboard translations
    inventoryDashboard: "Inventory Dashboard",
    realTimeOverview: "Real-time overview",
    totalProducts: "Total Products",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    growthFromLastMonth: "↗︎ 12% from last month",
    decreaseFromLastMonth: "↘︎ 5% from last month",
    topSellingProducts: "Top Selling Products",
    viewAll: "View All",
    product1: "Wireless Headphones Pro",
    product2: "USB-C Fast Charger",
    product3: "Ergonomic Laptop Stand",
    sold126: "126 sold",
    sold89: "89 sold",
    sold54: "54 sold",
    lowStockAlert: "Low Stock Alert",
    itemsNeedReordering: "5 items need reordering",
    liveUpdate: "Live update",
    nextRestock: "Next restock: 3 days",

    // Stats
    statUptime: "System Uptime",
    statBusinesses: "Businesses Trust",
    statCostReduction: "Avg Cost Reduction",
    statTimeSaved: "Weekly Time Saved",


    welcomeBack: 'Welcome back',
    loginDescription: 'Please log in to your account to access your inventory management dashboard.',
    loginToYourAccount: 'Login to your account',
    enterCredentials: 'Enter your credentials to continue',
    emailOrPhone: 'Email or Phone number',
    enterEmailOrPhone: 'Enter your email or phone number',
    emailOrPhoneRequired: 'Email or phone number is required',
    invalidEmailOrPhone: 'Please enter a valid email or phone number',
    password: 'Password',
    enterPassword: 'Enter your password',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password',
    login: 'Login',
    loggingIn: 'Logging in',
    loginSuccess: 'Login successful! Redirecting...',
    loginFailed: 'Login failed. Please check your credentials.',
    tryDemoAccount: 'Try Demo Account',
    orContinueWith: 'Or continue with',
    noAccount: 'Don\'t have an account?',
    createAccountHere: 'Create account here',
    securityTips: 'Security Tips',
    tip1: 'Never share your password with anyone',
    tip2: 'Use a strong, unique password',
    tip3: 'Log out from shared devices',
    whyChooseIMS: 'Why Choose IMS?',
    imsDescription: 'Manage your inventory efficiently with our powerful management system',
    feature1Title: 'Real-time Tracking',
    feature1Desc: 'Monitor stock levels and get instant updates',
    feature2Title: 'Secure & Reliable',
    feature2Desc: 'Enterprise-grade security for your data',
    feature3Title: 'Advanced Analytics',
    feature3Desc: 'Get insights with detailed reports and analytics',
    feature4Title: '24/7 Support',
    feature4Desc: 'Our team is always ready to help you',
    whatUsersSay: 'What Our Users Say',
    storeManager: 'Store Manager',
    businessOwner: 'Business Owner',
    testimonial1: 'IMS has revolutionized how we manage our inventory!',
    testimonial2: 'Best inventory system I\'ve used in 10 years of business.',
    allRightsReserved: 'All rights reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    helpCenter: 'Help Center',

    // Features
    powerfulFeatures: "POWERFUL FEATURES",
    featuresTitle1: "Everything You Need for",
    featuresTitle2: "Modern Inventory Management",
    featuresDescription: "From AI-powered predictions to real-time collaboration, our platform delivers everything you need to optimize your inventory operations.",

    // Feature details
    featureRealTimeAnalytics: "Real-Time Analytics",
    featureRealTimeAnalyticsDesc: "Monitor stock levels, sales trends, and inventory turnover with live dashboards.",
    featureRealTimeAnalyticsStat: "+89% efficiency",
    featureCloudPlatform: "Cloud-Based Platform",
    featureCloudPlatformDesc: "Access your inventory from anywhere, on any device. Real-time synchronization.",
    featureCloudPlatformStat: "Anywhere access",
    featureEnterpriseSecurity: "Enterprise Security",
    featureEnterpriseSecurityDesc: "Bank-level security with 99.9% uptime guarantee and automated backups.",
    featureEnterpriseSecurityStat: "99.9% uptime",
    featureSmartAutomation: "Smart Automation",
    featureSmartAutomationDesc: "AI-powered reorder points and predictive inventory management.",
    featureSmartAutomationStat: "40% time saved",
    featureTeamCollaboration: "Team Collaboration",
    featureTeamCollaborationDesc: "Role-based permissions and real-time team collaboration tools.",
    featureTeamCollaborationStat: "Unlimited users",
    featureBarcodeSystem: "Barcode System",
    featureBarcodeSystemDesc: "Mobile barcode scanning and RFID integration capabilities.",
    featureBarcodeSystemStat: "5x faster counts",

    // Pricing
    simplePricing: "SIMPLE PRICING",
    chooseYourPlan: "Choose Your Perfect Plan",
    pricingDescription: "All plans include a 14-day free trial. No credit card required to start.",
    planStarter: "Starter",
    planStarterDesc: "Perfect for small businesses",
    planProfessional: "Professional",
    planProfessionalDesc: "For growing businesses",
    planEnterprise: "Enterprise",
    planEnterpriseDesc: "For large organizations",
    perMonth: "/month",
    customPrice: "Custom",
    tailored: "/tailored",
    mostPopular: "Most Popular",

    // Plan features
    featureUpTo500Products: "Up to 500 products",
    feature2UserAccounts: "2 user accounts",
    featureBasicReporting: "Basic reporting",
    featureEmailSupport: "Email support",
    featureMobileAppAccess: "Mobile app access",
    featureBarcodeScanning: "Barcode scanning",
    featureAPIAccess: "API access",
    featureUpTo5000Products: "Up to 5,000 products",
    feature10UserAccounts: "10 user accounts",
    featureAdvancedAnalytics: "Advanced analytics",
    featurePrioritySupport: "Priority support",
    featureCustomReports: "Custom reports",
    featureUnlimitedProducts: "Unlimited products",
    featureUnlimitedUsers: "Unlimited users",
    featureCustomReporting: "Custom reporting",
    feature247PhoneSupport: "24/7 phone support",
    featureCustomIntegrations: "Custom integrations",
    featureDedicatedAccountManager: "Dedicated account manager",
    featureOnPremiseDeployment: "On-premise deployment",

    needCustomSolution: "Need a custom solution?",
    contactSalesTeam: "Contact our sales team →",

    // Testimonials
    trustedByIndustryLeaders: "TRUSTED BY INDUSTRY LEADERS",
    lovedByBusinesses: "Loved by Thousands of Businesses",
    testimonialRole1: "Operations Director",
    testimonialRole2: "Inventory Manager",
    testimonialRole3: "CEO",
    testimonialText1: "StockMaster reduced our inventory costs by 40% and saved over 15 hours weekly on manual tracking. The predictive analytics are incredibly accurate.",
    testimonialText2: "The real-time alerts prevented stockouts during peak season. Our fulfillment accuracy improved from 92% to 99.7% in just 3 months.",
    testimonialText3: "Intuitive interface with powerful reporting. Our team adopted it in one day and our inventory accuracy is now at 99.9%.",
    verifiedCustomer: "Verified customer",
    monthsUsingStockMaster: "6 months using StockMaster",

    activeUsers: 'Active Users',
    uptime: 'Uptime',
    support: 'Support',

    // CTA
    freeTrialNoCreditCard: "14-DAY FREE TRIAL • NO CREDIT CARD REQUIRED",
    ctaTitle1: "Ready to Transform Your",
    ctaTitle2: "Inventory Management?",
    ctaDescription: "Join 2,500+ businesses that have streamlined their operations, reduced costs, and eliminated stockouts with StockMaster.",
    enterWorkEmail: "Enter your work email",
    thankYou: "Thank You!",
    instantAccess: "Get instant access. No setup fees. Cancel anytime.",
    bankLevelSecurity: "Bank-level Security",
    freeUpdates: "Free Updates",
    support247: "24/7 Support",
    dataOwnership: "Data Ownership",

    // Footer
    powerfulInventoryManagement: "Powerful inventory management",
    footerDescription: "Empowering businesses worldwide with intelligent inventory solutions. Streamline operations, reduce costs, and grow with confidence.",
    product: "Product",
    features: "Features",
    pricing: "Pricing",
    api: "API",
    documentation: "Documentation",
    changelog: "Changelog",
    status: "Status",
    company: "Company",
    aboutUs: "About Us",
    careers: "Careers",
    blog: "Blog",
    press: "Press",
    partners: "Partners",
    contact: "Contact",
    resources: "Resources",
    helpCenter: "Help Center",
    community: "Community",
    tutorials: "Tutorials",
    webinars: "Webinars",
    templates: "Templates",
    caseStudies: "Case Studies",
    allRightsReserved: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    cookiePolicy: "Cookie Policy",
    gdprCompliance: "GDPR Compliance",

    orders: 'Orders',
    products: 'Products',
    users: 'Users',
    logout: 'Logout',
    welcome: 'Welcome',
    dashboardSummary: 'Dashboard Summary',
    addProductDesc: 'Add new inventory item',
    createOrderDesc: 'Process new sale',
    generateReportDesc: 'Export sales data',
    manageUsersDesc: 'User permissions',
    item: 'item',
    items: 'items',
    sold: 'sold',
    totalRevenueFromSales: 'Total revenue from sales',
    recentActivity: 'Recent Activity',
    version: 'Version',
    refreshing: 'Refreshing data...',
     // Navigation & Menu
  dashboard: "Dashboard",
  orders: "Orders",
  inventory: "Inventory",
  products: "Products",
  sales: "Sales",
  customers: "Customers",
  help: "Help & Support",
  settings: "Settings",
  logout: "Logout",
  
  // Dashboard Content
  shopkeeperDashboard: "Shop Dashboard",
  welcome: "Welcome",
  welcomeBack: "Welcome Back",
  shopManagementSystem: "Shop Management System",
  allRightsReserved: "All rights reserved",
  contact: "Contact",
  todayRevenue: "Today Revenue",
  
  // Stats
  todaySales: "Today Sales",
  totalOrders: "Total Orders",
  activeProducts: "Active Products",
  customerSatisfaction: "Customer Satisfaction",
  
  // Sections
  recentSales: "Recent Sales",
  topProducts: "Top Products",
  lowStockAlert: "Low Stock Alert",
  notifications: "Notifications",
  quickActions: "Quick Actions",
  
  // Actions
  refresh: "Refresh",
  viewAll: "View All",
  restockNow: "Restock Now",
  newOrder: "New Order",
  addProduct: "Add Product",
  recordSale: "Record Sale",
  addCustomer: "Add Customer",
  
  // Status & Labels
  date: "Date",
  dashboardSummary: "Dashboard Summary",
  shopSummary: "Shop Summary",
  monthlyRevenue: "Monthly Revenue",
  activeCustomers: "Active Customers",
  monthlyGrowth: "Monthly Growth",
  managedBy: "Managed by",
  itemsSold: "Items sold",
  total: "Total",
  totalRevenueFromSales: "Total revenue from sales",
  
  // Tabs
  overview: "Overview",
  analytics: "Analytics",
  inventory: "Inventory",
  customers: "Customers",
  
  // Order Status
  completed: "Completed",
  processing: "Processing",
  pending: "Pending",
  
  // Payment Methods
  cash: "Cash",
  mobileMoney: "Mobile Money",
  creditCard: "Credit Card",
  bankTransfer: "Bank Transfer",
  
  // General
  version: "Version",
  lastUpdated: "Last updated",
  user: "User",
  items: "items",
  item: "item",
  sold: "sold",
  pricePerUnit: "Price per unit",
  onlyLeft: "Only {count} left",
  min: "Min",
  category: "Category",
  
  // Time
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
  
  // Messages
  dashboardSummaryMessage: "Here's what's happening with your store today.",
  refreshing: "Refreshing data...",
  newOrderReceived: "New order received from Customer #{id}",
  lowStockAlertMessage: "Low stock alert: {product} (Only {count} left)",
  paymentReceived: "Payment received for Order #{id}",
  
  // Shop Info
  techGadgetsStore: "Tech Gadgets Store",
  marketStreet: "123 Market Street, City Center",
  
  // Tooltips
  toggleSidebar: "Toggle sidebar",
  markAsRead: "Mark as read",
  
  // Placeholders
  searchProducts: "Search products...",
  filterByCategory: "Filter by category",
  selectCustomer: "Select customer",
  enterAmount: "Enter amount",
  
  // Validation
  required: "Required",
  invalidEmail: "Invalid email",
  minAmount: "Minimum amount is {amount}",
  
  // Success Messages
  orderCreated: "Order created successfully",
  productAdded: "Product added successfully",
  saleRecorded: "Sale recorded successfully",
  customerAdded: "Customer added successfully",
  
  // Error Messages
  somethingWentWrong: "Something went wrong",
  insufficientStock: "Insufficient stock",
  connectionError: "Connection error",
  
  // Empty States
  noOrders: "No orders yet",
  noProducts: "No products found",
  noCustomers: "No customers yet",
  noNotifications: "No notifications",
  
  // Categories
  audio: "Audio",
  wearables: "Wearables",
  accessories: "Accessories",
  electronics: "Electronics",
  gadgets: "Gadgets",
  
  // Units
  piece: "pc",
  box: "box",
  pack: "pack",
  kg: "kg",
  liter: "L",
  },
  sw: {
    // Navbar translations
    home: "Dashibodi",
    inventory: "Hisa",
    orders: "Maagizo",
    customers: "Wateja",
    reports: "Ripoti",
    settings: "Mipangilio",
    searchPlaceholder: "Tafuta hisa...",
    profile: "Wasifu",
    logout: "Toka",
    language: "Lugha",
    english: "Kiingereza",
    swahili: "Kiswahili",

    // Landing page translations
    trustedByBusinesses: "Inaaminika na biashara 2,500+ ulimwenguni",
    heroTitle1: "Dhibiti",
    heroTitle2: "Mtiririko wa Hisa",
    heroDescription: "Rahisisha usimamizi wa hisa zako kwa maarifa yanayotumia akili bandia. Punguza gharama hadi 40%, ondoa ukosefu wa hisa, na fanya maamuzi yanayotegemea data kwa uchambuzi wa wakati halisi.",
    startFreeTrial: "Anzisha Jaribio la Bure la Siku 14",
    watchProductTour: "Tazama Ziara ya Bidhaa",
    ratedByBusinesses: "Imepimwa na biashara 1,200+",

    welcomeBack: 'Karibu tena',
    loginDescription: 'Tafadhali ingia kwenye akaunti yako kupata dashibodi ya usimamizi wa hisa.',
    loginToYourAccount: 'Ingia kwenye akaunti yako',
    enterCredentials: 'Weka maelezo yako kuendelea',
    emailOrPhone: 'Barua pepe au Nambari ya simu',
    enterEmailOrPhone: 'Weka barua pepe au nambari ya simu',
    emailOrPhoneRequired: 'Barua pepe au nambari ya simu inahitajika',
    invalidEmailOrPhone: 'Tafadhali weka barua pepe au nambari ya simu sahihi',
    password: 'Nenosiri',
    enterPassword: 'Weka nenosiri lako',
    passwordRequired: 'Nenosiri linahitajika',
    passwordMinLength: 'Nenosiri lazima liwe na angalau herufi 6',
    rememberMe: 'Nikumbuke',
    forgotPassword: 'Umesahau nenosiri',
    login: 'Ingia',
    loggingIn: 'Inakuja ndani',
    loginSuccess: 'Umefanikiwa kuingia! Unaelekezwa...',
    loginFailed: 'Kuingia kumeshindikana. Tafadhali angalia maelezo yako.',
    tryDemoAccount: 'Jaribu Akaunti ya Onyesho',
    orContinueWith: 'Au endelea na',
    noAccount: 'Huna akaunti?',
    createAccountHere: 'Unda akaunti hapa',
    securityTips: 'Vidokezo vya Usalama',
    tip1: 'Kamwe usishiriki nenosiri lako na mtu yeyote',
    tip2: 'Tumia nenosiri thabiti na la kipekee',
    tip3: 'Toka kwenye vifaa vilivyoshirikiwa',
    whyChooseIMS: 'Kwa Nini Uchague IMS?',
    imsDescription: 'Dhibiti hisa zako kwa ufanisi na mfumo wetu wenye nguvu wa usimamizi',
    feature1Title: 'Ufuatiliaji wa Wakati Halisi',
    feature1Desc: 'Fuatilia viwango vya hisa na upate visasisho papo hapo',
    feature2Title: 'Salama na Inategemewa',
    feature2Desc: 'Usalama wa kiwango cha wigo kwa data yako',
    feature3Title: 'Uchambuzi wa Hali ya Juu',
    feature3Desc: 'Pata ufahamu kwa ripoti za kina na uchambuzi',
    feature4Title: 'Usaidizi 24/7',
    feature4Desc: 'Timu yetu iko tayari kukusaidia kila wakati',
    whatUsersSay: 'Watumiaji Wetu Wanasema Nini',
    storeManager: 'Meneja wa Duka',
    businessOwner: 'Mmiliki wa Biashara',
    testimonial1: 'IMS imebadilisha kabisa jinsi tunavyodhibiti hisa zetu!',
    testimonial2: 'Mfumo bora wa hisa nilioutumia katika miaka 10 ya biashara.',
    allRightsReserved: 'Haki zote zimehifadhiwa',
    privacyPolicy: 'Sera ya Faragha',
    termsOfService: 'Masharti ya Huduma',
    helpCenter: 'Kituo cha Usaidizi',

    // Dashboard translations
    inventoryDashboard: "Dashibodi ya Hisa",
    realTimeOverview: "Muhtasari wa wakati halisi",
    totalProducts: "Jumla ya Bidhaa",
    inStock: "Katika Hifadhi",
    lowStock: "Hisa Chache",
    outOfStock: "Imekwisha",
    growthFromLastMonth: "↗︎ 12% kutoka mwezi uliopita",
    decreaseFromLastMonth: "↘︎ 5% kutoka mwezi uliopita",
    topSellingProducts: "Bidhaa Zinazouzwa Zaidi",
    viewAll: "Angalia Zote",
    product1: "Vipokezi sauti bila waya Pro",
    product2: "Chaja ya Haraka ya USB-C",
    product3: "Kiguzo cha Laptopsi cha Ergonomic",
    sold126: "126 ziliuzwa",
    sold89: "89 ziliuzwa",
    sold54: "54 ziliuzwa",
    lowStockAlert: "Tahadhari ya Hisa Chache",
    itemsNeedReordering: "Bidhaa 5 zinahitaji kuagizwa tena",
    liveUpdate: "Sasisho la moja kwa moja",
    nextRestock: "Usajili ujao: siku 3",

    // Stats
    statUptime: "Muda wa Uendeshaji wa Mfumo",
    statBusinesses: "Biashara Zinaiamini",
    statCostReduction: "Kiwango cha Kupunguzwa kwa Gharama",
    statTimeSaved: "Muda uliohifadhiwa Kila Wiki",

    activeUsers: 'Watumiaji Wanatumia',
    uptime: 'Muda wa Kazi',
    support: 'Usaidizi',

    // Features
    powerfulFeatures: "VIPANDE VYEUSE",
    featuresTitle1: "Kila Unachohitaji kwa",
    featuresTitle2: "Usimamizi wa Kisasa wa Hisa",
    featuresDescription: "Kutoka utabiri unaotumia akili bandia hadi ushirikiano wa wakati halisi, jukwaa letu linatoa kila unachohitaji ili kuboresha shughuli zako za hisa.",

    // Feature details
    featureRealTimeAnalytics: "Uchambuzi wa Wakati Halisi",
    featureRealTimeAnalyticsDesc: "Fuatilia viwango vya hisa, mienendo ya mauzo, na mauzo ya hisa na dashibodi za moja kwa moja.",
    featureRealTimeAnalyticsStat: "+89% ufanisi",
    featureCloudPlatform: "Jukwaa la Wingu",
    featureCloudPlatformDesc: "Pata hisa zako kutoka popote, kwenye kifaa chochote. Uunganishaji wa wakati halisi.",
    featureCloudPlatformStat: "Upatikanaji popote",
    featureEnterpriseSecurity: "Usalama wa Biashara",
    featureEnterpriseSecurityDesc: "Usalama wa kiwango cha benki na dhamana ya muda wa uendeshaji 99.9% na nakala rudufu zilizozimatiwa.",
    featureEnterpriseSecurityStat: "99.9% muda wa uendeshaji",
    featureSmartAutomation: "Uanzishaji wa Akili Bandia",
    featureSmartAutomationDesc: "Vipengele vya kuagiza tena vinavyotumia akili bandia na usimamizi wa utabiri wa hisa.",
    featureSmartAutomationStat: "Muda wa 40% umehifadhiwa",
    featureTeamCollaboration: "Ushirikiano wa Timu",
    featureTeamCollaborationDesc: "Ruhusa zinazotegemea majukumu na zana za ushirikiano wa timu wa wakati halisi.",
    featureTeamCollaborationStat: "Watumiaji wasio na kikomo",
    featureBarcodeSystem: "Mfumo wa Msimbo Mchoro",
    featureBarcodeSystemDesc: "Uchanganuzi wa msimbo mchoro wa rununu na uwezo wa kuunganishwa kwa RFID.",
    featureBarcodeSystemStat: "Hesabu 5x kwa kasi",

    // Pricing
    simplePricing: "UANZISHAJI WA BEPARI RAHISI",
    chooseYourPlan: "Chagua Mpango Wako Kamili",
    pricingDescription: "Mipango yote inajumuisha jaribio la bure la siku 14. Hakuna kadi ya mkopo inayotakiwa kuanza.",
    planStarter: "Mwanzo",
    planStarterDesc: "Kamili kwa biashara ndogo",
    planProfessional: "Kitaaluma",
    planProfessionalDesc: "Kwa biashara zinazokua",
    planEnterprise: "Biashara Kubwa",
    planEnterpriseDesc: "Kwa mashirika makubwa",
    perMonth: "/mwezi",
    customPrice: "Maalum",
    tailored: "/iliyobinafsishwa",
    mostPopular: "Inayopendwa Zaidi",

    // Plan features
    featureUpTo500Products: "Hadi bidhaa 500",
    feature2UserAccounts: "Akaunti 2 za watumiaji",
    featureBasicReporting: "Ripoti za msingi",
    featureEmailSupport: "Msaada wa barua pepe",
    featureMobileAppAccess: "Ufikiaji wa programu ya rununu",
    featureBarcodeScanning: "Uchanganuzi wa msimbo mchoro",
    featureAPIAccess: "Ufikiaji wa API",
    featureUpTo5000Products: "Hadi bidhaa 5,000",
    feature10UserAccounts: "Akaunti 10 za watumiaji",
    featureAdvancedAnalytics: "Uchambuzi wa hali ya juu",
    featurePrioritySupport: "Msaada wa kipaumbele",
    featureCustomReports: "Ripoti zilizobinafsishwa",
    featureUnlimitedProducts: "Bidhaa zisizo na kikomo",
    featureUnlimitedUsers: "Watumiaji wasio na kikomo",
    featureCustomReporting: "Utoaji taarifa uliobinafsishwa",
    feature247PhoneSupport: "Msaada wa simu 24/7",
    featureCustomIntegrations: "Ujumuishaji uliobinafsishwa",
    featureDedicatedAccountManager: "Msimamizi wa akaunti aliyeteuliwa",
    featureOnPremiseDeployment: "Usakinishaji wa ndani ya jengo",

    needCustomSolution: "Unahitaji suluhisho maalum?",
    contactSalesTeam: "Wasiliana na timu yetu ya mauzo →",

    // Testimonials
    trustedByIndustryLeaders: "INAAMINIKA NA VIONGOZI WA SEKTA",
    lovedByBusinesses: "Inapendwa na Maelfu ya Biashara",
    testimonialRole1: "Mkurugenzi wa Uendeshaji",
    testimonialRole2: "Meneja wa Hisa",
    testimonialRole3: "Mkurugenzi Mtendaji",
    testimonialText1: "StockMaster ilipunguza gharama zetu za hisa kwa 40% na kuokoa zaidi ya masaa 15 kila wiki kwa ufuatiliaji wa mkono. Uchambuzi wa utabiri ni sahihi sana.",
    testimonialText2: "Tahadhari za wakati halisi zilizuia ukosefu wa hisa wakati wa msimu wa kilele. Usahihi wetu wa utekelezaji uliboreshwa kutoka 92% hadi 99.7% katika miezi 3 tu.",
    testimonialText3: "Kiolesura cha kuvutia chenye utoaji taarifa wenye nguvu. Timu yetu iliikubali kwa siku moja na usahihi wa hisa zetu sasa ni 99.9%.",
    verifiedCustomer: "Mteja aliethibitishwa",
    monthsUsingStockMaster: "Miezi 6 ikitumia StockMaster",

    // CTA
    freeTrialNoCreditCard: "JARIBIO LA BURE LA SIKU 14 • HAKUNA KADI YA MKOPO INAYOTAKIWA",
    ctaTitle1: "Tayari Kubadilisha",
    ctaTitle2: "Usimamizi Wako wa Hisa?",
    ctaDescription: "Jiunge na biashara 2,500+ ambazo zimerahisisha shughuli zao, kupunguza gharama, na kuondoa ukosefu wa hisa na StockMaster.",
    enterWorkEmail: "Weka barua pepe yako ya kazi",
    thankYou: "Asante!",
    instantAccess: "Pata ufikiaji wa haraka. Hakuna ada ya usanidi. Ghairi wakati wowote.",
    bankLevelSecurity: "Usalama wa Kiwango cha Benki",
    freeUpdates: "Sasisho za Bure",
    support247: "Msaada 24/7",
    dataOwnership: "Umiliki wa Data",

    // Footer
    powerfulInventoryManagement: "Usimamizi wenye nguvu wa hisa",
    footerDescription: "Kuwawezesha biashara ulimwenguni kote na suluhisho za hisa zenye akili. Rahisisha shughuli, punguza gharama, na kua kwa ujasiri.",
    product: "Bidhaa",
    features: "Vipengele",
    pricing: "Bei",
    api: "API",
    documentation: "Nyaraka",
    changelog: "Logi ya mabadiliko",
    status: "Hali",
    company: "Kampuni",
    aboutUs: "Kuhusu Sisi",
    careers: "Kazi",
    blog: "Blogu",
    press: "Vyombo vya habari",
    partners: "Washirika",
    contact: "Wasiliana",
    resources: "Rasilimali",
    helpCenter: "Kituo cha Usaidizi",
    community: "Jamii",
    tutorials: "Mafunzo",
    webinars: "Semina za wavuti",
    templates: "Vigezo",
    caseStudies: "Masomo ya Kesi",
    allRightsReserved: "Haki zote zimehifadhiwa.",
    privacyPolicy: "Sera ya Faragha",
    termsOfService: "Masharti ya Huduma",
    cookiePolicy: "Sera ya Kuki",
    gdprCompliance: "Kufuata GDPR",

    orders: 'Maagizo',
    products: 'Bidhaa',
    users: 'Watumiaji',
    logout: 'Toka',
    welcome: 'Karibu',
    dashboardSummary: 'Muhtasari wa Dashibodi',
    addProductDesc: 'Ongeza bidhaa mpya ya hisa',
    createOrderDesc: 'Chakata mauzo mapya',
    generateReportDesc: 'Toa data ya mauzo',
    manageUsersDesc: 'Ruhusa za watumiaji',
    item: 'kitu',
    items: 'vitu',
    sold: 'iliyouzwa',
    totalRevenueFromSales: 'Mapato jumla kutokana na mauzo',
    recentActivity: 'Shughuli za Hivi Karibuni',
    version: 'Toleo',
    refreshing: 'Inasasisha data...',
      // Common
    dashboard: "Dashibodi",
    orders: "Maagizo",
    products: "Bidhaa",
    users: "Watumiaji",
    help: "Usaidizi & Msaada",
    logout: "Toka",
    welcome: "Karibu",
    refresh: "Sasisha",
    allRightsReserved: "Haki zote zimehifadhiwa",
    version: "Toleo",
    inventoryManagementSystem: "Mfumo wa Usimamizi wa Hesabu",
    
    // Help Center specific
    helpCenter: "Kituo cha Usaidizi",
    helpSupport: "Kituo cha Usaidizi na Msaada",
    getHelpDescription: "Pata usaidizi, wasiliana na timu yetu, au tazama hati zetu",
    howCanWeHelp: "Tunaweza kukusaidia vipi leo?",
    supportDescription: "Timu yetu ya usaidizi iko hapa kukusaidia na maswali yoyote au matatizo.",
    
    // Support categories
    liveChat: "Usaidizi wa Mazungumzo ya Moja kwa Moja",
    liveChatDesc: "Zungumza na timu yetu ya usaidizi kwa wakati halisi",
    phoneSupport: "Usaidizi wa Simu",
    phoneSupportDesc: "Tuite kwa usaidizi wa haraka",
    emailSupport: "Usaidizi wa Barua Pepe",
    emailSupportDesc: "Tutumie barua pepe na tutajibu ndani ya masaa 24",
    knowledgeBase: "Msingi wa Maarifa",
    knowledgeBaseDesc: "Vinjari hati zetu na mafunzo",
    
    // Availability
    available24_7: "Inapatikana saa 24/7",
    businessHours: "Masaa ya Biashara",
    response24h: "Majibu ndani ya masaa 24",
    alwaysAvailable: "Daima Inapatikana",
    
    // Contact info
    contactInformation: "Taarifa za Mawasiliano",
    phone: "Simu",
    email: "Barua Pepe",
    location: "Eneo",
    callForSupport: "Tuite kwa usaidizi wa haraka",
    emailForSupport: "Tutumie barua pepe kwa maswali ya kina",
    physicalAddress: "Eneo la ofisi yetu halisi",
    workingHours: "Masaa ya Kazi",
    website: "Tovuti",
    
    // FAQ
    frequentlyAskedQuestions: "Maswali Yanayoulizwa Mara Kwa Mara",
    faqHowToAddProduct: "Ninawezaje kuongeza bidhaa mpya?",
    faqHowToAddProductAnswer: "Nenda kwenye sehemu ya Bidhaa, bofya kitufe cha 'Ongeza Bidhaa Mpya', jaza maelezo ya bidhaa, na uhifadhi.",
    faqTrackOrders: "Ninawezaje kufuatilia maagizo yangu?",
    faqTrackOrdersAnswer: "Nenda kwenye sehemu ya Maagizo ambapo unaweza kutazama maagizo yote na hali yao ya sasa.",
    faqResetPassword: "Ninawezaje kuweka upya nenosiri langu?",
    faqResetPasswordAnswer: "Bofya kwenye wasifu wako, chagua 'Mipangilio', kisha 'Badilisha Nenosiri'. Utapokea barua pepe yenye maagizo.",
    faqGenerateReport: "Jinsi ya kutengeneza ripoti za hesabu?",
    faqGenerateReportAnswer: "Nenda kwenye sehemu ya Ripoti, chagua aina ya ripoti na kipindi cha tarehe, kisha bofya 'Tengeneza Ripoti'.",
    
    // Call to action
    stillHaveQuestions: "Bado una maswali? Tuko hapa kukusaidia!",
    callNow: "Piga Sasa",
    sendEmail: "Tuma Barua Pepe",
    supportAvailable: "Usaidizi unapatikana",

     // Dashboard
    dashboard: 'Dashibodi',
    welcome: 'Karibu',
    welcomeBack: 'Karibu Tena',
    dashboardSummary: 'Muhtasari wa Dashibodi',
    dashboardSummaryMessage: 'Hapa ndio kinachotokea kwenye duka lako leo.',
    refresh: 'Sasisha',
    refreshing: 'Inasasisha data...',
    date: 'Tarehe',
    
    // Navigation
    orders: 'Maagizo',
    products: 'Bidhaa',
    users: 'Watumiaji',
    help: 'Usaidizi & Msaada',
    logout: 'Ondoka',
    
    // Stats
    totalSales: 'Mauzo ya Jumla',
    totalPurchases: 'Manunuzi ya Jumla',
    totalProducts: 'Jumla ya Bidhaa',
    totalOrders: 'Jumla ya Maagizo',
    
    // Products
    soldProducts: 'Bidhaa Zilizouzwa',
    managedBy: 'Imesimamiwa na',
    pricePerUnit: 'Bei kwa kitengo',
    itemsSold: 'Vitu vilivyouzwa',
    total: 'Jumla',
    totalRevenueFromSales: 'Mapato ya jumla kutoka kwa mauzo',
    item: 'kipengee',
    items: 'vipengee',
    sold: 'iliyouzwa',
    
    // Months
    january: 'Januari',
    february: 'Februari',
    march: 'Machi',
    april: 'Aprili',
    may: 'Mei',
    june: 'Juni',
    july: 'Julai',
    august: 'Agosti',
    september: 'Septemba',
    october: 'Oktoba',
    november: 'Novemba',
    december: 'Desemba',
    
    // System
    inventoryManagementSystem: 'Mfumo wa Usimamizi wa Hesabu',
    allRightsReserved: 'Haki zote zimehifadhiwa',
    version: 'Toleo',
    lastUpdated: 'Ilisasishwa mwisho',
    
    // User roles
    administrator: 'Msimamizi',
    storekeeper: 'Mhifadhi',
    shopkeeper: 'Mfanyabiashara',
    user: 'Mtumiaji',
    admin: 'Msimamizi',
    
    // Recent Activity
    recentActivity: 'Shughuli za Hivi Karibuni',
    newOrderPlaced: 'Agizo jipya limewekwa',
    productRestocked: 'Bidhaa imejazwa tena',
    lowStockAlert: 'Onyo la hisa ndogo',
    minutesAgo: 'Dakika {{count}} zilizopita',
    hourAgo: 'Saa {{count}} iliyopita',
    hoursAgo: 'Saa {{count}} zilizopita',
      // Navigation & Menu
  dashboard: "Dashibodi",
  orders: "Maagizo",
  inventory: "Hifadhi",
  products: "Bidhaa",
  sales: "Mauzo",
  customers: "Wateja",
  help: "Msaada na Usaidizi",
  settings: "Mipangilio",
  logout: "Toka",
  
  // Dashboard Content
  shopkeeperDashboard: "Dashibodi ya Duka",
  welcome: "Karibu",
  welcomeBack: "Karibu Tena",
  shopManagementSystem: "Mfumo wa Usimamizi wa Duka",
  allRightsReserved: "Haki zote zimehifadhiwa",
  contact: "Wasiliana",
  todayRevenue: "Mapato ya Leo",
  
  // Stats
  todaySales: "Mauzo ya Leo",
  totalOrders: "Jumla ya Maagizo",
  activeProducts: "Bidhaa Zinazotumika",
  customerSatisfaction: "Uridhisho wa Wateja",
  
  // Sections
  recentSales: "Mauzo ya Hivi Karibuni",
  topProducts: "Bidhaa Bora",
  lowStockAlert: "Tahadhari ya Hifadhi Ndogo",
  notifications: "Arifa",
  quickActions: "Vitendo vya Haraka",
  
  // Actions
  refresh: "Sasisha",
  viewAll: "Tazama Zote",
  restockNow: "Jaza Hifadhi Sasa",
  newOrder: "Agizo Jipya",
  addProduct: "Ongeza Bidhaa",
  recordSale: "Rekodi Mauzo",
  addCustomer: "Ongeza Mteja",
  
  // Status & Labels
  date: "Tarehe",
  dashboardSummary: "Muhtasari wa Dashibodi",
  shopSummary: "Muhtasari wa Duka",
  monthlyRevenue: "Mapato ya Mwezi",
  activeCustomers: "Wateja Wanatumia",
  monthlyGrowth: "Ukuaji wa Mwezi",
  managedBy: "Inasimamiwa na",
  itemsSold: "Vitu Iliyouzwa",
  total: "Jumla",
  totalRevenueFromSales: "Jumla ya mapato kutoka kwa mauzo",
  
  // Tabs
  overview: "Muhtasari",
  analytics: "Uchambuzi",
  inventory: "Hifadhi",
  customers: "Wateja",
  
  // Order Status
  completed: "Imekamilika",
  processing: "Inachakatwa",
  pending: "Inasubiri",
  
  // Payment Methods
  cash: "Fedha Taslimu",
  mobileMoney: "M-Pesa",
  creditCard: "Kadi ya Mkopo",
  bankTransfer: "Uhamisho wa Benki",
  
  // General
  version: "Toleo",
  lastUpdated: "Imesasishwa mwisho",
  user: "Mtumiaji",
  items: "vitu",
  item: "kitu",
  sold: "iliyouzwa",
  pricePerUnit: "Bei kwa kila kipimo",
  onlyLeft: "Imebaki {count} tu",
  min: "Kiwango cha chini",
  category: "Kategoria",
  
  // Time
  january: "Januari",
  february: "Februari",
  march: "Machi",
  april: "Aprili",
  may: "Mei",
  june: "Juni",
  july: "Julai",
  august: "Agosti",
  september: "Septemba",
  october: "Oktoba",
  november: "Novemba",
  december: "Desemba",
  
  // Messages
  dashboardSummaryMessage: "Hapa ndio kinachotokea katika duka lako leo.",
  refreshing: "Inasasisha data...",
  newOrderReceived: "Agizo jipya limepokelewa kutoka kwa Mteja #{id}",
  lowStockAlertMessage: "Tahadhari ya hifadhi ndogo: {product} (Imebaki {count} tu)",
  paymentReceived: "Malipo yamepokelewa kwa Ajili ya Agizo #{id}",
  
  // Shop Info
  techGadgetsStore: "Duka la Vifaa vya Teknolojia",
  marketStreet: "Barabara ya Soko 123, Kituo cha Jiji",
  
  // Tooltips
  toggleSidebar: "Badilisha upau wa kando",
  markAsRead: "Weka alama kama imesomwa",
  
  // Placeholders
  searchProducts: "Tafuta bidhaa...",
  filterByCategory: "Chuja kwa kategoria",
  selectCustomer: "Chagua mteja",
  enterAmount: "Ingiza kiasi",
  
  // Validation
  required: "Inahitajika",
  invalidEmail: "Barua pepe batili",
  minAmount: "Kiwango cha chini ni {amount}",
  
  // Success Messages
  orderCreated: "Agizo limeundwa kikamilifu",
  productAdded: "Bidhaa imeongezwa kikamilifu",
  saleRecorded: "Mauzo yamerekodiwa kikamilifu",
  customerAdded: "Mteja ameongezwa kikamilifu",
  
  // Error Messages
  somethingWentWrong: "Kitu kimeharibika",
  insufficientStock: "Hifadhi haitoshi",
  connectionError: "Hitilafu ya muunganisho",
  
  // Empty States
  noOrders: "Bado hakuna maagizo",
  noProducts: "Hakuna bidhaa zilizopatikana",
  noCustomers: "Bado hakuna wateja",
  noNotifications: "Hakuna arifa",
  
  // Categories
  audio: "Sauti",
  wearables: "Vilivyovaliwa",
  accessories: "Vifaa vya Nyongeza",
  electronics: "Vifaa vya Umeme",
  gadgets: "Vifaa vya Kiteknolojia",
  
  // Units
  piece: "pcs",
  box: "boksi",
  pack: "pakiti",
  kg: "kg",
  liter: "L",
  }
};

// Create Context
const TranslationContext = createContext();

// Translation Provider Component
export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translation
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

// Export the translations for use in other components if needed
export { translations };