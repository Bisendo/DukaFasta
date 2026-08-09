import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiPlus,
  FiMinus,
  FiEye,
  FiFilter,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiChevronRight,
  FiChevronLeft,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiEdit,
  FiTrash2,
  FiImage
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Products = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Base URL for API
  const API_BASE_URL = "http://localhost:4001";

  // Get user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        
        if (!accessToken) {
          console.log("No access token found, redirecting to login");
          navigate("/login");
          return;
        }

        // Get user data from localStorage
        let user = null;
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            user = JSON.parse(savedUser);
          } catch (error) {
            console.error("Error parsing user JSON:", error);
          }
        }
        
        if (!user) {
          const firstName = localStorage.getItem("firstName");
          const lastName = localStorage.getItem("lastName");
          const email = localStorage.getItem("email");
          const userType = localStorage.getItem("userType");
          const userId = localStorage.getItem("userId");
          
          if (firstName || lastName || email) {
            user = {
              firstName,
              lastName,
              email,
              userType,
              id: userId,
              accessToken
            };
          }
        }
        
        if (!user) {
          user = {
            email: "user@example.com",
            userType: "admin",
            accessToken
          };
        }
        
        console.log("User data loaded:", user);
        setUserData(user);
        
      } catch (error) {
        console.error("Error loading user data:", error);
        clearUserData();
        navigate("/login");
      }
    };

    loadUserData();
  }, [navigate]);

  // Fetch products from API
  useEffect(() => {
    if (userData) {
      fetchProducts();
    }
  }, [userData]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      console.log("Products fetched:", response.data);
      
      // CRITICAL FIX: Ensure products is always an array
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If response.data is an object, check for nested arrays
        if (response.data.products && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          // If no array found, set to empty array
          console.warn("API response doesn't contain an array of products:", response.data);
          setProducts([]);
        }
      } else {
        // If response.data is not an array or object, set to empty array
        console.warn("Unexpected API response format:", response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        clearUserData();
        navigate("/login");
      } else {
        alert("Failed to load products. Please try again.");
      }
      // Ensure products is always an array even on error
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    localStorage.removeItem("userType");
    setUserData(null);
  };

  // Define menu items
  const menuItems = [
    {
      icon: <FiHome />,
      text: 'Dashboard',
      path: '/owner-dashboard',
      active: location.pathname === '/owner-dashboard',
      requiresAuth: true
    },
    {
      icon: <FiShoppingCart />,
      text: 'Sales',
      path: '/sales',
      active: location.pathname === '/sales',
      requiresAuth: true
    },
    {
      icon: <FiBox />,
      text: 'Products',
      path: '/products',
      active: location.pathname === '/products',
      requiresAuth: true
    },
    {
      icon: <FiUsers />,
      text: 'Users',
      path: '/users',
      active: location.pathname === '/users',
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
    
    if (userData?.businessName) {
      return userData.businessName;
    }
    
    if (userData?.email) {
      return userData.email.split('@')[0];
    }
    
    return "Admin";
  };

  const getUserRole = () => {
    if (!userData) return "Administrator";
    
    const userType = userData.userType || userData.role;
    
    switch(userType?.toLowerCase()) {
      case 'storekeeper':
        return "Storekeeper";
      case 'shopkeeper':
        return "Shopkeeper";
      case 'admin':
        return "Administrator";
      case 'user':
        return "User";
      default:
        return userType || "Administrator";
    }
  };

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

  const hasUserName = () => {
    return userData && (userData.firstName || userData.lastName);
  };

  // Helper functions
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0 Tsh";
    return new Intl.NumberFormat("en-US").format(Math.round(value)) + " Tsh";
  };

  const getStatusBadge = (quantity) => {
    const qty = Number(quantity) || 0;
    if (qty === 0) {
      return {
        status: "Out of Stock",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        icon: "🔴"
      };
    } else if (qty <= 5) {
      return {
        status: "Low Stock",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        icon: "🟡"
      };
    } else {
      return {
        status: "Available",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        icon: "🟢"
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Function to get the correct image URL from database
  const getProductImage = (product) => {
    if (!product || !product.image) {
      return null;
    }
    
    // If image is a full URL, return it as is
    if (typeof product.image === 'string' && 
        (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
      return product.image;
    }
    
    // If image is a relative path (from multer upload), construct full URL
    if (typeof product.image === 'string') {
      // Remove leading slash if present
      const imagePath = product.image.startsWith('/') ? product.image.substring(1) : product.image;
      // Construct full URL to the uploaded image
      return `${API_BASE_URL}/${imagePath}`;
    }
    
    return null;
  };

  // Get default image based on category
  const getDefaultImage = (category) => {
    const imageMap = {
      'Electronics': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
      'Audio': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
      'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'Accessories': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop',
      'Clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop',
      'Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      'Food': 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=400&fit=crop',
      'Beverages': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop',
      'Furniture': 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop',
      'Books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
      'Stationery': 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945b?w=400&h=400&fit=crop',
      'Tools': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    };
    
    return imageMap[category] || imageMap.default;
  };

  // Filter products based on search query - FIXED with safe array handling
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => {
        if (!product) return false;
        const searchTerm = searchQuery.toLowerCase();
        return (
          (product.description && product.description.toLowerCase().includes(searchTerm)) ||
          (product.category && product.category.toLowerCase().includes(searchTerm)) ||
          (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
          (product.id && product.id.toString().includes(searchTerm))
        );
      })
    : [];

  // Calculate statistics with safe array handling
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const inStockCount = Array.isArray(products) ? products.filter(p => p && (Number(p.stockQuantity) || 0) > 5).length : 0;
  const lowStockCount = Array.isArray(products) ? products.filter(p => p && (Number(p.stockQuantity) || 0) > 0 && (Number(p.stockQuantity) || 0) <= 5).length : 0;
  const outOfStockCount = Array.isArray(products) ? products.filter(p => p && (Number(p.stockQuantity) || 0) === 0).length : 0;
  
  const totalInventoryValue = Array.isArray(products) 
    ? products.reduce((sum, product) => {
        if (!product) return sum;
        const purchasePrice = Number(product.purchasePrice) || 0;
        const stockQuantity = Number(product.stockQuantity) || 0;
        return sum + (purchasePrice * stockQuantity);
      }, 0)
    : 0;
    
  const totalPotentialRevenue = Array.isArray(products) 
    ? products.reduce((sum, product) => {
        if (!product) return sum;
        const salesPrice = Number(product.salesPrice) || 0;
        const stockQuantity = Number(product.stockQuantity) || 0;
        return sum + (salesPrice * stockQuantity);
      }, 0)
    : 0;
    
  const totalPotentialProfit = totalPotentialRevenue - totalInventoryValue;

  // Event handlers
  const handleNavigation = (item) => {
    if (item.isLogout) {
      clearUserData();
      navigate('/login');
      setSidebarOpen(false);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    
    if (item.requiresAuth && !accessToken) {
      navigate('/login');
      setSidebarOpen(false);
      return;
    }

    navigate(item.path);
    setSidebarOpen(false);
  };

  const handleViewDetails = (productId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate('/login');
      return;
    }
    navigate(`/products/${productId}`);
  };

  const handleAddProduct = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate('/login');
      return;
    }
    navigate("/products/add");
  };

  const handleEditProduct = (productId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate('/login');
      return;
    }
    navigate(`/products/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate('/login');
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Update products state safely
      setProducts(prevProducts => {
        if (!Array.isArray(prevProducts)) return [];
        return prevProducts.filter(product => product && product.id !== productId);
      });
      
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchProducts();
  };

  const handleExportData = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate('/login');
      return;
    }
    
    if (!Array.isArray(filteredProducts) || filteredProducts.length === 0) {
      alert("No products to export");
      return;
    }
    
    const headers = ["Name", "Category", "SKU", "Status", "Quantity", "Buy Price", "Sell Price"];
    const csvData = filteredProducts.map(product => {
      if (!product) return [];
      const statusBadge = getStatusBadge(product.stockQuantity);
      return [
        product.description || "N/A",
        product.category || "N/A",
        product.sku || "N/A",
        statusBadge.status,
        product.stockQuantity || 0,
        product.purchasePrice || 0,
        product.salesPrice || 0
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // If no user data, show loading
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your products...</p>
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fadeIn"
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
              <p className="text-blue-200 text-xs mt-1">Inventory Management</p>
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

          {/* Sidebar Footer */}
          <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-xl">
            <div className="text-xs text-blue-200 space-y-2">
              <div className="flex justify-between">
                <span>Products:</span>
                <span className="font-bold">{totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span>In Stock:</span>
                <span className="text-green-300">{inStockCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Low Stock:</span>
                <span className="text-yellow-300">{lowStockCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Has Images:</span>
                <span className="text-blue-300">
                  {Array.isArray(products) ? products.filter(p => p && p.image).length : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center">
              <div className="w-8 h-1 bg-blue-700 rounded-full mx-auto mb-3"></div>
              <p className="text-blue-200 text-sm">Products Module</p>
              <p className="text-blue-300 text-xs mt-1">v2.1.0 • Real-time Data</p>
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
                    <FiChevronRight size={14} />
                    <span className="text-blue-600 font-medium">Products</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Products Management</h1>
                    <div className="flex items-center mt-2">
                      <FiCalendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm disabled:opacity-50"
                    >
                      <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span className="text-sm font-medium">Refresh</span>
                    </button>
                    
                    {/* User Info Display */}
                    <div className="flex items-center space-x-3">
                      <div className="hidden sm:block text-right">
                        <p className="font-semibold text-gray-800 truncate max-w-[150px]">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{getUserRole()}</p>
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
                    Manage Your Products, {getUserDisplayName()}! <span className="text-yellow-300">📦</span>
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
                      {totalProducts} Products
                    </span>
                  </div>
                  <p className="text-blue-100">
                    Track inventory, manage stock levels, and analyze product performance in real-time.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-500 bg-opacity-30 rounded-full flex items-center justify-center">
                    <FiBox size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Search and Actions Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by product name, SKU, category, or status..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                    <FiFilter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filter</span>
                  </button>
                  
                  <button 
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                  >
                    <FiDownload className="h-4 w-4" />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                  
                  <button 
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add Product</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Product Inventory</h2>
                    <p className="text-gray-600 text-sm mt-2">
                      {filteredProducts.length} of {totalProducts} products • 
                      <span className="ml-2 font-medium">Managed by: {getUserDisplayName()}</span>
                      {hasUserName() && (
                        <span className="text-gray-500"> ({getUserFullName()})</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleAddProduct}
                      className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Add New Product"
                    >
                      <FiPlus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Loading Products</h3>
                    <p className="text-gray-500">Fetching your product inventory...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    if (!product) return null;
                    
                    const statusBadge = getStatusBadge(product.stockQuantity);
                    const purchasePrice = Number(product.purchasePrice) || 0;
                    const salesPrice = Number(product.salesPrice) || 0;
                    const stockQuantity = Number(product.stockQuantity) || 0;
                    
                    const profitPerUnit = salesPrice - purchasePrice;
                    const totalBuyValue = purchasePrice * stockQuantity;
                    const totalSellValue = salesPrice * stockQuantity;
                    const totalProfit = profitPerUnit * stockQuantity;
                    const profitMargin = profitPerUnit > 0 && purchasePrice > 0 
                      ? Math.round((profitPerUnit / purchasePrice) * 100) 
                      : 0;
                    
                    const productImage = getProductImage(product);

                    return (
                      <div key={product.id || Math.random()} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                        {/* Product Header */}
                        <div className="flex flex-col xl:flex-row xl:items-start gap-6 mb-6">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={product.description || "Product image"}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                      console.error("Image failed to load:", productImage);
                                      e.target.style.display = 'none';
                                      if (e.target.nextElementSibling) {
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                {!productImage || (
                                  <div className="hidden flex-col items-center justify-center text-gray-400 w-full h-full">
                                    <FiImage size={32} />
                                    <span className="text-xs mt-2 text-center px-2">Image Failed</span>
                                  </div>
                                )}
                                {!productImage && (
                                  <div className="flex flex-col items-center justify-center text-gray-400">
                                    <FiImage size={32} />
                                    <span className="text-xs mt-2 text-center px-2">No Image</span>
                                  </div>
                                )}
                              </div>
                              {productImage && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                  📷
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-gray-900 text-xl">
                                      {product.description || "Unnamed Product"}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${statusBadge.bgColor} ${statusBadge.textColor}`}>
                                      <span>{statusBadge.icon}</span>
                                      {statusBadge.status}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                      {product.category || "Uncategorized"}
                                    </span>
                                    {product.sku && (
                                      <span className="text-gray-500">
                                        SKU: <span className="font-mono font-semibold">{product.sku}</span>
                                      </span>
                                    )}
                                    <span className="text-gray-500">
                                      ID: <span className="font-medium">{product.id || "N/A"}</span>
                                    </span>
                                    {productImage && (
                                      <span className="text-gray-500">
                                        <FiImage className="inline mr-1" size={12} />
                                        Has Image
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => product.id && handleEditProduct(product.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-medium transition-colors"
                                  >
                                    <FiEdit className="h-4 w-4" />
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => product.id && handleViewDetails(product.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl text-sm font-medium transition-colors shadow-sm"
                                  >
                                    <FiEye className="h-4 w-4" />
                                    View Details
                                  </button>
                                  <button 
                                    onClick={() => product.id && handleDeleteProduct(product.id)}
                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Delete Product"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-2">Pricing</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Buy:</span>
                                <span className="font-bold text-gray-800">{formatCurrency(purchasePrice)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Sell:</span>
                                <span className="font-bold text-gray-800">{formatCurrency(salesPrice)}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-gray-600">Profit/Unit:</span>
                                <span className={`font-bold ${profitPerUnit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(profitPerUnit)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-2">Stock Information</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Quantity:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-800 text-xl">{stockQuantity}</span>
                                  {stockQuantity > 0 && stockQuantity <= 5 && (
                                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Reorder Soon</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Value:</span>
                                <span className="font-bold text-blue-600">{formatCurrency(totalBuyValue)}</span>
                              </div>
                              {stockQuantity === 0 && (
                                <div className="pt-2 border-t border-gray-200">
                                  <span className="text-xs text-red-600 font-medium">⚠️ Contact supplier for restock</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-2">Sales Projection</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Sell Value:</span>
                                <span className="font-bold text-gray-800">{formatCurrency(totalSellValue)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Profit:</span>
                                <span className={`font-bold ${totalProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(totalProfit)}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Margin:</span>
                                  <span className={`font-bold ${profitMargin > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {profitMargin}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-2">Quick Actions</p>
                            <div className="space-y-3">
                              <button 
                                onClick={() => product.id && handleEditProduct(product.id)}
                                className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Update Stock
                              </button>
                              <button className="w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                                View Sales History
                              </button>
                              <button 
                                onClick={handleExportData}
                                className="w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                              >
                                Generate Report
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Product Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="h-3 w-3" />
                              Added: {formatDate(product.createdAt)}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <FiCalendar className="h-3 w-3" />
                              Updated: {formatDate(product.updatedAt)}
                            </span>
                            {product.image && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1 text-blue-600">
                                  <FiImage className="h-3 w-3" />
                                  Image: {typeof product.image === 'string' ? product.image.split('/').pop() : 'Yes'}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <span className="flex items-center gap-1">
                              <FiUser className="h-3 w-3" />
                              Managed by: {getUserDisplayName()}
                              {hasUserName() && (
                                <span className="ml-1">({getUserFullName()})</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-gray-400 text-7xl mb-6">📦</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                      {searchQuery ? "No products found" : "No products available"}
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      {searchQuery 
                        ? `No products match "${searchQuery}". Try a different search term.`
                        : Array.isArray(products) && products.length === 0
                          ? "Your product inventory is empty. Add your first product to get started."
                          : "There was an error loading products. Please refresh the page."
                      }
                    </p>
                    {(!searchQuery || (Array.isArray(products) && products.length === 0)) && (
                      <button
                        onClick={handleAddProduct}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <FiPlus className="h-5 w-5" />
                        <span className="font-semibold">Add Your First Product</span>
                      </button>
                    )}
                    {searchQuery && Array.isArray(products) && products.length > 0 && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <FiRefreshCw className="h-5 w-5" />
                        <span className="font-semibold">Clear Search</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Table Footer */}
              <div className="px-6 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Showing <span className="font-semibold">{filteredProducts.length}</span> of{" "}
                      <span className="font-semibold">{totalProducts}</span> products
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Inventory Value: <span className="font-semibold">{formatCurrency(totalInventoryValue)}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs">In Stock ({inStockCount})</span>
                        <span className="mx-1">•</span>
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="text-xs">Low ({lowStockCount})</span>
                        <span className="mx-1">•</span>
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-xs">Out ({outOfStockCount})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-4 py-2 text-gray-600 hover:bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <FiChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 rounded-lg text-sm">
                        1
                      </button>
                      <button 
                        className="px-4 py-2 text-gray-600 hover:bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        Next
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                <span>Products Management</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiUser size={10} />
                  {getUserDisplayName()}
                </span>
                {hasUserName() && (
                  <>
                    <span>•</span>
                    <span>{getUserFullName()}</span>
                  </>
                )}
                <span>•</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {getUserRole()}
                </span>
                <span>•</span>
                <span className="text-green-600">
                  ✓ Live Data
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl transform transition-all duration-300">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <div>
                <div className="text-gray-800 font-semibold text-center">Refreshing Products</div>
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
      flex items-center w-full gap-3 p-3 rounded-lg transition-all duration-200
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

export default Products;