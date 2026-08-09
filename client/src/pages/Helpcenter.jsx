import React, { useState } from "react";
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiPhone,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiClock,
  FiGlobe,
  FiExternalLink
} from "react-icons/fi";
import { useTranslation } from "../Context/TranslationContext";
import { useLocation, useNavigate } from "react-router-dom";

const HelpCenter = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Menu Items
  const menuItems = [
    {
      icon: <FiHome />,
      text: t('dashboard') || 'Dashboard',
      path: '/owner-dashboard',
      active: location.pathname === '/owner-dashboard'
    },
    {
      icon: <FiShoppingCart />,
      text: t('sales') || 'Sales',
      path: '/sales',
      active: location.pathname === '/sales'
    },
    {
      icon: <FiBox />,
      text: t('products') || 'Products',
      path: '/products',
      active: location.pathname === '/products'
    },
    {
      icon: <FiUsers />,
      text: t('users') || 'Users',
      path: '/users',
      active: location.pathname === '/users'
    },
    {
      icon: <FiHelpCircle />,
      text: t('help') || 'Help & Support',
      path: '/help',
      active: location.pathname === '/help'
    },
    {
      icon: <FiLogOut />,
      text: t('logout') || 'Logout',
      path: '/logout',
      active: location.pathname === '/logout'
    },
  ];

  // Contact Information
  const contactInfo = {
    phone: "+255 621 690 364",
    email: "group2@gmail.com",
    location: "Dar Es Salaam, Tanzania",
    workingHours: "Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM",
    website: "https://invertory-management-system.vercel.app/"
  };

  // Frequently Asked Questions
  const faqs = [
    {
      question: t('faqHowToAddProduct') || "How do I add a new product?",
      answer: t('faqHowToAddProductAnswer') || "Go to Products section, click 'Add New Product' button, fill in the product details, and save."
    },
    {
      question: t('faqTrackSales') || "How can I track my sales?",
      answer: t('faqTracksalesAnswer') || "Navigate to Sales section where you can view all sales and their current status."
    },
    {
      question: t('faqResetPassword') || "How do I reset my password?",
      answer: t('faqResetPasswordAnswer') || "Click on your profile, select 'Settings', then 'Change Password'. You'll receive an email with instructions."
    },
    {
      question: t('faqGenerateReport') || "How to generate inventory reports?",
      answer: t('faqGenerateReportAnswer') || "Go to Reports section, select report type and date range, then click 'Generate Report'."
    }
  ];

  // Support Categories
  const supportCategories = [
    {
      icon: <FiMessageSquare />,
      title: t('liveChat') || "Live Chat Support",
      description: t('liveChatDesc') || "Chat with our support team in real-time",
      availability: t('available24_7') || "24/7 Available"
    },
    {
      icon: <FiPhone />,
      title: t('phoneSupport') || "Phone Support",
      description: t('phoneSupportDesc') || "Call us for immediate assistance",
      availability: t('businessHours') || "Business Hours"
    },
    {
      icon: <FiMail />,
      title: t('emailSupport') || "Email Support",
      description: t('emailSupportDesc') || "Send us an email and we'll respond within 24 hours",
      availability: t('response24h') || "Response within 24h"
    },
    {
      icon: <FiGlobe />,
      title: t('knowledgeBase') || "Knowledge Base",
      description: t('knowledgeBaseDesc') || "Browse our documentation and tutorials",
      availability: t('alwaysAvailable') || "Always Available"
    }
  ];

  const handleNavigation = (path) => {
    if (path === '/logout') {
      // Handle logout logic
      console.log('Logging out...');
      navigate('/login');
    } else {
      navigate(path);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:translate-x-0
        `}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('helpCenter') || 'Help Center'}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg"
            >
              <FiX size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200
                  ${item.active 
                    ? 'bg-blue-700 text-white' 
                    : 'hover:bg-blue-700 hover:bg-opacity-50 text-blue-100'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center text-blue-200 text-sm">
              <p>IMS v2.0</p>
              <p className="text-xs mt-1">© 2024 {t('inventoryManagementSystem') || 'Inventory Management System'}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-h-screen overflow-x-hidden">
          {/* Top Bar */}
          <header className="bg-white shadow px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{t('helpSupport') || 'Help & Support Center'}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t('getHelpDescription') || 'Get help, contact support, or browse our documentation'}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('welcome') || 'Welcome'},</p>
                <p className="font-semibold text-gray-800">Admin</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4 sm:p-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                {t('howCanWeHelp') || 'How can we help you today?'}
              </h2>
              <p className="text-blue-100">
                {t('supportDescription') || 'Our support team is here to assist you with any questions or issues.'}
              </p>
            </div>

            {/* Support Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {supportCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="text-blue-600 text-2xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="text-xs text-gray-500 flex items-center">
                    <FiClock className="mr-1" size={12} />
                    {category.availability}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Information - Simple and Clean */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {t('contactInformation') || 'Contact Information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Phone */}
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FiPhone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{t('phone') || 'Phone'}</h3>
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="text-blue-600 hover:text-blue-800 text-lg font-medium"
                    >
                      {contactInfo.phone}
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      {t('callForSupport') || 'Call us for immediate support'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FiMail className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{t('email') || 'Email'}</h3>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-green-600 hover:text-green-800 text-lg font-medium break-all"
                    >
                      {contactInfo.email}
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      {t('emailForSupport') || 'Email us for detailed inquiries'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FiMapPin className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{t('location') || 'Location'}</h3>
                    <p className="text-purple-600 text-lg font-medium">
                      {contactInfo.location}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {t('physicalAddress') || 'Our physical office location'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{t('workingHours') || 'Working Hours'}</h4>
                  <p className="text-gray-600 whitespace-pre-line">{contactInfo.workingHours}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{t('website') || 'Website'}</h4>
                  <a 
                    href={`https://${contactInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {contactInfo.website}
                    <FiExternalLink className="ml-2" size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {t('frequentlyAskedQuestions') || 'Frequently Asked Questions'}
              </h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Q: {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      A: {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-700 mb-3">
                  {t('stillHaveQuestions') || 'Still have questions? We\'re here to help!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiPhone className="mr-2" />
                    {t('callNow') || 'Call Now'}
                  </a>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiMail className="mr-2" />
                    {t('sendEmail') || 'Send Email'}
                  </a>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-center sm:text-left">
              <div className="text-gray-600 text-sm mb-2 sm:mb-0">
                © 2024 {t('inventoryManagementSystem') || 'Inventory Management System'}. {t('allRightsReserved') || 'All rights reserved'}.
              </div>
              <div className="text-xs text-gray-500">
                <span>{t('supportAvailable') || 'Support available'} 24/7</span>
                <span className="mx-2">•</span>
                <span>{t('version') || 'Version'} 2.0.1</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;