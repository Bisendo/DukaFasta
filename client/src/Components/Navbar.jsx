// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  FiHome,
  FiShoppingCart,
  FiBarChart2,
  FiSettings,
  FiGlobe,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiBell,
  FiMenu,
  FiX,
} from "react-icons/fi";

function Navbar() {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  // Check authentication properly
  useEffect(() => {
    checkAuthStatus();

    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (token) {
      setIsLoggedIn(true);
      if (userData) {
        try {
          setUserInfo(JSON.parse(userData));
        } catch {
          setUserInfo(null);
        }
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");

    setIsLoggedIn(false);
    setUserInfo(null);

    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  // Role-based dashboard link
  const getDashboardLink = () => {
    if (userInfo?.role === "owner") return "/owner-dashboard";
    if (userInfo?.role === "shopkeeper") return "/shopkeeper-dashboard";
    return "/";
  };

  const getNavLinks = () => {
    if (isLoggedIn) {
      return [
        { id: "home", to: "/", icon: <FiHome />, text: "Home" },
        { id: "about", to: "/Aboutus", icon: <FiShoppingCart />, text: "About Us" },
        { id: "dashboard", to: getDashboardLink(), icon: <FiBarChart2 />, text: "Dashboard" },
        { id: "settings", to: "/settings", icon: <FiSettings />, text: "Settings" },
      ];
    }

    return [
      { id: "home", to: "/", icon: <FiHome />, text: "Home" },
      { id: "about", to: "/Aboutus", icon: <FiShoppingCart />, text: "About Us" },
      { id: "signup", to: "/register", icon: <FiBarChart2 />, text: "Signup" },
    ];
  };

  const getUserInitials = () => {
    if (!userInfo?.firstName && !userInfo?.lastName) return "U";
    const firstName = userInfo?.firstName || "";
    const lastName = userInfo?.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "U";
  };

  const getUserFullName = () => {
    if (!userInfo?.firstName && !userInfo?.lastName) return "User";
    return `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`.trim() || "User";
  };

  // Mobile menu links
  const mobileLinks = getNavLinks();

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle menu"
              >
                {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>

              <img src={logo} alt="Logo" className="h-10 w-10 rounded object-cover" />

              <Link to="/" className="text-2xl font-bold">
                DukaFasta
              </Link>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-3">
              {getNavLinks().map((link) => (
                <Link
                  key={link.id}
                  to={link.to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {link.icon}
                  <span>{link.text}</span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Change language"
                >
                  <FiGlobe size={20} />
                  <span className="hidden sm:inline uppercase">{language}</span>
                </button>

                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => handleLanguageChange("sw")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      🇹🇿 Swahili
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications */}
              {isLoggedIn && (
                <button 
                  className="relative p-2 rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Notifications"
                >
                  <FiBell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              )}

              {/* User Menu */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="h-8 w-8 bg-blue-400 rounded-full flex items-center justify-center font-semibold text-white">
                      {getUserInitials()}
                    </div>
                    <FiChevronDown size={16} />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-lg shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b">
                        <p className="font-semibold text-gray-800">
                          {getUserFullName()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {userInfo?.email || "No email"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 capitalize">
                          Role: {userInfo?.role || "User"}
                        </p>
                      </div>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <FiSettings size={16} />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-blue-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-2">
              {mobileLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.to}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.icon}
                  <span>{link.text}</span>
                </Link>
              ))}
              
              {/* Mobile logout button if logged in */}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors text-red-300 hover:text-red-200"
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;