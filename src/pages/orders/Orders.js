import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import Footer from "../../components/common/Footer";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      // 1️⃣ Get logged-in user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        navigate("/login");
        return;
      }
      const userId = session.user.id;

      // 2️⃣ Fetch orders for the user
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          created_at,
          total,
          order_items:order_items (
            quantity,
            price,
            product:product_id (
              id,
              name
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching order data:", ordersError);
        setOrders([]);
      } else {
        // Map the data safely
        const formattedOrders = ordersData.map(order => ({
          id: order.id,
          status: order.status,
          created_at: order.created_at,
          total_amount: order.total,
          products: order.order_items.map(item => ({
            id: item.product?.id || "unknown",
            name: item.product?.name || "Unknown Product",
            quantity: item.quantity,
            price: item.price,
            img: item.product?.img || `https://picsum.photos/60/60?random=${item.product?.id || Math.random()}`
          }))
        }));
        setOrders(formattedOrders);
      }

      setLoading(false);
    };

    fetchOrders();
  }, [navigate]);

  if (loading) return <p className="text-center mt-24 text-gray-500">Loading your orders...</p>;

  return (
    <>
      <div className="max-w-6xl mx-auto mt-24 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">My Orders</h1>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition"
          >
            Back to Home
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">You have no orders yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-xl transition"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">Order #{order.id}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  {new Date(order.created_at).toLocaleString()}
                </p>
                <p className="mt-2 font-bold text-indigo-600">
                  Total: ₹{order.total_amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Orders;
