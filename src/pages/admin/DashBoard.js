import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);

  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [monthlyRevenueChart, setMonthlyRevenueChart] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*");
      if (productsError) throw productsError;

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*");
      if (ordersError) throw ordersError;

      setProducts(productsData);
      setOrders(ordersData);

      // Analytics cards
      setTotalOrders(ordersData.length);
      setPendingOrders(
        ordersData.filter((o) => o.status?.toLowerCase() === "pending").length
      );

      // Current month shipped orders
      const currentMonth = dayjs().month(); // 0-11
      const currentYear = dayjs().year();

      const currentMonthShippedOrders = ordersData.filter((o) => {
        const orderDate = dayjs(o.created_at);
        return (
          o.status?.toLowerCase() === "shipped" &&
          orderDate.month() === currentMonth &&
          orderDate.year() === currentYear
        );
      });
      

      const currentMonthRevenue = currentMonthShippedOrders.reduce(
        (acc, order) => acc + Number(order.total || 0),
        0
      );
      setMonthlyRevenue(currentMonthRevenue);

      console.log("Current Month Shipped Orders:", currentMonthShippedOrders);
      console.log("Revenue this month:", currentMonthRevenue);

      // Monthly chart data
      const revenuePerMonth = Array(12).fill(0);
      const ordersPerMonth = Array(12).fill(0);

      ordersData.forEach((order) => {
        if (order.created_at) {
          const monthIndex = dayjs(order.created_at).month();
          // Add revenue only for shipped orders
          if (order.status?.toLowerCase() === "shipped") {
            revenuePerMonth[monthIndex] += Number(order.total || 0);
          }
          ordersPerMonth[monthIndex] += 1;
        }
      });

      setMonthlyRevenueChart(revenuePerMonth);
      setMonthlyOrders(ordersPerMonth);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const ordersChartData = {
    labels: months,
    datasets: [
      {
        label: "Orders",
        data: monthlyOrders,
        backgroundColor: "rgba(99, 102, 241, 0.7)",
      },
    ],
  };

  const revenueChartData = {
    labels: months,
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlyRevenueChart,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col justify-between">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-indigo-600 mb-8">Admin</h1>
          <ul className="space-y-4">
            <li className="cursor-pointer hover:text-indigo-600 font-medium">Dashboard</li>
            <li
              className="cursor-pointer hover:text-indigo-600 font-medium"
              onClick={() => navigate("/admin/products")}
            >
              Products
            </li>
            <li
              className="cursor-pointer hover:text-indigo-600 font-medium"
              onClick={() => navigate("/admin/orders")}
            >
              Orders
            </li>
            
          </ul>
        </div>
        <div className="p-6">
          <button
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={() => setLogoutModal(true)}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <main className="p-6 mt-16">
          <h1 className="text-3xl font-bold text-indigo-600 mb-6">Admin Dashboard</h1>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <h2 className="text-gray-500 font-medium">Total Orders</h2>
              <p className="text-2xl font-bold text-indigo-600">{totalOrders}</p>
            </div>
            <div className="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <h2 className="text-gray-500 font-medium">Pending Orders</h2>
              <p className="text-2xl font-bold text-yellow-500">{pendingOrders}</p>
            </div>
            <div className="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <h2 className="text-gray-500 font-medium">Revenue (This Month)</h2>
              <p className="text-2xl font-bold text-green-500">₹{monthlyRevenue}</p>
            </div>
            <div className="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <h2 className="text-gray-500 font-medium">Total Products</h2>
              <p className="text-2xl font-bold text-indigo-700">{products.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-4">Orders Over Time</h3>
              <Line data={ordersChartData} />
            </div>
            <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
              <Bar data={revenueChartData} />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3">{p.id}</td>
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">₹{p.price}</td>
                      <td className="p-3">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      {logoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Are you sure you want to logout?</h2>
            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
