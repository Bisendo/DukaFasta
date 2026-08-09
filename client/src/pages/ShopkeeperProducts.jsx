import React, { useState, useEffect } from "react";
import axios from "axios";
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
  FiEye
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const ShopkeeperProducts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);
  const [sellUnitPrice, setSellUnitPrice] = useState(0);
  const [authError, setAuthError] = useState("");
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [businessOwner, setBusinessOwner] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data and products on component mount
  useEffect(() => {
    // Set current date
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    // Check authentication and load user data
    const loadUserDataAndProducts = async () => {
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
        
        // Load products
        await loadProducts();
        
      } catch (error) {
        console.error("Error loading data:", error);
        setAuthError("Failed to load data. Please login again.");
        clearUserData();
        navigate("/login");
      }
    };

    loadUserDataAndProducts();
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

  // Load products from API
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        throw new Error("No access token found");
      }
      
      const response = await axios.get("/products/shopkeeper", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accessToken': accessToken
        }
      });
      
      if (response.data && response.data.products) {
        const productsData = response.data.products;
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Set business owner info
        if (response.data.owner) {
          setBusinessOwner(response.data.owner);
        }
        
        // Use stats from backend if available
        if (response.data.stats) {
          setStats({
            totalProducts: response.data.stats.totalProducts,
            totalStockValue: response.data.stats.totalStockValue,
            lowStockItems: response.data.stats.lowStockItems || 0,
            outOfStockItems: response.data.stats.outOfStockItems || 0
          });
        } else {
          // Calculate locally
          calculateStats(productsData);
        }
      } else {
        // No error, just no products
        setProducts([]);
        setFilteredProducts([]);
        setStats({
          totalProducts: 0,
          totalStockValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading products:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setAuthError("Session expired. Please login again.");
          clearUserData();
          navigate("/login");
        } else if (error.response.status === 403) {
          setAuthError("Access denied. You don't have permission to view products.");
          setTimeout(() => navigate("/shopkeeper-dashboard"), 3000);
        } else {
          setAuthError(error.response.data?.message || "Failed to load products from server.");
        }
      } else {
        setAuthError("Network error. Please check your connection.");
      }
      
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (productList) => {
    let totalStockValue = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    
    productList.forEach(product => {
      const stockValue = (product.purchasePrice || 0) * (product.stockQuantity || 0);
      totalStockValue += stockValue;
      
      if (product.stockQuantity <= 0) {
        outOfStockItems++;
      } else if (product.stockQuantity <= 5) {
        lowStockItems++;
      }
    });
    
    setStats({
      totalProducts: productList.length,
      totalStockValue,
      lowStockItems,
      outOfStockItems
    });
  };

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply sorting
    switch(sortBy) {
      case "name":
        result.sort((a, b) => (a.description || "").localeCompare(b.description || ""));
        break;
      case "stock_high":
        result.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0));
        break;
      case "stock_low":
        result.sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0));
        break;
      case "price_high":
        result.sort((a, b) => (b.salesPrice || 0) - (a.salesPrice || 0));
        break;
      case "price_low":
        result.sort((a, b) => (a.salesPrice || 0) - (b.salesPrice || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, sortBy]);

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

  // Get stock status
  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { text: "Out of Stock", color: "red", bg: "red-100", border: "red-200" };
    if (quantity <= 5) return { text: "Low Stock", color: "yellow", bg: "yellow-100", border: "yellow-200" };
    return { text: "In Stock", color: "green", bg: "green-100", border: "green-200" };
  };

  // Get stock status color classes
  const getStockStatusClass = (quantity) => {
    if (quantity <= 0) return "bg-red-100 text-red-800 border-red-200";
    if (quantity <= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle sell action
  const handleSellClick = (product) => {
    setSelectedProduct(product);
    setSellQuantity(1);
    const unitPrice = product.salesPrice || 0;
    setSellUnitPrice(unitPrice);
    setSellPrice(unitPrice);
    setSellModalOpen(true);
  };

  // Process sale - UPDATED ENDPOINT
  const handleProcessSale = async () => {
    if (!selectedProduct) return;
    
    if (sellQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    if (sellQuantity > selectedProduct.stockQuantity) {
      alert(`Only ${selectedProduct.stockQuantity} units available in stock`);
      return;
    }
    
    const unitPrice = sellPrice / sellQuantity;
    if (unitPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }
    
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        alert("Session expired. Please login again.");
        navigate('/login');
        return;
      }
      
      const saleData = {
        productId: selectedProduct.id,
        quantity: sellQuantity,
        salePrice: unitPrice, // Unit price (per unit)
        productName: selectedProduct.description
      };
      
      console.log("Processing sale:", saleData);
      console.log("Endpoint: /sales");
      
      // FIXED: Using correct endpoint /api/sales
      const response = await axios.post("/sales", saleData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accessToken': accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        // Update product stock locally
        const updatedProducts = products.map(p => {
          if (p.id === selectedProduct.id) {
            return {
              ...p,
              stockQuantity: p.stockQuantity - sellQuantity
            };
          }
          return p;
        });
        
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        
        // Show success message
        alert(`✅ Sale completed successfully! Total: ${formatCurrency(sellPrice)}`);
        
        // Close modal
        setSellModalOpen(false);
        setSelectedProduct(null);
        
        // Refresh products from server
        await loadProducts();
      } else {
        throw new Error(response.data?.message || "Sale failed");
      }
      
    } catch (error) {
      console.error("Error processing sale:", error);
      
      if (error.response) {
        const errorMsg = error.response.data?.message || "Server error";
        const status = error.response.status;
        
        console.error("Response status:", status);
        console.error("Response data:", error.response.data);
        
        if (status === 401) {
          alert("Session expired. Please login again.");
          clearUserData();
          navigate('/login');
        } else if (status === 403) {
          alert(`Access denied: ${errorMsg}`);
        } else if (status === 404) {
          alert("Sales endpoint not found. Please check the server configuration.");
          console.error("Make sure your server is running and the /sales route is registered.");
        } else if (status === 400) {
          alert(`Bad request: ${errorMsg}`);
        } else if (status === 500) {
          alert(`Server error: ${errorMsg}`);
        } else {
          alert(`Failed to process sale: ${errorMsg}`);
        }
      } else if (error.code === 'ERR_NETWORK') {
        alert("Network error. Please check if the server is running.");
        console.error("Server might be down. Check: http://localhost:4001/health");
      } else if (error.request) {
        alert("No response from server. Please check your connection.");
      } else {
        alert("Failed to process sale. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quantity change in modal
  const handleQuantityChange = (value) => {
    const qty = Math.max(1, Math.min(value, selectedProduct?.stockQuantity || 1));
    setSellQuantity(qty);
    setSellPrice(qty * sellUnitPrice);
  };

  // Handle unit price change in modal
  const handleUnitPriceChange = (value) => {
    const price = Math.max(0, value);
    setSellUnitPrice(price);
    setSellPrice(price * sellQuantity);
  };

  // If no user data, show loading
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading products...</p>
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
                loadProducts();
              }}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
            >
              Retry
            </button>
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

          {/* Inventory Stats */}
          <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-xl">
            <p className="text-xs text-blue-200 mb-3 font-medium">Inventory Overview:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Total Products:</span>
                <span className="text-blue-200 font-bold">{stats.totalProducts}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Stock Value:</span>
                <span className="text-green-300 font-bold">{formatCurrency(stats.totalStockValue)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Low Stock:</span>
                <span className="text-yellow-300 font-bold">{stats.lowStockItems}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Out of Stock:</span>
                <span className="text-red-300 font-bold">{stats.outOfStockItems}</span>
              </div>
            </div>
            
            {/* Business Owner Info */}
            {businessOwner && (
              <div className="mt-4 pt-4 border-t border-blue-800">
                <p className="text-xs text-blue-200 mb-2 font-medium">Business Owner:</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-xs">
                    {businessOwner.firstName?.charAt(0) || 'B'}
                  </div>
                  <div className="text-xs text-blue-200 truncate">
                    {businessOwner.firstName} {businessOwner.lastName}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center">
              <div className="w-8 h-1 bg-blue-700 rounded-full mx-auto mb-3"></div>
              <p className="text-blue-200 text-sm">Shopkeeper Products</p>
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
                    <span className="text-blue-600 font-medium">Products</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Products for Sale</h1>
                    <div className="flex items-center mt-2">
                      <FiCalendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{currentDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={loadProducts}
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
                          ID: {userData?.id}
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
            <div className="mt-6 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome, {getUserDisplayName()}! <span className="text-yellow-300">🛒</span>
                  </h2>
                  <div className="flex items-center gap-3 mb-1">
                    {hasUserName() && (
                      <span className="text-blue-100 bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        {getUserFullName()}
                      </span>
                    )}
                    <span className="text-blue-100 bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                      {getUserRole()}
                    </span>
                    <span className="text-blue-100 bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                      User ID: {userData?.id}
                    </span>
                    {businessOwner && (
                      <span className="text-blue-100 bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        Owner: {businessOwner.firstName}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-100">
                    Manage and sell products from inventory. Click "Sell" to process sales.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-500 bg-opacity-30 rounded-full flex items-center justify-center">
                    <FiShoppingBag size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Products</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <FiBox className="text-blue-200" size={28} />
                </div>
                <div className="mt-4 text-xs text-blue-100">
                  Available for sale
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Stock Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalStockValue)}</p>
                  </div>
                  <FiTrendingUp className="text-emerald-200" size={28} />
                </div>
                <div className="mt-4 text-xs text-emerald-100">
                  Total inventory value
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium mb-1">Low Stock</p>
                    <p className="text-2xl font-bold">{stats.lowStockItems}</p>
                  </div>
                  <FiAlertCircle className="text-amber-200" size={28} />
                </div>
                <div className="mt-4 text-xs text-amber-100">
                  Items needing restock
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium mb-1">Out of Stock</p>
                    <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
                  </div>
                  <FiPackage className="text-pink-200" size={28} />
                </div>
                <div className="mt-4 text-xs text-pink-100">
                  Items unavailable
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search products by name or category..."
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
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category, idx) => (
                        <option key={idx} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="stock_high">Stock: High to Low</option>
                      <option value="stock_low">Stock: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="newest">Newest First</option>
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
                {selectedCategory !== "all" && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")} className="text-green-500 hover:text-green-700">
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-700 font-medium">Loading products...</p>
                  <p className="text-sm text-gray-500 mt-2">Fetching real-time data from server</p>
                </div>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <FiPackage className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory !== "all" 
                    ? "No products match your search criteria. Try adjusting your filters."
                    : "No products available for sale. Please contact your business owner to add products."}
                </p>
                {(searchTerm || selectedCategory !== "all") ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={loadProducts}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Products
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stockQuantity || 0);
                    
                    return (
                      <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                        {/* Product Image */}
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                          {product.image ? (
                            <img 
                              src={`${API_BASE_URL}/${product.image}`} 
                              alt={product.description} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="text-center">
                              <FiPackage className="text-gray-400 mx-auto" size={48} />
                              <p className="text-gray-500 mt-2 text-sm">No image available</p>
                            </div>
                          )}
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${getStockStatusClass(product.stockQuantity || 0)}`}>
                            {stockStatus.text}
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-gray-800 text-lg line-clamp-2 flex-1">
                              {product.description || "Unnamed Product"}
                            </h3>
                          </div>
                          
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-2">
                              {product.category || "Uncategorized"}
                            </span>
                          </div>
                          
                          <div className="space-y-3 mb-5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Stock Quantity:</span>
                              <span className={`font-semibold ${(product.stockQuantity || 0) <= 5 ? 'text-yellow-600' : 'text-gray-800'}`}>
                                {product.stockQuantity || 0} units
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Selling Price:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(product.salesPrice || 0)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSellClick(product)}
                              disabled={(product.stockQuantity || 0) <= 0}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                (product.stockQuantity || 0) <= 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                              }`}
                            >
                              <FiShoppingCart size={16} />
                              Sell
                            </button>
                            
                            <button
                              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => navigate(`/product-details/${product.id}`)}
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
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
                <span>Shopkeeper Products</span>
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
                <span>User ID: {userData?.id}</span>
                {businessOwner && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Owner: {businessOwner.firstName}
                  </span>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Sell Modal */}
      {sellModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sell Product</h3>
                <button
                  onClick={() => setSellModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              {/* Product Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{selectedProduct.description}</h4>
                    <p className="text-sm text-gray-600">{selectedProduct.category || "Uncategorized"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Available Stock</p>
                    <p className="font-semibold text-gray-800">{selectedProduct.stockQuantity || 0} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Original Price</p>
                    <p className="font-bold text-green-600">{formatCurrency(selectedProduct.salesPrice || 0)}</p>
                  </div>
                </div>
              </div>
              
              {/* Sale Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity to Sell <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stockQuantity || 0}
                    value={sellQuantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">Max: {selectedProduct.stockQuantity || 0}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(selectedProduct.stockQuantity || 0)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Set to max
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit Price (Tsh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={sellUnitPrice}
                    onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="100"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">Original: {formatCurrency(selectedProduct.salesPrice || 0)}</span>
                    <button
                      type="button"
                      onClick={() => handleUnitPriceChange(selectedProduct.salesPrice || 0)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Use original
                    </button>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-3">Sale Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{sellQuantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">{formatCurrency(sellUnitPrice)}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-100">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(sellPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleProcessSale}
                    disabled={isLoading || sellQuantity <= 0 || sellUnitPrice <= 0}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheck size={18} />
                        Confirm Sale
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setSellModalOpen(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <div>
                <div className="text-gray-800 font-semibold text-center">Processing Sale</div>
                <div className="text-sm text-gray-500 mt-1">Please wait a moment...</div>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default ShopkeeperProducts;