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
  const navigate = useNavigate();

  // ✅ Check authentication properly
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
    const userData = localStorage.getItem("userData");

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
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");

    setIsLoggedIn(false);
    setUserInfo(null);

    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  // ✅ Role-based dashboard link
  const getDashboardLink = () => {
    if (userInfo?.role === "owner") return "/owner-dashboard";
    if (userInfo?.role === "shopkeeper") return "/shopkeeper-dashboard";
    return "/";
  };

  const getNavLinks = () => {
    const baseLinks = [
      { to: "/", icon: <FiHome />, text: ("Home") },
      { to: "/Aboutus", icon: <FiShoppingCart />, text: ("About Us") },
    ];

    if (isLoggedIn) {
      return [
        ...baseLinks,
        { to: getDashboardLink(), icon: <FiBarChart2 />, text: ("Dashboard") },
        { to: "/settings", icon: <FiSettings />, text: ("Settings") },
      ];
    }

    return [
      ...baseLinks,
      { to: "/register", icon: <FiBarChart2 />, text: ("Signup") },
    ];
  };

  const getUserInitials = () => {
    if (!userInfo?.name) return "U";
    return userInfo.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };


  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-blue-700"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>

              <img src={logo} alt="Logo" className="h-10 w-10 rounded" />

              <Link to="/" className="text-2xl font-bold">
                DukaFasta
              </Link>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-3">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {link.icon}
                  <span>{link.text}</span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">

              {isLoggedIn && (
                <button className="relative p-2 rounded-full hover:bg-blue-700">
                  <FiBell />
                </button>
              )}

              {/* User */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-8 w-8 bg-blue-400 rounded-full flex items-center justify-center">
                      {getUserInitials()}
                    </div>
                    <FiChevronDown />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow">
                      <div className="px-4 py-2 border-b">
                        <p className="font-semibold">{userInfo?.name}</p>
                        <p className="text-sm text-gray-500">{userInfo?.email}</p>
                      </div>

                      <Link
                        to="/settings"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {("settings")}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        {("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg"
                >
                  {("login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
