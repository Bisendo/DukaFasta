import { useState, useEffect } from "react";
import { FiMinus, FiPlus, FiMenu, FiUsers, FiSettings, FiLogOut,FiHome ,FiBox,FiHelpCircle,FiChevronDown ,FiShoppingCart} from "react-icons/fi";
import { X} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom";

export default function SalesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "JBL Headsets",
      price: 300000,
      stock: 30,
      qty: 2,
      image: "https://images.unsplash.com/photo-1518443895914-5b9d37b1c71f",
    },
    {
      id: 2,
      name: "Speaker",
      price: 120000,
      stock: 10,
      qty: 4,
      image: "https://images.unsplash.com/photo-1585386959984-a41552262d42",
    },
    {
      id: 3,
      name: "JBL Speaker",
      price: 650000,
      stock: 20,
      qty: 0,
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
    },
    {
      id: 4,
      name: "Samsung TV",
      price: 2500000,
      stock: 40,
      qty: 0,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
    },
  ]);

  // Check authentication and get user data
  useEffect(() => {
    // Set current date
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    // Check authentication
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    // Get user data from localStorage
    const userDataFromStorage = {
      firstName: localStorage.getItem("firstName") || "",
      lastName: localStorage.getItem("lastName") || "",
      email: localStorage.getItem("email") || "",
      userType: localStorage.getItem("userType") || "User",
      userId: localStorage.getItem("userId") || "",
    };

    console.log("User data from localStorage:", userDataFromStorage);
    
    if (userDataFromStorage.firstName || userDataFromStorage.lastName || userDataFromStorage.email) {
      setUserData(userDataFromStorage);
    }
  }, [navigate]);

  const updateQty = (id, type) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              qty:
                type === "inc"
                  ? Math.min(p.qty + 1, p.stock)
                  : Math.max(p.qty - 1, 0),
            }
          : p
      )
    );
  };

  const totalProducts = products.filter((p) => p.qty > 0).length;
  const totalUnits = products.reduce((sum, p) => sum + p.qty, 0);
  const totalPrice = products.reduce((sum, p) => sum + p.qty * p.price, 0);

  const menuItems = [
    { name: "Dashboard", path: "/owner-dashboard", icon: <FiHome />, active: location.pathname === "/owner-dashboard" },
    { name: "Sales", path: "/sales", icon: <FiShoppingCart />, active: location.pathname === "/sales" },
    { name: "Products", path: "/products", icon: <FiBox />, active: location.pathname === "/products" },
    { name: "Users", path: "/users", icon: <FiUsers />, active: location.pathname === "/users" },
    { name: "Help center", path: "/help", icon: <FiHelpCircle />, active: location.pathname === "/help" },
    { name: "Logout", path: "/login", icon: <FiLogOut />, active: false, isLogout: true },
  ];

  const handleNavigation = (path, isLogout = false) => {
    if (isLogout) {
      // Handle logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("email");
      localStorage.removeItem("userType");
      setUserData(null);
    }
    navigate(path);
    setSidebarOpen(false);
  };

  // Get user's full name
  const getUserFullName = () => {
    if (!userData) return "";
    
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return firstName || lastName || "";
  };

  // Get user display name
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

  // Get user role
  const getUserRole = () => {
    if (!userData) return "User";
    
    const userType = userData.userType;
    
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
        return userType || "User";
    }
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

  const handleAddOrder = () => {
    const selectedProducts = products.filter(p => p.qty > 0);
    
    if (selectedProducts.length === 0) {
      alert("Please select at least one product to add to order");
      return;
    }

    const orderData = {
      products: selectedProducts,
      totalProducts,
      totalUnits,
      totalPrice,
      timestamp: new Date().toISOString(),
      status: "pending",
      createdBy: userData?.email || "Unknown",
      createdByName: getUserFullName() || "Unknown User"
    };

    console.log("Order created:", orderData);
    
    alert(`Order created successfully!\nTotal: ${totalPrice.toLocaleString()} Tsh\nProducts: ${totalProducts}\nCreated by: ${getUserDisplayName()}`);
    
    setProducts(prev => prev.map(p => ({ ...p, qty: 0 })));
  };

  const handleSaveDraft = () => {
    const selectedProducts = products.filter(p => p.qty > 0);
    
    if (selectedProducts.length === 0) {
      alert("No items selected to save as draft");
      return;
    }

    const draftData = {
      products: selectedProducts,
      totalProducts,
      totalUnits,
      totalPrice,
      savedAt: new Date().toISOString(),
      savedBy: getUserDisplayName()
    };

    localStorage.setItem('orderDraft', JSON.stringify(draftData));
    alert("Order saved as draft successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <FiMenu size={24} />}
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
          lg:translate-x-0 flex flex-col
        `}>
          {/* Sidebar Header with Close Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Inventory System</h2>
              <p className="text-blue-300 text-sm mt-1">Order Management</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-blue-700 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Profile Section */}
          {userData && (
            <div className="mb-8">
              <div className="flex items-center gap-3 p-3 bg-blue-800 rounded-lg mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-lg">{getUserDisplayName()}</p>
                  <p className="text-xs text-blue-300 mt-1">{getUserRole()}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Menu */}
          <nav className="space-y-2 text-sm flex-1">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(item.path, item.isLogout)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200
                  ${item.active 
                    ? 'bg-blue-700 text-white font-semibold' 
                    : 'hover:bg-blue-700 hover:bg-opacity-50 text-blue-100'
                  }
                  ${item.isLogout ? 'mt-auto border-t border-blue-700 pt-6' : ''}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-6 border-t border-blue-700">
            <div className="flex items-center gap-2 mb-2 text-sm text-blue-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Online</span>
            </div>
            <p className="text-xs text-blue-400">IMS v2.0</p>
            <p className="text-xs text-blue-500 mt-1">© 2024 Inventory System</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          {/* Top Header with User Info */}
          <header className="bg-white shadow px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Order</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                  <span>{currentDate}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Order ID: <span className="font-mono font-semibold">ORD-{Date.now().toString().slice(-6)}</span></span>
                  {userData && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-blue-600 font-medium">
                        Created by: {getUserDisplayName()}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* User Dropdown */}
              {userData && (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="font-semibold text-gray-800 text-sm">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{getUserRole()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {getUserInitials()}
                    </div>
                    <FiChevronDown className={`transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                  </button>
                  
                  {userDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-800 truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">{userData.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{getUserRole()}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => navigate("/profile")}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          >
                            <FiUser size={16} />
                            My Profile
                          </button>
                          <button
                            onClick={() => navigate("/settings")}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          >
                            <FiSettings size={16} />
                            Settings
                          </button>
                          <button
                            onClick={() => handleNavigation('/login', true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md mt-1"
                          >
                            <FiLogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Main Content Area */}
          <div className="p-4 sm:p-6">
            {/* Welcome Banner with User Info */}
            {userData && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 text-white">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    Welcome back, {getUserDisplayName()}!
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-blue-100">
                    {getUserFullName() && (
                      <p className="font-medium">{getUserFullName()}</p>
                    )}
                    <span className="hidden sm:inline">•</span>
                    <p>{getUserRole()}</p>
                    <span className="hidden sm:inline">•</span>
                    <p>Ready to create new sales</p>
                  </div>
                  <p className="text-blue-100 mt-2">
                    Select products below to create a new order. Your role: {getUserRole()}
                  </p>
                </div>
              </div>
            )}

            {/* Products Card */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6 space-y-4 sm:space-y-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Select Products</h2>
                  <p className="text-gray-600 text-sm mt-1">Available products for ordering</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {products.filter(p => p.qty > 0).length} of {products.length} selected
                  </span>
                  {userData && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {getUserRole()}
                    </span>
                  )}
                </div>
              </div>
              
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 sm:pb-6 border-b last:border-b-0"
                >
                  {/* Product Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                      />
                      {p.qty > 0 && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {p.qty}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{p.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div className="text-gray-600 text-sm">
                          <span className="font-medium">Price:</span>{" "}
                          <span className="font-semibold text-gray-900">
                            {p.price.toLocaleString()} Tsh
                          </span>
                        </div>
                        <div className="text-gray-600 text-sm">
                          <span className="font-medium">Stock:</span>{" "}
                          <span className={`font-semibold ${p.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {p.stock} units
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Control and Total */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-end gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(p.id, "dec")}
                          disabled={p.qty === 0}
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="px-4 py-2 font-semibold text-gray-800 min-w-[3rem] text-center">
                          {p.qty}
                        </span>
                        <button
                          onClick={() => updateQty(p.id, "inc")}
                          disabled={p.qty >= p.stock}
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Total:</p>
                      <p className="font-bold text-green-600 text-base sm:text-lg min-w-[120px]">
                        {(p.qty * p.price).toLocaleString()} Tsh
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Order Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="text-xl font-bold text-blue-700">{totalProducts}</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Units</p>
                      <p className="text-xl font-bold text-green-700">{totalUnits}</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-purple-700">
                        {totalPrice.toLocaleString()} Tsh
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleSaveDraft}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Save as Draft
                  </button>
                  <button 
                    onClick={handleAddOrder}
                    className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium shadow-sm transition-colors"
                  >
                    Add Order
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium mb-1">Order Notes:</p>
                    <p className="text-gray-500">
                      {userData ? `Created by ${getUserDisplayName()} (${getUserRole()})` : "No special instructions"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium mb-1">Order Status:</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Draft
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-center sm:text-left">
              <div className="text-gray-600 text-sm mb-2 sm:mb-0">
                © 2024 Inventory Management System. All rights reserved.
              </div>
              <div className="text-xs text-gray-500">
                <span>Version 2.0.1</span>
                <span className="mx-2">•</span>
                <span>Last updated: Today</span>
                {userData && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      Logged in as: {getUserDisplayName()}
                      {getUserFullName() && getUserFullName() !== getUserDisplayName() && (
                        <span> ({getUserFullName()})</span>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}