// Navbar.jsx
import React, { useState, useEffect, useCallback } from "react";
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
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });
  const navigate = useNavigate();

  // Memoized function to check auth status and load user data
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    const userDataSession = sessionStorage.getItem("user");

    // Check both localStorage and sessionStorage
    const userDataString = userData || userDataSession;

    if (token && userDataString) {
      try {
        const parsedUser = JSON.parse(userDataString);
        setIsLoggedIn(true);
        setUserInfo(parsedUser);
        
        // Update localStorage with latest user data if from sessionStorage
        if (!userData && userDataSession) {
          localStorage.setItem("user", userDataSession);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }, []);

  // Initial auth check and setup listeners
  useEffect(() => {
    // Initial check
    checkAuthStatus();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "authToken" || e.key === "user" || e.key === null) {
        checkAuthStatus();
      }
    };

    // Custom event for auth changes within the same tab
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("userUpdate", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("userUpdate", handleAuthChange);
    };
  }, [checkAuthStatus]);

  // Language change handler with persistence
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    setShowLanguageDropdown(false);
  }, []);

  // Logout handler with cleanup
  const handleLogout = useCallback(() => {
    // Clear all storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");

    // Reset state
    setIsLoggedIn(false);
    setUserInfo(null);
    setShowUserDropdown(false);
    setShowMobileMenu(false);

    // Dispatch event for other components
    window.dispatchEvent(new Event("authChange"));
    
    // Navigate to login
    navigate("/login");
  }, [navigate]);

  // Role-based dashboard link
  const getDashboardLink = useCallback(() => {
    if (!userInfo?.role) return "/";
    
    const roleMap = {
      owner: "/owner-dashboard",
      shopkeeper: "/shopkeeper-dashboard",
      admin: "/admin-dashboard",
    };
    
    return roleMap[userInfo.role] || "/";
  }, [userInfo?.role]);

  // Get navigation links based on auth state
  const getNavLinks = useCallback(() => {
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
  }, [isLoggedIn, getDashboardLink]);

  // Helper functions for user display with safe access
  const getUserInitials = useCallback(() => {
    if (!userInfo) return "U";
    
    const firstName = userInfo.firstName || "";
    const lastName = userInfo.lastName || "";
    const email = userInfo.email || "";
    
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return "U";
  }, [userInfo]);

  const getUserFullName = useCallback(() => {
    if (!userInfo) return "User";
    
    const firstName = userInfo.firstName || "";
    const lastName = userInfo.lastName || "";
    const email = userInfo.email || "";
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    if (firstName) {
      return firstName;
    }
    
    if (email) {
      return email.split("@")[0];
    }
    
    return "User";
  }, [userInfo]);

  const getUserDisplayName = useCallback(() => {
    if (!userInfo) return "Guest";
    
    const fullName = getUserFullName();
    const role = userInfo.role || "";
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
    
    return `${fullName} (${displayRole})`;
  }, [userInfo, getUserFullName]);

  // Get mobile links
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

              <img 
                src={logo} 
                alt="Logo" 
                className="h-10 w-10 rounded object-cover" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

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
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => handleLanguageChange("sw")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
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
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
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
                      <div className="px-4 py-3 border-b bg-gray-50">
                        <p className="font-semibold text-gray-800">
                          {getUserFullName()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {userInfo?.email || "No email"}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1 capitalize">
                          Role: {userInfo?.role || "User"}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <FiUser size={16} />
                        <span>Profile</span>
                      </Link>

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
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors border-t"
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
              
              {/* Mobile user info */}
              {isLoggedIn && userInfo && (
                <div className="px-4 py-3 border-t border-blue-500 mt-2">
                  <p className="font-semibold">{getUserFullName()}</p>
                  <p className="text-sm text-blue-300 capitalize">
                    Role: {userInfo.role || "User"}
                  </p>
                </div>
              )}
              
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