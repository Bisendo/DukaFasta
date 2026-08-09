import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiEdit,
  FiKey,
  FiSearch,
  FiRefreshCw,
  FiArrowLeft,
  FiAlertCircle,
  FiX,
  FiTrash2,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiEye,
  FiEyeOff,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiLogIn,
  FiInfo,
  FiShield,
  FiBarChart2
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:4001";

// Custom Modal Components
const Modal = ({ isOpen, onClose, children, title, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
  if (!isOpen) return null;

  const typeClasses = {
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
    success: "bg-green-50 border-green-200",
    info: "bg-blue-50 border-blue-200"
  };

  const buttonClasses = {
    warning: "bg-yellow-600 hover:bg-yellow-700",
    danger: "bg-red-600 hover:bg-red-700",
    success: "bg-green-600 hover:bg-green-700",
    info: "bg-blue-600 hover:bg-blue-700"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className={`p-4 rounded-lg mb-6 ${typeClasses[type]} border`}>
            <div className="flex items-start">
              {type === "warning" && <FiAlertCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={24} />}
              {type === "danger" && <FiAlertCircle className="text-red-600 mt-0.5 mr-3 flex-shrink-0" size={24} />}
              {type === "success" && <FiCheckCircle className="text-green-600 mt-0.5 mr-3 flex-shrink-0" size={24} />}
              {type === "info" && <FiInfo className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={24} />}
              <div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-gray-600 mt-2 whitespace-pre-line">{message}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg ${buttonClasses[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerShopkeepers = () => {
  const navigate = useNavigate();
  
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newShopkeeper, setNewShopkeeper] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedShopkeepers, setSelectedShopkeepers] = useState([]);
  const [userData, setUserData] = useState(null);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    onConfirm: () => {}
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState("");

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("accessToken");
  };

  // Initialize component
  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUserData(userObj);
      
      // Check if user is owner
      if (userObj.role !== 'owner') {
        setMessage({
          type: "error",
          text: "Only business owners can access this page."
        });
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
    }

    await loadShopkeepers();
  };

  // Load shopkeepers from API
  const loadShopkeepers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication required. Please login again."
        });
        navigate('/login');
        return;
      }

      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/auth/shopkeepers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (endpointError) {
        response = await axios.get(`${API_BASE_URL}/users?role=shopkeeper`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      let shopkeepersData = [];
      
      if (response.data.shopkeepers) {
        shopkeepersData = response.data.shopkeepers;
      } else if (response.data.data) {
        shopkeepersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        shopkeepersData = response.data;
      } else if (response.data.users) {
        shopkeepersData = response.data.users;
      }

      // Filter to only show shopkeepers created by this owner
      const currentUserId = userData?.id || localStorage.getItem("userId");
      if (currentUserId) {
        shopkeepersData = shopkeepersData.filter(sk => 
          sk.ownerId === parseInt(currentUserId) || sk.createdBy === parseInt(currentUserId)
        );
      }

      setShopkeepers(shopkeepersData);

      if (shopkeepersData.length === 0) {
        setMessage({
          type: "info",
          text: "No shopkeepers found. Create your first shopkeeper to get started."
        });
      }

    } catch (error) {
      console.error("Error loading shopkeepers:", error);
      
      if (error.response?.status === 401) {
        setMessage({
          type: "error",
          text: "Session expired. Please login again."
        });
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setMessage({
          type: "error",
          text: "Access denied. Only business owners can view shopkeepers."
        });
      } else {
        setMessage({
          type: "warning",
          text: "Could not load shopkeepers. Please try again."
        });
        setShopkeepers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle create shopkeeper
  const handleCreateShopkeeper = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newShopkeeper.password !== newShopkeeper.confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match"
      });
      return;
    }

    if (newShopkeeper.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long"
      });
      return;
    }

    setCreating(true);
    setMessage({ type: "", text: "" });

    try {
      const token = getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const shopkeeperData = {
        firstName: newShopkeeper.firstName.trim(),
        lastName: newShopkeeper.lastName.trim(),
        email: newShopkeeper.email.trim().toLowerCase(),
        phoneNumber: newShopkeeper.phoneNumber.trim(),
        password: newShopkeeper.password
      };

      const response = await axios.post(
        `${API_BASE_URL}/auth/create-shopkeeper`,
        shopkeeperData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message || response.data.shopkeeper) {
        const createdShopkeeper = response.data.shopkeeper || shopkeeperData;
        
        // Reset form
        setNewShopkeeper({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: ""
        });
        
        // Close modal
        setShowCreateModal(false);
        
        // Show success modal with details
        setSuccessDetails({
          name: `${createdShopkeeper.firstName} ${createdShopkeeper.lastName}`,
          email: createdShopkeeper.email,
          phone: createdShopkeeper.phoneNumber,
          password: createdShopkeeper.password || 'Sent via email'
        });
        setShowSuccessModal(true);

        // Reload shopkeepers list
        await loadShopkeepers();

      } else {
        throw new Error(response.data.error || "Failed to create shopkeeper");
      }

    } catch (error) {
      console.error("Error creating shopkeeper:", error);
      
      let errorMessage = "Failed to create shopkeeper. Please try again.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Validation error. Please check your input.";
        } else if (error.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (error.response.status === 403) {
          errorMessage = "Only business owners can create shopkeepers.";
        } else if (error.response.status === 409) {
          errorMessage = "Email already registered. Please use a different email.";
        } else {
          errorMessage = `Error: ${error.response.status} - ${error.response.data?.error || ''}`;
        }
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setCreating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setNewShopkeeper({
      ...newShopkeeper,
      [e.target.name]: e.target.value
    });
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  // Filter shopkeepers based on search and status
  const filteredShopkeepers = shopkeepers.filter(shopkeeper => {
    const matchesSearch = searchQuery === "" || 
      shopkeeper.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shopkeeper.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shopkeeper.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shopkeeper.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && shopkeeper.status !== "inactive") ||
      (filterStatus === "inactive" && shopkeeper.status === "inactive");
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const activeShopkeepers = shopkeepers.filter(s => s.status !== "inactive");
  const inactiveShopkeepers = shopkeepers.filter(s => s.status === "inactive");

  // View shopkeeper details
  const viewShopkeeperDetails = (shopkeeper) => {
    setSelectedShopkeeper(shopkeeper);
    setShowDetailsModal(true);
  };

  // Reset shopkeeper password
  const confirmResetPassword = (shopkeeper) => {
    setShowConfirmDialog({
      isOpen: true,
      type: "warning",
      title: "Reset Password",
      message: `Are you sure you want to reset the password for:\n\n${shopkeeper.firstName} ${shopkeeper.lastName}\n(${shopkeeper.email})\n\nA new password will be generated and sent to their email.`,
      onConfirm: async () => {
        try {
          const token = getToken();
          const response = await axios.post(
            `${API_BASE_URL}/auth/reset-shopkeeper-password`,
            { shopkeeperId: shopkeeper.id },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (response.data.success || response.data.message) {
            setMessage({
              type: "success",
              text: `✅ Password Reset Successful!\n\nA new password has been sent to:\n${shopkeeper.email}\n\nPlease inform the shopkeeper to check their email.`
            });
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          setMessage({
            type: "error",
            text: "Failed to reset password. Please try again."
          });
        }
      }
    });
  };

  // Toggle shopkeeper status
  const confirmToggleStatus = (shopkeeper) => {
    const newStatus = shopkeeper.status === 'inactive' ? 'active' : 'inactive';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    const statusText = newStatus === 'active' ? 'Active 🟢' : 'Inactive 🔴';
    
    setShowConfirmDialog({
      isOpen: true,
      type: shopkeeper.status === 'inactive' ? "success" : "warning",
      title: shopkeeper.status === 'inactive' ? "Activate Shopkeeper" : "Deactivate Shopkeeper",
      message: `Are you sure you want to ${action} this shopkeeper?\n\nShopkeeper: ${shopkeeper.firstName} ${shopkeeper.lastName}\nNew Status: ${statusText}\n\nThis will ${action === 'activate' ? 'allow' : 'prevent'} them from accessing their dashboard.`,
      onConfirm: async () => {
        try {
          const token = getToken();
          const response = await axios.put(
            `${API_BASE_URL}/auth/shopkeepers/${shopkeeper.id}/status`,
            { status: newStatus },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (response.data.success || response.data.message) {
            setMessage({
              type: "success",
              text: `✅ Shopkeeper ${action}d successfully!\n\n${shopkeeper.firstName} ${shopkeeper.lastName} is now ${newStatus}.`
            });
            await loadShopkeepers();
          }
        } catch (error) {
          console.error("Error updating status:", error);
          setMessage({
            type: "error",
            text: "Failed to update status. Please try again."
          });
        }
      }
    });
  };

  // Handle shopkeeper selection
  const handleSelectShopkeeper = (shopkeeperId) => {
    if (selectedShopkeepers.includes(shopkeeperId)) {
      setSelectedShopkeepers(selectedShopkeepers.filter(id => id !== shopkeeperId));
    } else {
      setSelectedShopkeepers([...selectedShopkeepers, shopkeeperId]);
    }
  };

  // Select all shopkeepers
  const handleSelectAll = () => {
    if (selectedShopkeepers.length === filteredShopkeepers.length) {
      setSelectedShopkeepers([]);
    } else {
      setSelectedShopkeepers(filteredShopkeepers.map(sk => sk.id));
    }
  };

  // Delete selected shopkeepers
  const confirmDeleteSelected = () => {
    if (selectedShopkeepers.length === 0) return;
    
    const count = selectedShopkeepers.length;
    const shopkeeperNames = shopkeepers
      .filter(sk => selectedShopkeepers.includes(sk.id))
      .map(sk => `${sk.firstName} ${sk.lastName}`)
      .join('\n• ');
    
    setShowConfirmDialog({
      isOpen: true,
      type: "danger",
      title: "Delete Shopkeepers",
      message: `Are you sure you want to delete ${count} shopkeeper(s)?\n\nThis action cannot be undone!\n\nShopkeepers to delete:\n• ${shopkeeperNames}`,
      onConfirm: async () => {
        try {
          const token = getToken();
          const response = await axios.post(
            `${API_BASE_URL}/auth/shopkeepers/delete-multiple`,
            { shopkeeperIds: selectedShopkeepers },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (response.data.success || response.data.message) {
            setMessage({
              type: "success",
              text: `✅ ${count} shopkeeper(s) deleted successfully!`
            });
            setSelectedShopkeepers([]);
            await loadShopkeepers();
          }
        } catch (error) {
          console.error("Error deleting shopkeepers:", error);
          setMessage({
            type: "error",
            text: "Failed to delete shopkeepers. Please try again."
          });
        }
      }
    });
  };

  // Export shopkeepers data
  const exportShopkeepers = () => {
    const dataToExport = filteredShopkeepers.map(sk => ({
      Name: `${sk.firstName} ${sk.lastName}`,
      Email: sk.email,
      Phone: sk.phoneNumber || '',
      Status: sk.status || 'active',
      'Created Date': sk.createdAt ? new Date(sk.createdAt).toLocaleDateString() : '',
      'Owner ID': sk.ownerId || ''
    }));

    if (dataToExport.length === 0) {
      setMessage({
        type: "warning",
        text: "No data to export."
      });
      return;
    }

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopkeepers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setMessage({
      type: "success",
      text: "✅ Shopkeepers data exported successfully!"
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    await loadShopkeepers();
    setMessage({
      type: "success",
      text: "Shopkeepers list refreshed successfully!"
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user info
  const getUserDisplayName = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Owner';
    }
    return "Owner";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message Display */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              {message.type === 'success' && <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />}
              {message.type === 'error' && <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />}
              <p className="text-sm font-medium whitespace-pre-line">{message.text}</p>
            </div>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/owner-dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shopkeepers Management</h1>
                <p className="text-sm text-gray-600">
                  Manage your shopkeepers and their access
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow"
              >
                <FiUserPlus className="h-4 w-4" />
                <span>Create Shopkeeper</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shopkeepers</p>
                <p className="text-3xl font-bold text-gray-900">{shopkeepers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{activeShopkeepers.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{inactiveShopkeepers.length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiClock className="text-red-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Owner</p>
                <p className="text-lg font-bold text-gray-900 truncate">{getUserDisplayName()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiKey className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shopkeepers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedShopkeepers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={confirmDeleteSelected}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center transition-colors"
                  >
                    <FiTrash2 className="mr-2" />
                    Delete ({selectedShopkeepers.length})
                  </button>
                </div>
              )}

              <button
                onClick={exportShopkeepers}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center transition-colors"
              >
                <FiDownload className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Shopkeepers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading shopkeepers...</span>
            </div>
          ) : filteredShopkeepers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedShopkeepers.length === filteredShopkeepers.length && filteredShopkeepers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shopkeeper
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Information
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredShopkeepers.map((shopkeeper) => (
                      <tr key={shopkeeper.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedShopkeepers.includes(shopkeeper.id)}
                            onChange={() => handleSelectShopkeeper(shopkeeper.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-semibold mr-3">
                              {shopkeeper.firstName?.charAt(0)}{shopkeeper.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {shopkeeper.firstName} {shopkeeper.lastName}
                              </p>
                              <p className="text-sm text-gray-500">ID: {shopkeeper.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                              <a 
                                href={`mailto:${shopkeeper.email}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {shopkeeper.email}
                              </a>
                            </div>
                            {shopkeeper.phoneNumber && (
                              <div className="flex items-center">
                                <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                                <a 
                                  href={`tel:${shopkeeper.phoneNumber}`}
                                  className="text-sm text-gray-600"
                                >
                                  {shopkeeper.phoneNumber}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            shopkeeper.status === 'inactive' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {shopkeeper.status === 'inactive' ? (
                              <>
                                <FiClock className="mr-1" />
                                Inactive
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="mr-1" />
                                Active
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(shopkeeper.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewShopkeeperDetails(shopkeeper)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center transition-colors"
                            >
                              <FiEye className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => confirmResetPassword(shopkeeper)}
                              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center transition-colors"
                            >
                              <FiKey className="mr-1" />
                              Reset Pass
                            </button>
                            <button
                              onClick={() => confirmToggleStatus(shopkeeper)}
                              className={`px-3 py-1 text-sm rounded flex items-center transition-colors ${
                                shopkeeper.status === 'inactive'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {shopkeeper.status === 'inactive' ? (
                                <>
                                  <FiEye className="mr-1" />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <FiEyeOff className="mr-1" />
                                  Deactivate
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    Showing {filteredShopkeepers.length} of {shopkeepers.length} shopkeepers
                    {searchQuery && ` (filtered by: "${searchQuery}")`}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Active: {activeShopkeepers.length}
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      Inactive: {inactiveShopkeepers.length}
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      Selected: {selectedShopkeepers.length}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FiUsers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No matching shopkeepers found' : 'No Shopkeepers Found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? 'Try a different search term or create a new shopkeeper.'
                  : 'You haven\'t created any shopkeepers yet.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow"
              >
                <FiUserPlus className="inline mr-2" />
                Create Your First Shopkeeper
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Shopkeeper Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => !creating && setShowCreateModal(false)}
        title="Create New Shopkeeper"
      >
        <form onSubmit={handleCreateShopkeeper}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newShopkeeper.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={creating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newShopkeeper.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={creating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={newShopkeeper.email}
                onChange={handleInputChange}
                required
                disabled={creating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                placeholder="shopkeeper@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={newShopkeeper.phoneNumber}
                onChange={handleInputChange}
                required
                disabled={creating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                placeholder="+255 123 456 789"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newShopkeeper.password}
                    onChange={handleInputChange}
                    required
                    disabled={creating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 pr-10 transition-colors"
                    placeholder="••••••••"
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={newShopkeeper.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={creating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiUserPlus className="mr-2" />
                  Create Shopkeeper
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> The shopkeeper will receive login credentials via email. 
            They can access their dashboard to manage inventory and sales.
          </p>
        </div>
      </Modal>

      {/* Shopkeeper Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Shopkeeper Details"
        size="lg"
      >
        {selectedShopkeeper && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {selectedShopkeeper.firstName?.charAt(0)}{selectedShopkeeper.lastName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedShopkeeper.firstName} {selectedShopkeeper.lastName}
                </h3>
                <p className="text-gray-600">ID: {selectedShopkeeper.id}</p>
                <p className="text-sm text-gray-500">Owner ID: {selectedShopkeeper.ownerId || 'N/A'}</p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedShopkeeper.status === 'inactive' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {selectedShopkeeper.status === 'inactive' ? 'Inactive' : 'Active'}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FiUser className="mr-2" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FiMail className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedShopkeeper.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedShopkeeper.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FiShield className="mr-2" />
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FiCalendar className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Created On</p>
                      <p className="font-medium">{formatDate(selectedShopkeeper.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiLogIn className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">
                        {selectedShopkeeper.lastLogin 
                          ? formatDate(selectedShopkeeper.lastLogin)
                          : 'Never logged in'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <FiBarChart2 className="mr-2" />
                Performance Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedShopkeeper.totalSales 
                      ? new Intl.NumberFormat("en-US").format(selectedShopkeeper.totalSales) + " Tsh"
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedShopkeeper.role || 'Shopkeeper'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {selectedShopkeeper.additionalInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                <p className="text-gray-600">{selectedShopkeeper.additionalInfo}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  confirmResetPassword(selectedShopkeeper);
                }}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center"
              >
                <FiKey className="mr-2" />
                Reset Password
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  confirmToggleStatus(selectedShopkeeper);
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  selectedShopkeeper.status === 'inactive'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {selectedShopkeeper.status === 'inactive' ? (
                  <>
                    <FiEye className="mr-2" />
                    Activate Account
                  </>
                ) : (
                  <>
                    <FiEyeOff className="mr-2" />
                    Deactivate Account
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="✅ Shopkeeper Created Successfully!"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Shopkeeper has been created successfully! Login credentials have been sent to their email.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Shopkeeper Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{successDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{successDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{successDetails.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temporary Password:</span>
                <span className="font-mono font-medium bg-yellow-100 px-2 py-1 rounded">
                  {successDetails.password}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Important Information</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Share these credentials securely with the shopkeeper</li>
              <li>• The shopkeeper should change their password on first login</li>
              <li>• They can access their dashboard at <code>/shopkeeper-login</code></li>
              <li>• Monitor their activity from your owner dashboard</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog.isOpen}
        onClose={() => setShowConfirmDialog({ ...showConfirmDialog, isOpen: false })}
        onConfirm={showConfirmDialog.onConfirm}
        title={showConfirmDialog.title}
        message={showConfirmDialog.message}
        type={showConfirmDialog.type}
        confirmText={showConfirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default OwnerShopkeepers;