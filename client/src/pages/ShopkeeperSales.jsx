import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiTrendingUp,
  FiAlertCircle,
  FiShoppingBag,
  FiCheck,
  FiTrash2,
  FiEdit,
  FiEye,
  FiBarChart2,
  FiTrendingDown,
  FiClock,
  FiFileText,
  FiDownload,
  FiPrinter,
  FiChevronDown,
  FiChevronUp,
  FiPercent
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from 'date-fns';

// Configure Axios base URL
const API_BASE_URL = "http://localhost:4001";
axios.defaults.baseURL = API_BASE_URL;

const ShopkeeperSales = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [authError, setAuthError] = useState("");
  const [saleStats, setSaleStats] = useState({
    today: { amount: 0, transactions: 0 },
    yesterday: { amount: 0, transactions: 0 },
    week: { amount: 0, transactions: 0 },
    total: { amount: 0, transactions: 0 }
  });
  const [expandedSaleId, setExpandedSaleId] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data and sales on component mount
  useEffect(() => {
    // Set current date
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    // Check authentication and load user data
    const loadUserDataAndSales = async () => {
      try {
        // Check for access token first
        const accessToken = localStorage.getItem("accessToken");
        
        if (!accessToken) {
          console.log("No access token found, redirecting to login");
          navigate("/login");
          return;
        }

        // Try to get user data from localStorage
        let user = null;
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            user = JSON.parse(savedUser);
          } catch (error) {
            console.error("Error parsing user JSON:", error);
          }
        }
        
        // If no user in localStorage, use token data
        if (!user) {
          user = {
            id: localStorage.getItem("userId") || 1,
            email: localStorage.getItem("email") || "user@example.com",
            userType: localStorage.getItem("userType") || "shopkeeper",
            firstName: localStorage.getItem("firstName") || "",
            lastName: localStorage.getItem("lastName") || "",
            accessToken
          };
        }
        
        console.log("User data loaded:", user);
        
        // Set authorization headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        axios.defaults.headers.common['accessToken'] = accessToken;
        
        setUserData(user);
        
        // Load sales and stats
        await Promise.all([
          loadSales(),
          loadSaleStats()
        ]);
        
      } catch (error) {
        console.error("Error loading data:", error);
        setAuthError("Failed to load data. Please login again.");
        clearUserData();
        navigate("/login");
      }
    };

    loadUserDataAndSales();
  }, [navigate]);

  const clearUserData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    localStorage.removeItem("userType");
    setUserData(null);
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['accessToken'];
  };

  // Load sales from API
  const loadSales = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        throw new Error("No access token found");
      }
      
      const response = await axios.get("/sales/shopkeeper", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accessToken': accessToken
        }
      });
      
      console.log("Sales response:", response.data);
      
      if (response.data && response.data.success) {
        setSales(response.data.sales || []);
        setFilteredSales(response.data.sales || []);
      } else {
        setSales([]);
        setFilteredSales([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading sales:", error);
      
      // Extract detailed error message
      let errorMsg = "Failed to load sales from server.";
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 401) {
          errorMsg = "Session expired. Please login again.";
          setAuthError(errorMsg);
          clearUserData();
          navigate("/login");
        } else if (error.response.status === 403) {
          errorMsg = "Access denied. You don't have permission to view sales.";
          setErrorMessage(errorMsg);
          setTimeout(() => navigate("/shopkeeper-dashboard"), 3000);
        } else if (error.response.status === 500) {
          errorMsg = error.response.data?.message || "Server error. Please try again later.";
          setErrorMessage(errorMsg);
        } else {
          errorMsg = error.response.data?.message || "Failed to load sales from server.";
          setErrorMessage(errorMsg);
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = "Network error. Please check your connection.";
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage(errorMsg);
      }
      
      setIsLoading(false);
    }
  };

  // Load sale statistics
  const loadSaleStats = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        throw new Error("No access token found");
      }
      
      const response = await axios.get("/sales/stats", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accessToken': accessToken
        }
      });
      
      if (response.data && response.data.success) {
        setSaleStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error loading sale stats:", error);
      // Don't show error for stats - they're not critical
    }
  };

  // Filter and sort sales
  useEffect(() => {
    let result = [...sales];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(sale => 
        (sale.productName && sale.productName.toLowerCase().includes(term)) ||
        (sale.productCategory && sale.productCategory.toLowerCase().includes(term)) ||
        (sale.id && sale.id.toString().includes(term))
      );
    }
    
    // Apply period filter
    if (selectedPeriod !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch(selectedPeriod) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          result = result.filter(sale => new Date(sale.saleDate) >= filterDate);
          break;
        case "yesterday":
          filterDate.setDate(filterDate.getDate() - 1);
          filterDate.setHours(0, 0, 0, 0);
          const yesterdayEnd = new Date(filterDate);
          yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
          result = result.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate >= filterDate && saleDate < yesterdayEnd;
          });
          break;
        case "week":
          filterDate.setDate(filterDate.getDate() - 7);
          result = result.filter(sale => new Date(sale.saleDate) >= filterDate);
          break;
        case "month":
          filterDate.setMonth(filterDate.getMonth() - 1);
          result = result.filter(sale => new Date(sale.saleDate) >= filterDate);
          break;
        default:
          break;
      }
    }
    
    // Apply sorting
    switch(sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.saleDate) - new Date(b.saleDate));
        break;
      case "amount_high":
        result.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        break;
      case "amount_low":
        result.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
        break;
      case "quantity_high":
        result.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      case "quantity_low":
        result.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
        break;
      default:
        break;
    }
    
    setFilteredSales(result);
    setCurrentPage(1);
  }, [sales, searchTerm, selectedPeriod, sortBy]);

  // Define menu items for shopkeeper
  const menuItems = [
    {
      icon: <FiHome />,
      text: 'Dashboard',
      path: '/shopkeeper-dashboard',
      active: location.pathname === '/shopkeeper-dashboard',
      requiresAuth: true
    },
    {
      icon: <FiShoppingCart />,
      text: 'Sales',
      path: '/shopkeeper-sales',
      active: location.pathname === '/shopkeeper-sales',
      requiresAuth: true
    },
    {
      icon: <FiBox />,
      text: 'Products',
      path: '/shopkeeper-products',
      active: location.pathname === '/shopkeeper-products',
      requiresAuth: true
    },
    {
      icon: <FiHelpCircle />,
      text: 'Help & Support',
      path: '/help',
      active: location.pathname === '/help',
      requiresAuth: false
    },
    {
      icon: <FiLogOut />,
      text: 'Logout',
      path: '/login',
      active: false,
      isLogout: true
    },
  ];

  // Helper functions for user data
  const getUserFullName = () => {
    if (!userData) return "";
    
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return firstName || lastName || "";
  };

  const getUserDisplayName = () => {
    const fullName = getUserFullName();
    
    if (fullName) {
      return fullName;
    }
    
    if (userData?.email) {
      return userData.email.split('@')[0];
    }
    
    return "Shopkeeper";
  };

  const getUserRole = () => {
    if (!userData) return "Shopkeeper";
    
    const userType = userData.userType || userData.role;
    
    switch(userType?.toLowerCase()) {
      case 'storekeeper':
        return "Storekeeper";
      case 'shopkeeper':
        return "Shopkeeper";
      case 'admin':
      case 'businessowner':
      case 'owner':
        return "Business Owner";
      case 'user':
        return "User";
      default:
        return userType || "Shopkeeper";
    }
  };

  const getUserInitials = () => {
    if (!userData) return "SK";
    
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (userData.email) {
      return userData.email.charAt(0).toUpperCase();
    }
    
    return "SK";
  };

  const hasUserName = () => {
    return userData && (userData.firstName || userData.lastName);
  };

  const getUserId = () => {
    if (!userData) return "";
    
    // Try multiple possible ID fields
    return userData.id || userData.userId || userData.ownerId || "";
  };

  const handleNavigation = (item) => {
    if (item.isLogout) {
      clearUserData();
      navigate('/login');
      setSidebarOpen(false);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    
    if (item.requiresAuth && !accessToken) {
      console.log("Access token missing for protected route:", item.path);
      navigate('/login');
      setSidebarOpen(false);
      return;
    }

    navigate(item.path);
    setSidebarOpen(false);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0 Tsh";
    return new Intl.NumberFormat("en-US").format(value) + " Tsh";
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return format(date, 'MMM dd');
      }
    } catch (error) {
      return "";
    }
  };

  // Toggle sale details
  const toggleSaleDetails = (saleId) => {
    if (expandedSaleId === saleId) {
      setExpandedSaleId(null);
    } else {
      setExpandedSaleId(saleId);
    }
  };

  // Calculate total sales amount
  const calculateTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  };

  // Calculate total items sold
  const calculateTotalItems = () => {
    return filteredSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  // Handle print receipt
  const handlePrintReceipt = (sale) => {
    const receiptWindow = window.open('', '_blank');
    const receiptContent = `
      <html>
        <head>
          <title>Sale Receipt #${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .receipt-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">INVENTORY MANAGEMENT SYSTEM</div>
            <div>Sales Receipt</div>
          </div>
          <div class="receipt-info">
            <div><strong>Receipt #:</strong> ${sale.id}</div>
            <div><strong>Date:</strong> ${formatDate(sale.saleDate)}</div>
            <div><strong>Sold by:</strong> ${getUserDisplayName()}</div>
          </div>
          <table class="items-table">
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>${sale.productName || 'Product'}</td>
              <td>${sale.quantity || 0}</td>
              <td>${formatCurrency(sale.unitPrice || 0)}</td>
              <td>${formatCurrency(sale.totalAmount || 0)}</td>
            </tr>
          </table>
          <div class="total">
            Total Amount: ${formatCurrency(sale.totalAmount || 0)}
          </div>
          <div class="footer">
            Thank you for your business!<br>
            Generated on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  // Handle retry loading
  const handleRetry = async () => {
    setErrorMessage("");
    await loadSales();
    await loadSaleStats();
  };

  // If no user data, show loading
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading sales...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we verify your session</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Authentication Error Banner */}
      {authError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="mr-3" size={24} />
              <span className="font-semibold">{authError}</span>
            </div>
            <button
              onClick={() => {
                setAuthError("");
                navigate('/login');
              }}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
            >
              Login Again
            </button>
          </div>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && !authError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertCircle className="mr-3" size={24} />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-50"
              >
                Retry
              </button>
              <button
                onClick={() => setErrorMessage("")}
                className="bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
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
        {/* SIDEBAR */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:translate-x-0
        `}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">IMS PRO</h2>
              <p className="text-blue-200 text-xs mt-1">Shopkeeper Dashboard</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* User Profile in Sidebar */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-blue-800 to-blue-700 rounded-xl shadow-lg">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-xl shadow-md">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{getUserDisplayName()}</p>
              {hasUserName() && (
                <p className="text-blue-100 text-sm truncate opacity-90">
                  {getUserFullName()}
                </p>
              )}
              <p className="text-xs text-blue-300 mt-1 px-2 py-1 bg-blue-900 bg-opacity-50 rounded-full inline-block">
                {getUserRole()}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                ID: {getUserId()}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                text={item.text}
                active={item.active}
                onClick={() => handleNavigation(item)}
                isLogout={item.isLogout}
              />
            ))}
          </nav>

          {/* Sales Stats Sidebar */}
          <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-xl">
            <p className="text-xs text-blue-200 mb-3 font-medium">Sales Overview:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Today's Sales:</span>
                <span className="text-green-300 font-bold">{formatCurrency(saleStats.today.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Weekly Sales:</span>
                <span className="text-green-300 font-bold">{formatCurrency(saleStats.week.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Total Sales:</span>
                <span className="text-green-300 font-bold">{formatCurrency(saleStats.total.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Transactions:</span>
                <span className="text-blue-200 font-bold">{saleStats.total.transactions || 0}</span>
              </div>
            </div>
            
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full mt-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiRefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={14} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center">
              <div className="w-8 h-1 bg-blue-700 rounded-full mx-auto mb-3"></div>
              <p className="text-blue-200 text-sm">Shopkeeper Sales</p>
              <p className="text-blue-300 text-xs mt-1">v2.1.0 • {currentDate.split(',')[0]}</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-h-screen lg:ml-0 overflow-x-hidden">
          {/* TOP BAR */}
          <header className="bg-white shadow-sm px-4 sm:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                    <FiHome size={14} />
                    <span>Dashboard</span>
                    <span className="mx-1">›</span>
                    <span className="text-blue-600 font-medium">Sales History</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sales History</h1>
                    <div className="flex items-center mt-2">
                      <FiCalendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{currentDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm disabled:opacity-50"
                    >
                      <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span className="text-sm font-medium">Refresh</span>
                    </button>
                    
                    {/* User Info Display */}
                    <div className="flex items-center space-x-3">
                      <div className="hidden sm:block text-right">
                        <p className="font-semibold text-gray-800 truncate max-w-[150px]">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{getUserRole()}</p>
                        <p className="text-xs text-green-500 font-medium mt-1">
                          ID: {getUserId()}
                        </p>
                      </div>
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                        {getUserInitials()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Banner */}
            <div className="mt-6 bg-gradient-to-r from-green-600 via-emerald-700 to-green-800 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Sales Dashboard, {getUserDisplayName()}! <span className="text-yellow-300">💰</span>
                  </h2>
                  <div className="flex items-center gap-3 mb-1">
                    {hasUserName() && (
                      <span className="text-green-100 bg-green-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        {getUserFullName()}
                      </span>
                    )}
                    <span className="text-green-100 bg-green-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                      {getUserRole()}
                    </span>
                    <span className="text-green-100 bg-green-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                      User ID: {getUserId()}
                    </span>
                    {userData.ownerId && (
                      <span className="text-green-100 bg-green-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        Owner ID: {userData.ownerId}
                      </span>
                    )}
                  </div>
                  <p className="text-green-100">
                    {errorMessage 
                      ? "There was an error loading sales. Please try refreshing."
                      : "View and manage all sales transactions. Click on any sale to see detailed information."
                    }
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500 bg-opacity-30 rounded-full flex items-center justify-center">
                    <FiShoppingCart size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Statistics Cards - Collapsible */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Sales Statistics</h2>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {showStats ? <FiChevronUp /> : <FiChevronDown />}
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
              </div>
              
              {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium mb-1">Today's Sales</p>
                        <p className="text-2xl font-bold">{formatCurrency(saleStats.today.amount || 0)}</p>
                        <p className="text-xs text-emerald-100 mt-1">
                          {saleStats.today.transactions || 0} transactions
                        </p>
                      </div>
                      <FiTrendingUp className="text-emerald-200" size={28} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-emerald-100">vs Yesterday</span>
                      <span className="text-xs font-semibold">
                        {saleStats.yesterday.amount > 0 
                          ? `${((saleStats.today.amount - saleStats.yesterday.amount) / saleStats.yesterday.amount * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">This Week</p>
                        <p className="text-2xl font-bold">{formatCurrency(saleStats.week.amount || 0)}</p>
                        <p className="text-xs text-blue-100 mt-1">
                          {saleStats.week.transactions || 0} transactions
                        </p>
                      </div>
                      <FiBarChart2 className="text-blue-200" size={28} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-blue-100">Total Week</span>
                      <span className="text-xs font-semibold">7 days</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium mb-1">Total Sales</p>
                        <p className="text-2xl font-bold">{formatCurrency(saleStats.total.amount || 0)}</p>
                        <p className="text-xs text-purple-100 mt-1">
                          {saleStats.total.transactions || 0} total transactions
                        </p>
                      </div>
                      <FiDollarSign className="text-purple-200" size={28} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-purple-100">Lifetime Value</span>
                      <span className="text-xs font-semibold">All Time</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-sm font-medium mb-1">Average Sale</p>
                        <p className="text-2xl font-bold">
                          {saleStats.total.transactions > 0 
                            ? formatCurrency(saleStats.total.amount / saleStats.total.transactions)
                            : formatCurrency(0)
                          }
                        </p>
                        <p className="text-xs text-amber-100 mt-1">
                          Per transaction
                        </p>
                      </div>
                      <FiPercent className="text-amber-200" size={28} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-amber-100">Performance</span>
                      <span className="text-xs font-semibold">
                        {saleStats.total.transactions > 0 ? 'Good' : 'No Data'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            {!errorMessage && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FiShoppingCart className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Filtered Sales</p>
                      <p className="text-2xl font-bold text-gray-800">{filteredSales.length}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Total number of sales matching current filters</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FiDollarSign className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalSales())}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Total revenue from filtered sales</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FiPackage className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Items Sold</p>
                      <p className="text-2xl font-bold text-gray-800">{calculateTotalItems()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Total units sold in filtered sales</p>
                </div>
              </div>
            )}

            {/* Filters and Search - Only show if no error */}
            {!errorMessage && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search sales by product, category, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                      <FiFilter className="text-gray-500" />
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                    
                    <div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount_high">Amount: High to Low</option>
                        <option value="amount_low">Amount: Low to High</option>
                        <option value="quantity_high">Quantity: High to Low</option>
                        <option value="quantity_low">Quantity: Low to High</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Active Filters Display */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm("")} className="text-blue-500 hover:text-blue-700">
                        ×
                      </button>
                    </span>
                  )}
                  {selectedPeriod !== "all" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                      Period: {selectedPeriod === 'today' ? 'Today' : 
                              selectedPeriod === 'yesterday' ? 'Yesterday' :
                              selectedPeriod === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                      <button onClick={() => setSelectedPeriod("all")} className="text-green-500 hover:text-green-700">
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error State */}
            {errorMessage ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <FiAlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Unable to Load Sales</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {errorMessage}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Retrying...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw size={16} />
                        Retry Loading
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/shopkeeper-products')}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors"
                  >
                    Go to Products
                  </button>
                  <button
                    onClick={() => navigate('/shopkeeper-dashboard')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-700 font-medium">Loading sales...</p>
                  <p className="text-sm text-gray-500 mt-2">Fetching real-time data from server</p>
                </div>
              </div>
            ) : currentSales.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <FiShoppingCart className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No sales found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedPeriod !== "all" 
                    ? "No sales match your search criteria. Try adjusting your filters."
                    : "No sales have been made yet. Start selling products from the Products page."}
                </p>
                <div className="flex gap-4 justify-center">
                  {(searchTerm || selectedPeriod !== "all") ? (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedPeriod("all");
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={loadSales}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Refresh Sales
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/shopkeeper-products')}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors"
                  >
                    Go to Products
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-8">
                  {/* Table Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3 font-semibold text-gray-700 text-sm uppercase tracking-wider">Product</div>
                      <div className="col-span-2 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date & Time</div>
                      <div className="col-span-1 font-semibold text-gray-700 text-sm uppercase tracking-wider text-center">Quantity</div>
                      <div className="col-span-2 font-semibold text-gray-700 text-sm uppercase tracking-wider text-right">Unit Price</div>
                      <div className="col-span-2 font-semibold text-gray-700 text-sm uppercase tracking-wider text-right">Total Amount</div>
                      <div className="col-span-2 font-semibold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</div>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {currentSales.map((sale) => (
                      <div key={sale.id}>
                        {/* Sale Row */}
                        <div 
                          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleSaleDetails(sale.id)}
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FiPackage className="text-blue-600" size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 truncate">
                                    {sale.productName || 'Product'}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {sale.productCategory || 'Uncategorized'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="col-span-2">
                              <p className="text-sm text-gray-800">{formatDate(sale.saleDate)}</p>
                              <p className="text-xs text-gray-500">{getRelativeTime(sale.saleDate)}</p>
                            </div>
                            
                            <div className="col-span-1 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {sale.quantity || 0}
                              </span>
                            </div>
                            
                            <div className="col-span-2 text-right">
                              <p className="text-sm text-gray-800">{formatCurrency(sale.unitPrice || 0)}</p>
                            </div>
                            
                            <div className="col-span-2 text-right">
                              <p className="text-lg font-bold text-green-600">{formatCurrency(sale.totalAmount || 0)}</p>
                            </div>
                            
                            <div className="col-span-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintReceipt(sale);
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                  title="Print Receipt"
                                >
                                  <FiPrinter size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSaleDetails(sale.id);
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                  title={expandedSaleId === sale.id ? "Hide Details" : "Show Details"}
                                >
                                  {expandedSaleId === sale.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedSaleId === sale.id && (
                          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Sale Details</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Sale ID:</span>
                                    <span className="text-sm font-medium text-gray-800">{sale.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Transaction Date:</span>
                                    <span className="text-sm font-medium text-gray-800">{formatDate(sale.saleDate)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Business Owner ID:</span>
                                    <span className="text-sm font-medium text-gray-800">{sale.businessOwnerId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Product ID:</span>
                                    <span className="text-sm font-medium text-gray-800">{sale.productId}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Financial Breakdown</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Quantity:</span>
                                    <span className="text-sm font-medium text-gray-800">{sale.quantity} units</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Unit Price:</span>
                                    <span className="text-sm font-medium text-gray-800">{formatCurrency(sale.unitPrice)}</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-gray-800">Total Amount:</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(sale.totalAmount)}</span>
                                  </div>
                                </div>
                                
                                <div className="mt-4 flex gap-2">
                                  <button
                                    onClick={() => handlePrintReceipt(sale)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    <FiPrinter size={14} />
                                    Print Receipt
                                  </button>
                                  <button
                                    onClick={() => navigate('/shopkeeper-products')}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors text-sm"
                                  >
                                    <FiShoppingCart size={14} />
                                    Sell More
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSales.length)} of {filteredSales.length} sales
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <FiChevronLeft size={20} />
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`w-10 h-10 rounded-lg font-medium ${
                              currentPage === idx + 1
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <FiChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

          {/* FOOTER */}
          <footer className="bg-white border-t border-gray-200 px-4 sm:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="text-gray-600 text-sm">
                <span className="font-medium">© 2024 Inventory Management System.</span>
                <span className="text-gray-500 ml-2">All rights reserved.</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="px-3 py-1 bg-gray-100 rounded-full">v2.1.0</span>
                <span>•</span>
                <span>Shopkeeper Sales</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiUser size={10} />
                  {getUserDisplayName()}
                </span>
                <span>•</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {getUserRole()}
                </span>
                <span>•</span>
                <span>User ID: {getUserId()}</span>
                {userData.ownerId && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Owner ID: {userData.ownerId}
                  </span>
                )}
                {!errorMessage && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Sales: {filteredSales.length}
                  </span>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

// MenuItem Component
const MenuItem = ({ icon, text, active, onClick, isLogout }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center w-full gap-3 p-3 rounded-lg transition-all
      ${active 
        ? 'bg-blue-700 text-white shadow-md' 
        : 'hover:bg-blue-700 hover:bg-opacity-50 text-blue-100 hover:text-white'
      }
      ${isLogout ? 'mt-8 border-t border-blue-700 pt-8' : ''}
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    `}
  >
    <span className="text-lg flex-shrink-0">{icon}</span>
    <span className="font-medium text-left flex-1">{text}</span>
    {active && (
      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
    )}
  </button>
);

export default ShopkeeperSales;