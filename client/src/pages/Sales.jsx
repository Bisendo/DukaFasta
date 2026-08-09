import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { 
  FiHome, 
  FiShoppingCart, 
  FiBox, 
  FiUsers, 
  FiHelpCircle, 
  FiLogOut, 
  FiMenu,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiPlus,
  FiUser,
  FiChevronDown,
  FiRefreshCw,
  FiPackage,
  FiTrendingUp,
  FiActivity,
  FiCreditCard,
  FiHash,
  FiShoppingBag
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Sales = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation ? useTranslation() : { t: (key) => key };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalItemsSold: 0,
    totalTransactions: 0
  });
  const [statsSummary, setStatsSummary] = useState({
    today: { amount: 0, transactions: 0 },
    yesterday: { amount: 0, transactions: 0 },
    week: { amount: 0, transactions: 0 },
    total: { amount: 0, transactions: 0 }
  });



  // Get user data from localStorage and set current date
  useEffect(() => {
    // Set current date
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    // Get user data from localStorage
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role"); // Changed from userType to role
    const userId = localStorage.getItem("userId");

    const userObj = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: role, // Changed from userType to role
      id: userId
    };

    console.log("User data from localStorage:", userObj);

    // Check if user is authenticated
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    // Only set if we have at least some user data
    if (firstName || lastName || email || role) {
      setUserData(userObj);
    }

    // Fetch sales data based on user role
    fetchSalesData();
    fetchSalesStats();
  }, [navigate]);

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
      path: '/login',
      active: false,
      isLogout: true
    },
  ];

  // Fetch sales data from API
  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const role = localStorage.getItem("role");

      console.log("User role from localStorage:", role);

      let endpoint = '';
      if (role === 'owner' || role === 'admin') {
        endpoint = '/sales/business-owner';
        console.log("Fetching business owner sales");
      } else if (role === 'shopkeeper') {
        endpoint = '/sales/shopkeeper';
        console.log("Fetching shopkeeper sales");
      } else {
        console.log('User role not authorized to view sales:', role);
        // Show empty state for unauthorized users
        setSalesData([]);
        setIsLoading(false);
        return;
      }

      console.log("Fetching from endpoint:", `${API_BASE_URL}${endpoint}`);

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Sales API response:", response.data);

      if (response.data.success) {
        const sales = response.data.sales || [];
        console.log("Fetched sales:", sales);
        setSalesData(sales);
        if (response.data.stats) {
          setSalesStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else if (error.response?.status === 403) {
        console.log("User not authorized to access sales data");
      }
      // Even on error, set empty array to prevent undefined errors
      setSalesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sales statistics
  const fetchSalesStats = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      const response = await axios.get(`${API_BASE_URL}/sales/stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStatsSummary(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    }
  };

  // Group sales by date for business owners/admins
  const groupSalesByDate = (sales) => {
    const grouped = {};
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.saleDate);
      const dateKey = saleDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          totalSales: 0,
          sales: []
        };
      }
      
      grouped[dateKey].totalSales += sale.totalAmount;
      grouped[dateKey].sales.push(sale);
    });
    
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleNavigation = (path) => {
    if (path === '/login') {
      // Handle logout - clear all user data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      setUserData(null);
      navigate('/login');
    } else {
      navigate(path);
    }
    setSidebarOpen(false);
  };

  const handleAddOrder = () => {
    navigate("/add-order");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 Tsh";
    return amount.toLocaleString("en-US") + " Tsh";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchSalesData();
    fetchSalesStats();
  };

  // Get user's full name (firstName + lastName)
  const getUserFullName = () => {
    if (!userData) return "";
    
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return firstName || lastName || "";
  };

  // Get user display name for greetings
  const getUserDisplayName = () => {
    const fullName = getUserFullName();
    
    if (fullName) {
      return fullName;
    }
    
    if (userData?.email) {
      return userData.email.split('@')[0];
    }
    
    return "User";
  };

  // Get user role/type - Normalized for display
  const getUserRole = () => {
    if (!userData) return "User";
    
    const role = userData.role?.toLowerCase();
    
    switch(role) {
      case 'owner':
        return "Business Owner";
      case 'shopkeeper':
        return "Shopkeeper";
      case 'admin':
        return "Administrator";
      case 'user':
        return "User";
      default:
        return role || "User";
    }
  };

  // Get user role for backend - Normalized
  const getUserRoleForBackend = () => {
    if (!userData) return null;
    
    const role = userData.role?.toLowerCase();
    return role;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData) return "U";
    
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
    
    return "U";
  };

  // Check if user has a name
  const hasUserName = () => {
    return userData && (userData.firstName || userData.lastName);
  };

  // Check if user is business owner or admin
  const isBusinessOwnerOrAdmin = () => {
    const role = getUserRoleForBackend();
    return role === 'owner' || role === 'admin';
  };

  // Check if user is shopkeeper
  const isShopkeeper = () => {
    const role = getUserRoleForBackend();
    return role === 'shopkeeper';
  };

  // Get shopkeeper name from sale data
  const getShopkeeperName = (sale) => {
    if (sale.Shopkeeper) {
      return `${sale.Shopkeeper.firstName || ''} ${sale.Shopkeeper.lastName || ''}`.trim();
    }
    return "Unknown Shopkeeper";
  };

  // Get shopkeeper details
  const getShopkeeperDetails = (sale) => {
    if (sale.Shopkeeper) {
      return {
        name: `${sale.Shopkeeper.firstName || ''} ${sale.Shopkeeper.lastName || ''}`.trim(),
        id: sale.Shopkeeper.id,
        email: sale.Shopkeeper.email,
        role: sale.Shopkeeper.role
      };
    }
    return null;
  };

  const groupedSales = isBusinessOwnerOrAdmin() ? groupSalesByDate(salesData) : [];

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
            <h2 className="text-2xl font-bold">{t('sales') || 'Sales Management'}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* User Profile in Sidebar */}
          {userData && (
            <div className="flex items-center gap-3 mb-6 p-3 bg-blue-800 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-lg">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-lg">{getUserDisplayName()}</p>
                <p className="text-xs text-blue-300 mt-1">{getUserRole()}</p>
              </div>
            </div>
          )}
          
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
                  ${item.isLogout ? 'mt-8 border-t border-blue-700 pt-8' : ''}
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
              <div className={`w-2 h-2 ${isLoading ? 'bg-yellow-400' : 'bg-green-400'} rounded-full mx-auto mb-2`}></div>
              <p>{isLoading ? 'Loading...' : 'System Online'}</p>
              <p className="text-xs mt-1">IMS v2.0</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-h-screen overflow-x-hidden">
          {/* Top Bar with User Profile */}
          <header className="bg-white shadow px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-800">{t('sales') || 'Sales'}</h1>
                <div className="flex items-center mt-1 text-gray-600 text-sm">
                  <FiCalendar className="mr-2" />
                  <span>{currentDate}</span>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Total Transactions: {salesData.length}</span>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <FiDollarSign className="mr-1 hidden sm:inline" />
                  <span className="hidden sm:inline">Revenue: {formatCurrency(salesStats.totalSales)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
                >
                  <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium hidden sm:inline">{t('refresh') || 'Refresh'}</span>
                </button>
                
                {/* User Info Display */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="font-semibold text-gray-800 text-sm">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{getUserRole()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {getUserInitials()}
                    </div>
                    <FiChevronDown className={`transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {userDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-800">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{getUserRole()}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => navigate("/profile")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          >
                            {t('myProfile') || 'My Profile'}
                          </button>
                          <button
                            onClick={() => navigate("/settings")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          >
                            {t('settings') || 'Settings'}
                          </button>
                          <button
                            onClick={() => handleNavigation('/login')}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md mt-1"
                          >
                            {t('logout') || 'Logout'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {(isShopkeeper() || isBusinessOwnerOrAdmin()) && (
                <button
                  onClick={handleAddOrder}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 whitespace-nowrap"
                >
                  <FiPlus size={20} />
                  <span>{t('addNewOrder') || 'Add new order'}</span>
                </button>
              )}
            </div>
          </header>

          {/* Sales Content */}
          <main className="p-4 sm:p-6">
            {/* Welcome Banner */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  {t('welcomeToSales') || 'Welcome to Sales Management'}, {getUserDisplayName()}!
                </h2>
                {hasUserName() && (
                  <p className="text-blue-100 mb-1">
                    {getUserFullName()} • {getUserRole()}
                  </p>
                )}
                <p className="text-blue-100">
                  {isBusinessOwnerOrAdmin() 
                    ? 'View all sales transactions across your business' 
                    : isShopkeeper()
                    ? 'Track and manage your sales transactions'
                    : 'Sales overview'}
                </p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <FiActivity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{t('todaySales') || 'Today Sales'}</p>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(statsSummary.today.amount)}</p>
                    <p className="text-xs text-gray-500">{statsSummary.today.transactions} transactions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <FiTrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{t('weeklySales') || 'Weekly Sales'}</p>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(statsSummary.week.amount)}</p>
                    <p className="text-xs text-gray-500">{statsSummary.week.transactions} transactions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-50 rounded-lg mr-3">
                    <FiPackage className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{t('totalProductsSold') || 'Total Products Sold'}</p>
                    <p className="text-2xl font-bold text-gray-800">{salesStats.totalItemsSold || 0}</p>
                    <p className="text-xs text-gray-500">{salesData.length} transactions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg mr-3">
                    <FiDollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{t('totalRevenue') || 'Total Revenue'}</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(salesStats.totalSales)}</p>
                    <p className="text-xs text-gray-500">All time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading sales data...</span>
              </div>
            ) : salesData.length > 0 ? (
              <div className="space-y-6">
                {/* For Business Owners/Admins: Group by date */}
                {isBusinessOwnerOrAdmin() && groupedSales.length > 0 ? (
                  groupedSales.map((dateGroup, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Date Group Header */}
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-semibold mr-4">
                              <FiCalendar className="inline mr-2" />
                              {dateGroup.date}
                            </div>
                            <div className="text-gray-600 text-sm">
                              {dateGroup.sales.length} {dateGroup.sales.length === 1 ? 'sale' : 'sales'}
                            </div>
                          </div>
                          
                          <div className="bg-green-50 px-4 py-2 rounded-lg">
                            <div className="text-sm text-gray-600">{t('dailyTotal') || 'Daily total'}:</div>
                            <div className="text-lg font-bold text-green-600">{formatCurrency(dateGroup.totalSales)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Individual Sales for this date */}
                      <div className="divide-y divide-gray-100">
                        {dateGroup.sales.map((sale, saleIndex) => {
                          const shopkeeperDetails = getShopkeeperDetails(sale);
                          return (
                            <div key={saleIndex} className="p-6">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                {/* Sale Info */}
                                <div className="flex-1">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                        {sale.productName || sale.Product?.description || 'Product'}
                                      </h3>
                                      <div className="flex items-center text-gray-600 mb-1">
                                        <FiHash className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Sale ID: {sale.id}</span>
                                      </div>
                                      <div className="flex items-center text-gray-600 mb-1">
                                        <FiCalendar className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Time: {formatDateTime(sale.saleDate)}</span>
                                      </div>
                                      <div className="flex items-center text-gray-600">
                                        <FiShoppingBag className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Product ID: {sale.productId}</span>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      {/* Shopkeeper Details - Only show for business owners */}
                                      {shopkeeperDetails && (
                                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                                          <p className="font-medium text-blue-800 mb-1">Shopkeeper Details:</p>
                                          <div className="flex items-center text-gray-700 mb-1">
                                            <FiUser className="h-4 w-4 mr-2" />
                                            <span className="text-sm">{shopkeeperDetails.name}</span>
                                          </div>
                                          <div className="flex items-center text-gray-700 mb-1">
                                            <FiHash className="h-4 w-4 mr-2" />
                                            <span className="text-sm">ID: {shopkeeperDetails.id}</span>
                                          </div>
                                          <div className="flex items-center text-gray-700">
                                            <span className="text-sm">{shopkeeperDetails.email}</span>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Role: {shopkeeperDetails.role}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Product Details */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-gray-700">
                                      <p className="font-medium text-gray-600 text-sm mb-1">Quantity</p>
                                      <p className="font-semibold text-lg">{sale.quantity}</p>
                                    </div>
                                    <div className="text-gray-700">
                                      <p className="font-medium text-gray-600 text-sm mb-1">Unit Price</p>
                                      <p className="font-semibold text-lg">{formatCurrency(sale.unitPrice)}</p>
                                    </div>
                                    <div className="text-gray-700">
                                      <p className="font-medium text-gray-600 text-sm mb-1">Product Category</p>
                                      <p className="font-semibold text-lg">{sale.productCategory || sale.Product?.category || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Total Amount */}
                                <div className="lg:text-right lg:min-w-[200px]">
                                  <div className="text-sm text-gray-500 mb-1">{t('totalAmount') || 'Total Amount'}</div>
                                  <div className="text-2xl font-bold text-green-600 mb-2">
                                    {formatCurrency(sale.totalAmount)}
                                  </div>
                                  <button
                                    onClick={() => sale.productId && navigate(`/products/${sale.productId}`)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    View Product Details →
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  // For Shopkeepers or when not grouped by date: List all sales
                  salesData.map((sale, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Sale Info */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-semibold">
                                Sale #{sale.id}
                              </div>
                              <div className="text-gray-700">
                                <FiCalendar className="inline mr-2" />
                                {formatDateTime(sale.saleDate)}
                              </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 text-lg mb-3">
                              {sale.productName || sale.Product?.description || 'Product'}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
                              <div className="text-gray-700">
                                <p className="font-medium text-gray-600 text-sm mb-1">Quantity</p>
                                <p className="font-semibold text-lg">{sale.quantity}</p>
                              </div>
                              <div className="text-gray-700">
                                <p className="font-medium text-gray-600 text-sm mb-1">Unit Price</p>
                                <p className="font-semibold text-lg">{formatCurrency(sale.unitPrice)}</p>
                              </div>
                              <div className="text-gray-700">
                                <p className="font-medium text-gray-600 text-sm mb-1">Category</p>
                                <p className="font-semibold text-lg">{sale.productCategory || sale.Product?.category || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Show additional info for shopkeepers */}
                            {isShopkeeper() && (
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                  <span className="font-medium">Product ID:</span> {sale.productId}
                                </div>
                                <div>
                                  <span className="font-medium">Business Owner ID:</span> {sale.businessOwnerId}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Total Amount */}
                          <div className="lg:text-right lg:min-w-[200px]">
                            <div className="text-sm text-gray-500 mb-1">{t('totalAmount') || 'Total Amount'}</div>
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {formatCurrency(sale.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              Date: {formatDateOnly(sale.saleDate)}
                            </div>
                            <button
                              onClick={() => sale.productId && navigate(`/products/${sale.productId}`)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Product Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sales Found</h3>
                <p className="text-gray-600 mb-4">
                  {isShopkeeper() 
                    ? 'You haven\'t made any sales yet. Start by creating your first sale.'
                    : isBusinessOwnerOrAdmin()
                    ? 'No sales have been recorded yet. Sales will appear here once created by shopkeepers.'
                    : 'You do not have permission to view sales.'}
                </p>
                {isShopkeeper() && (
                  <button
                    onClick={handleAddOrder}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
                  >
                    <FiPlus size={20} />
                    <span>Create Your First Sale</span>
                  </button>
                )}
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-center sm:text-left">
              <div className="text-gray-600 text-sm mb-2 sm:mb-0">
                © 2024 {t('inventoryManagementSystem') || 'Inventory Management System'}. {t('allRightsReserved') || 'All rights reserved'}.
              </div>
              <div className="text-xs text-gray-500">
                <span>{t('version') || 'Version'} 2.0.1</span>
                <span className="mx-2">•</span>
                <span>{t('lastUpdated') || 'Last updated'}: {new Date().toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>
                  {t('loggedInAs') || 'Logged in as'}: {getUserDisplayName()}
                  {hasUserName() && (
                    <span> ({getUserFullName()})</span>
                  )}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-gray-700 font-medium">{t('refreshing') || 'Refreshing data...'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;