// src/Components/SalesReport.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBarChart2, FiTrendingUp, FiCalendar, FiDownload,
  FiDollarSign, FiUsers, FiBox, FiShoppingCart,
  FiArrowLeft, FiRefreshCw, FiPieChart, FiAward,
  FiClock, FiTrendingDown, FiTrendingUp as FiTrendingUpIcon
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const SalesReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Data states
  const [shopkeepers, setShopkeepers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  
  // Report data
  const [reportData, setReportData] = useState({
    dailySales: [],
    productSales: [],
    shopkeeperSales: [],
    monthlyTrend: [],
    summary: {
      totalRevenue: 0,
      totalProfit: 0,
      totalSales: 0,
      averageOrderValue: 0,
      topProduct: null,
      topShopkeeper: null,
      bestDay: null,
      profitMargin: 0
    }
  });

  // Chart view options
  const [chartView, setChartView] = useState('revenue'); // 'revenue' or 'profit'
  const [timeRange, setTimeRange] = useState('daily'); // 'daily', 'weekly', 'monthly'

  // Format TZS currency
  const formatTZS = (amount) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchAllData(parsedUser);
  }, [navigate]);

  const fetchAllData = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("authToken");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch all data in parallel
      const [shopkeepersRes, productsRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/shopkeepers/${userData.id}`),
        axios.get(`${API_BASE_URL}/products/${userData.id}`),
        axios.get(`${API_BASE_URL}/sales/owner/${userData.id}`)
      ]);

      setShopkeepers(shopkeepersRes.data);
      setProducts(productsRes.data);
      setSales(salesRes.data);
      
      // Generate report
      generateReport(salesRes.data, productsRes.data, shopkeepersRes.data);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (salesData, productsData, shopkeepersData) => {
    try {
      // Process daily sales
      const dailyMap = new Map();
      const productMap = new Map();
      const shopkeeperMap = new Map();
      const monthlyMap = new Map();
      
      let totalRevenue = 0;
      let totalProfit = 0;
      let totalSales = 0;
      
      // Initialize product map with all products
      productsData.forEach(product => {
        productMap.set(product.id, {
          id: product.id,
          name: product.name,
          quantity: 0,
          revenue: 0,
          profit: 0,
          buyPrice: product.buyPrice,
          sellPrice: product.sellPrice
        });
      });

      // Initialize shopkeeper map
      shopkeepersData.forEach(shopkeeper => {
        shopkeeperMap.set(shopkeeper.id, {
          id: shopkeeper.id,
          name: `${shopkeeper.firstName} ${shopkeeper.lastName}`,
          sales: 0,
          revenue: 0,
          profit: 0
        });
      });

      // Process each sale
      salesData.forEach(sale => {
        const date = new Date(sale.createdAt).toISOString().split('T')[0];
        const month = date.substring(0, 7); // YYYY-MM
        const product = productsData.find(p => p.id === sale.productId);
        const profit = product ? (product.sellPrice - product.buyPrice) * sale.quantity : 0;
        const revenue = product ? product.sellPrice * sale.quantity : 0;
        
        totalRevenue += revenue;
        totalProfit += profit;
        totalSales++;
        
        // Daily aggregation
        if (dailyMap.has(date)) {
          dailyMap.set(date, dailyMap.get(date) + revenue);
        } else {
          dailyMap.set(date, revenue);
        }
        
        // Monthly aggregation
        if (monthlyMap.has(month)) {
          const monthData = monthlyMap.get(month);
          monthData.revenue += revenue;
          monthData.profit += profit;
          monthData.sales += 1;
        } else {
          monthlyMap.set(month, {
            month,
            revenue,
            profit,
            sales: 1
          });
        }
        
        // Product aggregation
        if (productMap.has(sale.productId)) {
          const prod = productMap.get(sale.productId);
          prod.quantity += sale.quantity;
          prod.revenue += revenue;
          prod.profit += profit;
        }
        
        // Shopkeeper aggregation
        if (shopkeeperMap.has(sale.shopkeeperId)) {
          const shop = shopkeeperMap.get(sale.shopkeeperId);
          shop.sales += 1;
          shop.revenue += revenue;
          shop.profit += profit;
        }
      });
      
      // Convert maps to arrays and sort
      const dailySales = Array.from(dailyMap, ([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      const monthlyTrend = Array.from(monthlyMap, ([_, data]) => data)
        .sort((a, b) => a.month.localeCompare(b.month));
      
      const productSales = Array.from(productMap.values())
        .filter(p => p.quantity > 0)
        .sort((a, b) => b.revenue - a.revenue);
      
      const shopkeeperSales = Array.from(shopkeeperMap.values())
        .filter(s => s.sales > 0)
        .sort((a, b) => b.revenue - a.revenue);
      
      // Find best day
      const bestDay = dailySales.reduce((max, day) => 
        day.revenue > (max?.revenue || 0) ? day : max, null);
      
      // Find top product
      const topProduct = productSales.length > 0 ? productSales[0] : null;
      
      // Find top shopkeeper
      const topShopkeeper = shopkeeperSales.length > 0 ? shopkeeperSales[0] : null;
      
      // Calculate profit margin
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      
      setReportData({
        dailySales,
        productSales,
        shopkeeperSales,
        monthlyTrend,
        summary: {
          totalRevenue,
          totalProfit,
          totalSales,
          averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
          topProduct,
          topShopkeeper,
          bestDay,
          profitMargin
        }
      });
      
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report");
    }
  };

  const filterByDateRange = () => {
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      return saleDate >= dateRange.startDate && saleDate <= dateRange.endDate;
    });
    generateReport(filtered, products, shopkeepers);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Added BOM for Excel UTF-8
    
    // Summary
    csvContent += "SALES REPORT SUMMARY\n";
    csvContent += `Generated on,${new Date().toLocaleString('sw-TZ')}\n`;
    csvContent += `Period,${dateRange.startDate} to ${dateRange.endDate}\n\n`;
    
    csvContent += "METRICS\n";
    csvContent += `Total Revenue,${formatTZS(reportData.summary.totalRevenue).replace('TSh', 'TZS')}\n`;
    csvContent += `Total Profit,${formatTZS(reportData.summary.totalProfit).replace('TSh', 'TZS')}\n`;
    csvContent += `Total Sales,${reportData.summary.totalSales}\n`;
    csvContent += `Average Order Value,${formatTZS(reportData.summary.averageOrderValue).replace('TSh', 'TZS')}\n`;
    csvContent += `Profit Margin,${reportData.summary.profitMargin.toFixed(1)}%\n\n`;
    
    // Daily Sales
    csvContent += "DAILY SALES\n";
    csvContent += "Date,Revenue (TZS)\n";
    reportData.dailySales.forEach(day => {
      csvContent += `${day.date},${day.revenue.toFixed(0)}\n`;
    });
    
    csvContent += "\nPRODUCT PERFORMANCE\n";
    csvContent += "Product,Units Sold,Revenue (TZS),Profit (TZS),Profit Margin\n";
    reportData.productSales.forEach(prod => {
      const margin = prod.revenue > 0 ? (prod.profit / prod.revenue * 100).toFixed(1) : 0;
      csvContent += `${prod.name},${prod.quantity},${prod.revenue.toFixed(0)},${prod.profit.toFixed(0)},${margin}%\n`;
    });
    
    csvContent += "\nSHOPKEEPER PERFORMANCE\n";
    csvContent += "Shopkeeper,Sales Count,Revenue (TZS),Profit (TZS),Avg Sale Value (TZS)\n";
    reportData.shopkeeperSales.forEach(shop => {
      const avgSale = shop.sales > 0 ? shop.revenue / shop.sales : 0;
      csvContent += `${shop.name},${shop.sales},${shop.revenue.toFixed(0)},${shop.profit.toFixed(0)},${avgSale.toFixed(0)}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Chart data preparation
  const getProductChartData = () => {
    const topProducts = reportData.productSales.slice(0, 8);
    return {
      labels: topProducts.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
      datasets: [
        {
          label: chartView === 'revenue' ? 'Revenue (TZS)' : 'Profit (TZS)',
          data: topProducts.map(p => chartView === 'revenue' ? p.revenue : p.profit),
          backgroundColor: chartView === 'revenue' 
            ? 'rgba(54, 162, 235, 0.7)'
            : 'rgba(75, 192, 192, 0.7)',
          borderColor: chartView === 'revenue'
            ? 'rgba(54, 162, 235, 1)'
            : 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const getDailyChartData = () => {
    const data = timeRange === 'daily' ? reportData.dailySales : reportData.monthlyTrend;
    return {
      labels: data.map(d => {
        if (timeRange === 'daily') {
          const date = new Date(d.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return d.month;
      }),
      datasets: [
        {
          label: 'Revenue (TZS)',
          data: data.map(d => d.revenue),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'Profit (TZS)',
          data: data.map(d => d.profit || d.revenue * (reportData.summary.profitMargin / 100)),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    };
  };

  const getPieChartData = () => {
    const topShopkeepers = reportData.shopkeeperSales.slice(0, 5);
    const others = reportData.shopkeeperSales.slice(5).reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      sales: acc.sales + curr.sales
    }), { revenue: 0, sales: 0 });
    
    const labels = [...topShopkeepers.map(s => s.name)];
    if (others.revenue > 0) labels.push('Others');
    
    const data = [...topShopkeepers.map(s => s.revenue)];
    if (others.revenue > 0) data.push(others.revenue);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== undefined) {
              label += formatTZS(context.parsed.y);
            }
            if (context.parsed !== undefined) {
              label += formatTZS(context.parsed);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M TSh';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K TSh';
            }
            return value + ' TSh';
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatTZS(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => fetchAllData(user)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Sales Analytics Report (TZS)</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <FiDownload /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              onClick={filterByDateRange}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <FiRefreshCw /> Apply Filter
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <FiDollarSign className="text-3xl" />
              <span className="text-sm opacity-90">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold">{formatTZS(reportData.summary.totalRevenue)}</p>
            <p className="text-sm opacity-75 mt-2">From {reportData.summary.totalSales} sales</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUpIcon className="text-3xl" />
              <span className="text-sm opacity-90">Total Profit</span>
            </div>
            <p className="text-3xl font-bold">{formatTZS(reportData.summary.totalProfit)}</p>
            <p className="text-sm opacity-75 mt-2">Margin: {reportData.summary.profitMargin.toFixed(1)}%</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <FiShoppingCart className="text-3xl" />
              <span className="text-sm opacity-90">Avg Order Value</span>
            </div>
            <p className="text-3xl font-bold">{formatTZS(reportData.summary.averageOrderValue)}</p>
            <p className="text-sm opacity-75 mt-2">Per transaction</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <FiAward className="text-3xl" />
              <span className="text-sm opacity-90">Best Day</span>
            </div>
            <p className="text-xl font-bold">
              {reportData.summary.bestDay 
                ? new Date(reportData.summary.bestDay.date).toLocaleDateString('sw-TZ')
                : 'N/A'}
            </p>
            <p className="text-sm opacity-75 mt-2">
              {formatTZS(reportData.summary.bestDay?.revenue || 0)}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Performance Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiBarChart2 className="text-blue-600" />
                Product Performance
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartView('revenue')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    chartView === 'revenue'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartView('profit')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    chartView === 'profit'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Profit
                </button>
              </div>
            </div>
            <div className="h-80">
              <Bar data={getProductChartData()} options={chartOptions} />
            </div>
          </div>

          {/* Sales Trend Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiTrendingUp className="text-orange-600" />
                Sales Trend
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange('daily')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'daily'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeRange('monthly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'monthly'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-80">
              <Line data={getDailyChartData()} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Shopkeeper Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FiPieChart className="text-purple-600" />
              Revenue Distribution by Shopkeeper
            </h2>
            <div className="h-80">
              <Pie data={getPieChartData()} options={pieOptions} />
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FiAward className="text-yellow-500" />
              Top Performers
            </h2>
            
            {reportData.summary.topProduct && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-700 font-medium mb-1">🏆 Top Product</p>
                <p className="text-lg font-bold text-gray-800">{reportData.summary.topProduct.name}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600">{formatTZS(reportData.summary.topProduct.revenue)} revenue</span>
                  <span className="text-blue-600">{reportData.summary.topProduct.quantity} units</span>
                </div>
              </div>
            )}

            {reportData.summary.topShopkeeper && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">👑 Top Shopkeeper</p>
                <p className="text-lg font-bold text-gray-800">{reportData.summary.topShopkeeper.name}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600">{formatTZS(reportData.summary.topShopkeeper.revenue)} revenue</span>
                  <span className="text-blue-600">{reportData.summary.topShopkeeper.sales} sales</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Performance Table */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiBox className="text-green-600" />
            Product Performance Details
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Units Sold</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Revenue (TZS)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Profit (TZS)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Margin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.productSales.map((product, idx) => {
                  const margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">{product.quantity}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{formatTZS(product.revenue)}</td>
                      <td className="px-6 py-4 text-blue-600 font-medium">{formatTZS(product.profit)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          margin >= 30 ? 'bg-green-100 text-green-800' :
                          margin >= 20 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                margin >= 30 ? 'bg-green-500' :
                                margin >= 20 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(margin, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{margin.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shopkeeper Performance Table */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiUsers className="text-purple-600" />
            Shopkeeper Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Shopkeeper</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Sales</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Revenue (TZS)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Profit (TZS)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Avg Sale (TZS)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.shopkeeperSales.map((shopkeeper, idx) => {
                  const contribution = (shopkeeper.revenue / reportData.summary.totalRevenue) * 100;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{shopkeeper.name}</td>
                      <td className="px-6 py-4">{shopkeeper.sales}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{formatTZS(shopkeeper.revenue)}</td>
                      <td className="px-6 py-4 text-blue-600 font-medium">{formatTZS(shopkeeper.profit)}</td>
                      <td className="px-6 py-4">{formatTZS(shopkeeper.revenue / shopkeeper.sales)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500"
                              style={{ width: `${Math.min(contribution, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{contribution.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;