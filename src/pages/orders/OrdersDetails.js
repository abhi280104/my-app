import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);

      // 1️⃣ Get logged-in user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        navigate("/login");
        return;
      }

      const userId = session.user.id;

      // 2️⃣ Fetch the specific order and its items
      const { data, error } = await supabase
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
        .eq("id", orderId)
        .eq("user_id", userId)
        .single(); // fetch a single row

      if (error) {
        console.error("Error fetching order:", error);
        setOrder(null);
      } else {
        // Map safely
        const formattedOrder = {
          id: data.id,
          status: data.status,
          created_at: data.created_at,
          total_amount: data.total,
          products: data.order_items.map(item => ({
            id: item.product?.id || "unknown",
            name: item.product?.name || "Unknown Product",
            quantity: item.quantity,
            price: item.price,
            img: item.product?.img || `https://picsum.photos/60/60?random=${item.product?.id || Math.random()}`
          }))
        };
        setOrder(formattedOrder);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) return <p className="text-center mt-24 text-gray-500">Loading order details...</p>;
  if (!order) return <div className="mt-24 text-center text-red-500">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-24 px-6 bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-600">Order #{order.id}</h1>
        <span className={`px-4 py-1 rounded-full font-semibold text-sm ${
          order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
          order.status === "shipped" ? "bg-blue-100 text-blue-800" :
          order.status === "delivered" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        {order.products.map((p, idx) => (
          <div key={idx} className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center space-x-4">
              <img src={p.img} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
              <span className="font-medium">{p.name} x {p.quantity}</span>
            </div>
            <span className="font-semibold text-indigo-600">₹{p.price * p.quantity}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center font-bold text-indigo-600 text-lg">
        <span>Total:</span>
        <span>₹{order.total_amount}</span>
      </div>

      <button
        onClick={() => navigate("/orders")}
        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
      >
        Back to Orders
      </button>
    </div>
  );
};

export default OrderDetails;
