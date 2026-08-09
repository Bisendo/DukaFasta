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
  FiPlus,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiCheck,
  FiSave,
  FiTrash2,
  FiPackage,
  FiTrendingUp,
  FiAlertCircle,
  FiImage,
  FiUpload
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

// Configure Axios base URL
axios.defaults.baseURL = API_BASE_URL;

const AddProductForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Form data matches the Sequelize model exactly
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    purchasePrice: "",
    salesPrice: "",
    stockQuantity: "",
  });

  // Get user data from localStorage on component mount
  useEffect(() => {
    // Set current date
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    // Check authentication and load user data
    const loadUserData = async () => {
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
            userType: localStorage.getItem("userType") || "admin",
            firstName: localStorage.getItem("firstName") || "",
            lastName: localStorage.getItem("lastName") || "",
            accessToken
          };
        }
        
        console.log("User data loaded:", user);
        
        // Set authorization header for axios
        axios.defaults.headers.common['accessToken'] = accessToken;
        
        // Also set Authorization header for Bearer token support
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        setUserData(user);
        
      } catch (error) {
        console.error("Error loading user data:", error);
        setAuthError("Failed to load user data. Please login again.");
        clearUserData();
        navigate("/login");
      }
    };

    loadUserData();
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
    delete axios.defaults.headers.common['accessToken'];
    delete axios.defaults.headers.common['Authorization'];
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
      active: location.pathname === '/products' || location.pathname === '/add-product',
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

  // Categories for dropdown
  const categories = [
    "Electronics",
    "Clothing & Fashion",
    "Home & Kitchen",
    "Books & Stationery",
    "Sports & Outdoors",
    "Health & Beauty",
    "Toys & Games",
    "Automotive",
    "Food & Beverages",
    "Office Supplies",
    "Garden & Outdoor",
    "Pet Supplies"
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview("");
  };

  const calculateProfit = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const sales = parseFloat(formData.salesPrice) || 0;
    if (purchase > 0 && sales > 0) {
      const profit = sales - purchase;
      const margin = (profit / purchase * 100).toFixed(1);
      return { profit, margin };
    }
    return { profit: 0, margin: 0 };
  };

  const { profit, margin } = calculateProfit();

  const calculateStockValue = () => {
    const quantity = parseInt(formData.stockQuantity) || 0;
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const sales = parseFloat(formData.salesPrice) || 0;
    
    const totalPurchaseValue = quantity * purchase;
    const totalSalesValue = quantity * sales;
    const totalProfit = quantity * profit;
    
    return { totalPurchaseValue, totalSalesValue, totalProfit };
  };

  // Save product to database using Axios
  const saveProductToDatabase = async (productData) => {
    try {
      console.log("Sending product data to API:", productData);
      
      // Get fresh token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found. Please login again.");
      }
      
      // Create axios instance with fresh headers
      const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'accessToken': accessToken,
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      
      // Add userId to product data from userData
      const productDataWithUser = {
        ...productData,
        userId: userData?.id || localStorage.getItem("userId")
      };
      
      // For FormData with file upload
      if (image) {
        const formDataToSend = new FormData();
        
        // Append all product data fields
        Object.keys(productDataWithUser).forEach(key => {
          if (productDataWithUser[key] !== undefined && productDataWithUser[key] !== null) {
            formDataToSend.append(key, productDataWithUser[key]);
          }
        });
        
        // Append image file
        formDataToSend.append('image', image);
        
        console.log("Sending FormData with image...");
        const response = await axiosInstance.post('/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        return response.data;
      } else {
        // For JSON data without file
        console.log("Sending JSON data without image...");
        const response = await axiosInstance.post('/products', productDataWithUser, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error("Axios error details:", error);
      
      if (error.response) {
        const { status, data } = error.response;
        console.error("Server response error:", data);
        
        if (status === 401) {
          // Token expired or invalid
          setAuthError("Session expired. Please login again.");
          clearUserData();
          throw new Error("Session expired. Please login again.");
        } else if (status === 403) {
          // Forbidden - user doesn't have permission
          throw new Error("You don't have permission to add products.");
        } else if (data && data.error) {
          // Server sent specific error message
          throw new Error(data.error);
        } else if (data && data.message) {
          throw new Error(data.message);
        } else {
          throw new Error(`Server error: ${status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response received from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || "Error setting up request");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous auth errors
    setAuthError("");
    
    // Validate form
    const requiredFields = ['description', 'category', 'purchasePrice', 'salesPrice', 'stockQuantity'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return value === undefined || value === null || value === "";
    });
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate that stock quantity is a valid integer
    const stockQty = parseInt(formData.stockQuantity);
    if (isNaN(stockQty) || stockQty < 0) {
      alert("Please enter a valid stock quantity (non-negative integer)");
      return;
    }

    // Validate that prices are valid numbers
    const purchasePrice = parseFloat(formData.purchasePrice);
    const salesPrice = parseFloat(formData.salesPrice);
    
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      alert("Please enter a valid purchase price (non-negative number)");
      return;
    }

    if (isNaN(salesPrice) || salesPrice < 0) {
      alert("Please enter a valid sales price (non-negative number)");
      return;
    }

    // Validate that sales price is higher than purchase price
    if (salesPrice <= purchasePrice) {
      alert("Sales price should be higher than purchase price to make a profit");
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare product data for database
      const productData = {
        description: formData.description,
        category: formData.category,
        purchasePrice: purchasePrice,
        salesPrice: salesPrice,
        stockQuantity: stockQty,
      };
      
      console.log("Product data to send:", productData);
      console.log("User ID:", userData?.id);
      
      // Save to database using Axios
      const savedProduct = await saveProductToDatabase(productData);
      
      console.log("Product saved successfully:", savedProduct);
      
      // Show success message
      setShowSuccess(true);
      setIsLoading(false);
      
      // Reset form
      setFormData({
        description: "",
        category: "",
        purchasePrice: "",
        salesPrice: "",
        stockQuantity: "",
      });
      
      // Clean up image preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImage(null);
      setImagePreview("");
      
      // Navigate to products page after delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/products");
      }, 3000);
      
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Check if it's an authentication error
      if (error.message.includes("Session expired") || 
          error.message.includes("not logged in") || 
          error.message.includes("token")) {
        setAuthError(error.message);
        alert(`${error.message} Redirecting to login...`);
        setTimeout(() => {
          clearUserData();
          navigate("/login");
        }, 2000);
      } else {
        alert(`Failed to save product: ${error.message}`);
      }
      
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      description: "",
      category: "",
      purchasePrice: "",
      salesPrice: "",
      stockQuantity: "",
    });
    
    // Clean up image preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview("");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US").format(value) + " Tsh";
  };

  // If no user data, show loading
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading product form...</p>
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

  const { totalPurchaseValue, totalSalesValue, totalProfit } = calculateStockValue();

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
                clearUserData();
                navigate("/login");
              }}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
            >
              Login Again
            </button>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FiCheck className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Product Added Successfully!</h3>
              <p className="text-gray-600 mb-2">
                Added by: <span className="font-semibold text-gray-800">{getUserFullName() || getUserDisplayName()}</span>
              </p>
              <p className="text-gray-600 mb-2">
                Role: <span className="font-semibold text-blue-600">{getUserRole()}</span>
              </p>
              <div className="my-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-gray-700 font-medium">
                  Product has been saved to inventory
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  User ID: <span className="font-mono font-bold">{userData?.id}</span>
                </p>
              </div>
              <p className="text-gray-600 mb-6">
                You will be redirected to the products page shortly.
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate("/products");
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
              >
                View Products
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

          <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-xl">
            <p className="text-xs text-blue-200 mb-2 font-medium">Session Status:</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Token:</span>
                <span className={localStorage.getItem("accessToken") ? "text-green-300" : "text-red-300"}>
                  {localStorage.getItem("accessToken") ? "✓ Valid" : "✗ Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">User ID:</span>
                <span className="text-blue-200">{userData?.id || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">User Type:</span>
                <span className="text-blue-200">{getUserRole()}</span>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center">
              <div className="w-8 h-1 bg-blue-700 rounded-full mx-auto mb-3"></div>
              <p className="text-blue-200 text-sm">Add Product Module</p>
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
                    <span>Products</span>
                    <span className="mx-1">›</span>
                    <span className="text-blue-600 font-medium">Add Product</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Add New Product</h1>
                    <div className="flex items-center mt-2">
                      <FiCalendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{currentDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleRefresh}
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
                    Add New Product, {getUserDisplayName()}! <span className="text-yellow-300">✨</span>
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
                  </div>
                  <p className="text-blue-100">
                    Fill in the product details below. All fields marked with <span className="text-red-300">*</span> are required.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-500 bg-opacity-30 rounded-full flex items-center justify-center">
                    <FiPlus size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
              {/* Product Creator Info */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <FiUser className="text-blue-600" size={20} />
                    </div>
                    Product Creator Information
                  </h2>
                  <span className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                    Current Session
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-lg text-gray-800">{getUserDisplayName()}</p>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          {getUserRole()}
                        </span>
                      </div>
                      {hasUserName() && (
                        <p className="text-sm text-gray-600">{getUserFullName()}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{userData?.email || "user@example.com"}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        User ID: {userData?.id}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <FiCalendar className="text-blue-600" size={18} />
                      <p className="font-semibold text-gray-800">Creation Details</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="font-medium text-gray-800">{currentDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-medium text-gray-800">
                          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Active Session
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <FiPackage className="text-blue-600" size={20} />
                  </div>
                  Product Information
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter quantity"
                      min="0"
                      step="1"
                      required
                    />
                    <p className="text-gray-500 text-sm mt-2">Number of units available in stock</p>
                  </div>

                  {/* Product Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the product features, specifications, and benefits..."
                      rows={4}
                      required
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      Detailed descriptions help customers make informed decisions
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Image */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <FiImage className="text-purple-600" size={20} />
                  </div>
                  Product Image
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Product Image
                    </label>
                    <p className="text-gray-500 text-sm mb-4">
                      Upload a single image for the product. Recommended size: 800x800px. Max file size: 5MB.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image Preview */}
                      <div className="w-full md:w-1/3">
                        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                          {imagePreview ? (
                            <div className="relative w-full h-full group">
                              <img
                                src={imagePreview}
                                alt="Product preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 shadow-lg"
                                title="Remove image"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center p-8">
                              <FiImage className="text-gray-400 mx-auto mb-3" size={48} />
                              <p className="text-gray-500 text-sm">No image selected</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Upload Area */}
                      <div className="flex-1">
                        <label className="block w-full h-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
                          <div className="flex flex-col items-center justify-center text-center">
                            <FiUpload className="text-gray-400 group-hover:text-blue-500 mb-4" size={32} />
                            <span className="text-lg font-medium text-gray-500 group-hover:text-blue-600 mb-2">
                              {image ? "Replace Image" : "Click to upload"}
                            </span>
                            <span className="text-sm text-gray-400 mb-1">or drag and drop</span>
                            <span className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>
                        </label>
                        
                        {image && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  {image.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(image.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={removeImage}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg">
                    <FiDollarSign className="text-emerald-600" size={20} />
                  </div>
                  Pricing Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Purchase Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Purchase Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-500 font-medium">Tsh</div>
                      <input
                        type="number"
                        name="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <p className="text-gray-500 text-sm mt-2">Cost per unit from supplier</p>
                  </div>

                  {/* Sales Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sales Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-500 font-medium">Tsh</div>
                      <input
                        type="number"
                        name="salesPrice"
                        value={formData.salesPrice}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <p className="text-gray-500 text-sm mt-2">Selling price to customers</p>
                  </div>
                </div>

                {/* Profit & Value Calculations */}
                {(profit > 0 || margin > 0 || totalPurchaseValue > 0) && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiTrendingUp className="text-blue-600" />
                      Financial Analysis
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Profit per Unit</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(profit)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                        <p className="text-xl font-bold text-blue-600">
                          {margin}%
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Inventory Value</p>
                        <p className="text-xl font-bold text-gray-800">
                          {formatCurrency(totalPurchaseValue)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Potential Revenue</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatCurrency(totalSalesValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stock Status Preview */}
                {formData.stockQuantity && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <FiAlertCircle className="text-gray-600" />
                      <span className="font-semibold text-gray-700">Stock Status Preview</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-lg font-medium ${
                        parseInt(formData.stockQuantity) > 5 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : parseInt(formData.stockQuantity) > 0
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {parseInt(formData.stockQuantity) > 5 
                          ? '🟢 Available'
                          : parseInt(formData.stockQuantity) > 0
                          ? '🟡 Low Stock'
                          : '🔴 Out of Stock'
                        }
                      </div>
                      <span className="text-sm text-gray-600">
                        {formData.stockQuantity} units in stock
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave size={20} />
                        <span>Save Product</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={clearForm}
                    disabled={isLoading}
                    className="flex-1 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
                  >
                    Clear Form
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/products")}
                    disabled={isLoading}
                    className="flex-1 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    Cancel & Return
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Note:</span> All fields marked with <span className="text-red-500">*</span> are required.
                      Your product will be saved under your account: <span className="font-semibold text-gray-700">{getUserDisplayName()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiUser className="text-gray-400" size={14} />
                      <span>Adding as: {getUserRole()} (ID: {userData?.id})</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
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
                <span>Add Product Form</span>
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
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <div>
                <div className="text-gray-800 font-semibold text-center">Saving Product</div>
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

export default AddProductForm;