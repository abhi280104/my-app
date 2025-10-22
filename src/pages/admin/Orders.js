import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Loader2, Check } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const handleMarkShipped = async (orderId) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "Shipped" })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status");
    } else {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "Shipped" } : order
        )
      );
    }
    setUpdatingOrderId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-indigo-700 mb-8 text-center">
        Orders
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col justify-between"
          >
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Order ID: {order.id}</p>
              <p className="font-semibold text-lg mt-1">{order.customer_name || "Customer"}</p>
              <p className="mt-2">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    order.status === "Shipped" ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </span>
              </p>
            </div>

            {order.status !== "Shipped" && (
              <button
                onClick={() => handleMarkShipped(order.id)}
                disabled={updatingOrderId === order.id}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center"
              >
                <Check className="w-4 h-4 mr-2" />
                {updatingOrderId === order.id ? "Updating..." : "Mark as Shipped"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

