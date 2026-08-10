import { API_BASE_URL } from "../../config";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import axios from "axios";
import { FiLogOut, FiUsers, FiBox, FiShoppingCart, FiPlus, FiBarChart2, FiDollarSign } from "react-icons/fi";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [stats, setStats] = useState({ shopkeepers: 0, products: 0, sales: 0 });
  const [totals, setTotals] = useState({
    totalBuyPrice: 0,
    totalSellPrice: 0,
    totalProfit: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const [shopkeepersList, setShopkeepersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [salesList, setSalesList] = useState([]);

  // Modals
  const [showShopkeeperModal, setShowShopkeeperModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Forms
  const [shopkeeperForm, setShopkeeperForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "" });
  const [productForm, setProductForm] = useState({ name: "", buyPrice: "", sellPrice: "", quantity: "" });
  const [saleForm, setSaleForm] = useState({ productId: "", quantity: "", shopkeeperId: "" });

  // Format TZS currency
  const formatTZS = (amount) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  // Calculate totals from products and sales
  const calculateTotals = (products, sales) => {
    // Calculate total buy price and sell price from products (based on quantity)
    const totalBuyPrice = products.reduce((acc, product) =>
      acc + ((product.buyPrice || 0) * (product.quantity || 0)), 0
    );

    const totalSellPrice = products.reduce((acc, product) =>
      acc + ((product.sellPrice || 0) * (product.quantity || 0)), 0
    );

    // Calculate total revenue and profit from sales
    let totalRevenue = 0;
    let totalProfit = 0;

    sales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        const revenue = (product.sellPrice || 0) * sale.quantity;
        const cost = (product.buyPrice || 0) * sale.quantity;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalProfit += profit;
      }
    });

    setTotals({
      totalBuyPrice,
      totalSellPrice,
      totalRevenue,
      totalProfit
    });
  };

  const getArrayData = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    return [];
  };

  // Fetch owner info and stats
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    let parsedUser;

    try {
      parsedUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.clear();
      navigate("/login");
      return;
    }

    setOwner(parsedUser);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Fetch shopkeepers
        const shopkeepersRes = await axios.get(
          `${API_BASE_URL}/users/shopkeepers/${parsedUser.id}`
        );

        // Fetch products
        const productsRes = await axios.get(
          `${API_BASE_URL}/products/${parsedUser.id}`
        );

        // Fetch sales
        const salesRes = await axios.get(
          `${API_BASE_URL}/sales/owner/${parsedUser.id}`
        );

        // Convert all responses into arrays
        const shopkeepers = getArrayData(shopkeepersRes.data);
        const products = getArrayData(productsRes.data);
        const sales = getArrayData(salesRes.data);

        console.log("Shopkeepers API:", shopkeepersRes.data);
        console.log("Products API:", productsRes.data);
        console.log("Sales API:", salesRes.data);

        // Store arrays
        setShopkeepersList(shopkeepers);
        setProductsList(products);
        setSalesList(sales);

        // Stats
        setStats({
          shopkeepers: shopkeepers.length,
          products: products.length,
          sales: sales.length,
        });

        // Calculate totals
        calculateTotals(products, sales);

      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );

        // Keep lists as arrays even if API fails
        setShopkeepersList([]);
        setProductsList([]);
        setSalesList([]);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Form handlers
  const handleShopkeeperChange = e => setShopkeeperForm({ ...shopkeeperForm, [e.target.name]: e.target.value });
  const handleProductChange = e => setProductForm({ ...productForm, [e.target.name]: e.target.value });
  const handleSaleChange = e => setSaleForm({ ...saleForm, [e.target.name]: e.target.value });

  // Submit Shopkeeper
  const submitShopkeeper = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await axios.post(`${API_BASE_URL}/users/shopkeeper/${owner.id}`, shopkeeperForm);

      alert("Shopkeeper created successfully! Email notification sent.");
      setShopkeepersList(prev => [...prev, res.data.shopkeeper]);
      setStats(prev => ({ ...prev, shopkeepers: prev.shopkeepers + 1 }));
      setShopkeeperForm({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "" });
      setShowShopkeeperModal(false);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create shopkeeper");
    }
  };

  // Submit Product
  const submitProduct = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await axios.post(`${API_BASE_URL}/products/${owner.id}`, productForm);

      alert("Product created successfully!");
      const updatedProducts = [...productsList, res.data];
      setProductsList(updatedProducts);
      setStats(prev => ({ ...prev, products: prev.products + 1 }));
      setProductForm({ name: "", buyPrice: "", sellPrice: "", quantity: "" });
      setShowProductModal(false);

      // Recalculate totals with updated products
      calculateTotals(updatedProducts, salesList);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create product");
    }
  };

  // Submit Sale
  const submitSale = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await axios.post(`${API_BASE_URL}/sales`, saleForm);

      alert("Sale created successfully!");

      // Update sales list
      const updatedSales = [...salesList, res.data];
      setSalesList(updatedSales);
      setStats(prev => ({ ...prev, sales: prev.sales + 1 }));

      // Update product quantity locally
      const updatedProducts = productsList.map(p =>
        p.id === res.data.productId ? { ...p, quantity: p.quantity - res.data.quantity } : p
      );
      setProductsList(updatedProducts);

      // Recalculate totals with updated data
      calculateTotals(updatedProducts, updatedSales);

      setSaleForm({ productId: "", quantity: "", shopkeeperId: "" });
      setShowSaleModal(false);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to create sale");
    }
  };

  if (!owner) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 sm:p-10">
        {/* Header with Report Link */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <div className="flex gap-3">
            <Link
              to="/owner/reports"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiBarChart2 className="text-lg" /> View Reports
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Owner Info & Actions */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, {owner.firstName} {owner.lastName}!</h2>
              <p className="text-blue-100 mb-1">Email: {owner.email}</p>
              <p className="text-blue-100">Role: {owner.role}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowShopkeeperModal(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md"
              >
                <FiPlus /> Add Shopkeeper
              </button>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                <FiPlus /> Add Product
              </button>
              <button
                onClick={() => setShowSaleModal(true)}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                <FiPlus /> New Sale
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Shopkeepers</p>
                <h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.shopkeepers}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUsers className="text-3xl text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              {stats.shopkeepers} active
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.products}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiBox className="text-3xl text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              {productsList.reduce((acc, p) => acc + (p.quantity || 0), 0)} units in stock
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.sales}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiShoppingCart className="text-3xl text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-purple-600">
              {stats.sales} transactions
            </div>
          </div>
        </div>

        {/* Financial Summary Cards - New Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              <FiDollarSign className="text-2xl" />
              <h3 className="text-lg font-semibold">Total Buy Value</h3>
            </div>
            <p className="text-2xl font-bold">{formatTZS(totals.totalBuyPrice)}</p>
            <p className="text-sm opacity-90 mt-1">Cost of all products in stock</p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              <FiDollarSign className="text-2xl" />
              <h3 className="text-lg font-semibold">Total Sell Value</h3>
            </div>
            <p className="text-2xl font-bold">{formatTZS(totals.totalSellPrice)}</p>
            <p className="text-sm opacity-90 mt-1">Potential revenue from stock</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              <FiShoppingCart className="text-2xl" />
              <h3 className="text-lg font-semibold">Total Revenue</h3>
            </div>
            <p className="text-2xl font-bold">{formatTZS(totals.totalRevenue)}</p>
            <p className="text-sm opacity-90 mt-1">Revenue from all sales</p>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              <FiBarChart2 className="text-2xl" />
              <h3 className="text-lg font-semibold">Total Profit</h3>
            </div>
            <p className="text-2xl font-bold">{formatTZS(totals.totalProfit)}</p>
            <p className="text-sm opacity-90 mt-1">Profit from all sales</p>
          </div>
        </div>

        {/* Shopkeepers List */}
        <DataTable
          title="Shopkeepers"
          data={shopkeepersList}
          columns={["Name", "Email", "Phone", "Role", "Status"]}
          renderCell={(item, column) => {
            if (column === "Name") return `${item.firstName || ''} ${item.lastName || ''}`;
            if (column === "Email") return item.email || "—";
            if (column === "Phone") return item.phoneNumber || "—";
            if (column === "Role") return item.role || "—";
            if (column === "Status") {
              const salesCount = salesList.filter(s => s.shopkeeperId === item.id).length;
              return (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${salesCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {salesCount > 0 ? 'Active' : 'Inactive'}
                </span>
              );
            }
            return "—";
          }}
        />

        {/* Products List */}
        <DataTable
          title="Products"
          data={productsList}
          columns={["Name", "Buy Price (TSh)", "Sell Price (TSh)", "Quantity", "Total Value (TSh)", "Status"]}
          renderCell={(item, column) => {
            if (column === "Name") return item.name || "—";
            if (column === "Buy Price (TSh)") return formatTZS(item.buyPrice || 0);
            if (column === "Sell Price (TSh)") return formatTZS(item.sellPrice || 0);
            if (column === "Quantity") return item.quantity || 0;
            if (column === "Total Value (TSh)") {
              const totalValue = (item.sellPrice || 0) * (item.quantity || 0);
              return formatTZS(totalValue);
            }
            if (column === "Status") {
              const quantity = item.quantity || 0;
              let statusClass = "bg-green-100 text-green-800";
              let statusText = "In Stock";

              if (quantity === 0) {
                statusClass = "bg-red-100 text-red-800";
                statusText = "Out of Stock";
              } else if (quantity < 10) {
                statusClass = "bg-yellow-100 text-yellow-800";
                statusText = "Low Stock";
              }

              return (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                  {statusText}
                </span>
              );
            }
            return "—";
          }}
        />

        {/* Sales List */}
        <DataTable
          title="Recent Sales"
          data={Array.isArray(salesList) ? salesList.slice(0, 10) : []}
          columns={[
            "Product",
            "Shopkeeper",
            "Quantity",
            "Revenue (TSh)",
            "Profit (TSh)",
            "Date"
          ]}
          renderCell={(item, column) => {
            const product = productsList.find(
              p => p.id === item.productId
            );

            const shopkeeper = shopkeepersList.find(
              s => s.id === item.shopkeeperId
            );

            const revenue = product
              ? (product.sellPrice || 0) * item.quantity
              : 0;

            const cost = product
              ? (product.buyPrice || 0) * item.quantity
              : 0;

            const profit = revenue - cost;

            if (column === "Product") {
              return product?.name || `Product ${item.productId}`;
            }

            if (column === "Shopkeeper") {
              return shopkeeper
                ? `${shopkeeper.firstName} ${shopkeeper.lastName}`
                : `Shopkeeper ${item.shopkeeperId}`;
            }

            if (column === "Quantity") {
              return item.quantity || "—";
            }

            if (column === "Revenue (TSh)") {
              return formatTZS(revenue);
            }

            if (column === "Profit (TSh)") {
              return (
                <span
                  className={
                    profit >= 0
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {formatTZS(profit)}
                </span>
              );
            }

            if (column === "Date") {
              return item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("sw-TZ")
                : "—";
            }

            return "—";
          }}
        />

        {salesList.length > 10 && (
          <div className="text-center mb-8">
            <Link
              to="/owner/reports"
              className="text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-2"
            >
              View all {salesList.length} sales in reports <FiBarChart2 />
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      {showShopkeeperModal && (
        <Modal title="Create Shopkeeper" onClose={() => setShowShopkeeperModal(false)}>
          <form className="flex flex-col gap-4" onSubmit={submitShopkeeper}>
            <input type="text" name="firstName" placeholder="First Name" value={shopkeeperForm.firstName} onChange={handleShopkeeperChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <input type="text" name="lastName" placeholder="Last Name" value={shopkeeperForm.lastName} onChange={handleShopkeeperChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <input type="email" name="email" placeholder="Email" value={shopkeeperForm.email} onChange={handleShopkeeperChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <input type="text" name="phoneNumber" placeholder="Phone" value={shopkeeperForm.phoneNumber} onChange={handleShopkeeperChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <input type="password" name="password" placeholder="Password" value={shopkeeperForm.password} onChange={handleShopkeeperChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowShopkeeperModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {showProductModal && (
        <Modal title="Create Product" onClose={() => setShowProductModal(false)}>
          <form className="flex flex-col gap-4" onSubmit={submitProduct}>
            <input type="text" name="name" placeholder="Product Name" value={productForm.name} onChange={handleProductChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <input type="number" name="buyPrice" placeholder="Buy Price (TSh)" value={productForm.buyPrice} onChange={handleProductChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <input type="number" name="sellPrice" placeholder="Sell Price (TSh)" value={productForm.sellPrice} onChange={handleProductChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <input type="number" name="quantity" placeholder="Quantity" value={productForm.quantity} onChange={handleProductChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {showSaleModal && (
        <Modal title="Create Sale" onClose={() => setShowSaleModal(false)}>
          <form className="flex flex-col gap-4" onSubmit={submitSale}>
            <select name="productId" value={saleForm.productId} onChange={handleSaleChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="">Select Product</option>
              {productsList.filter(p => p.quantity > 0).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatTZS(p.sellPrice)}) - Stock: {p.quantity}
                </option>
              ))}
            </select>
            <select name="shopkeeperId" value={saleForm.shopkeeperId} onChange={handleSaleChange} required className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="">Select Shopkeeper</option>
              {shopkeepersList.map(sk => <option key={sk.id} value={sk.id}>{sk.firstName} {sk.lastName}</option>)}
            </select>
            <input type="number" name="quantity" placeholder="Quantity" value={saleForm.quantity} onChange={handleSaleChange} required min="1" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowSaleModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">Create Sale</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Reusable Modal Component
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-2xl">&times;</button>
      </div>
      {children}
    </div>
  </div>
);

// Reusable DataTable Component
const DataTable = ({
  title,
  data,
  columns,
  renderCell
}) => {
  // Make sure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

      <h2 className="text-xl font-semibold mb-4">
        {title}
      </h2>

      {safeData.length === 0 ? (
        <p className="text-gray-500">
          No {title.toLowerCase()} yet.
        </p>
      ) : (
        <div className="overflow-x-auto">

          <table className="min-w-full table-auto border border-gray-200 rounded-lg">

            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2 border"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeData.map((item, idx) => (
                <tr
                  key={item?.id || idx}
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={`${item?.id || idx}-${column}`}
                      className="px-4 py-2 border"
                    >
                      {renderCell
                        ? renderCell(item, column)
                        : String(
                          item?.[column] ??
                          item?.[column.toLowerCase()] ??
                          "—"
                        )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;