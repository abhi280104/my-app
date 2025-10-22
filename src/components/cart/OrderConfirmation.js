import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { FaCheckCircle, FaHome } from "react-icons/fa";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      setOrder(orderData);

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*, products(*)")
        .eq("order_id", orderId);

      setItems(orderItems || []);
    };

    fetchOrder();

    const timer = setTimeout(() => navigate("/"), 7000);
    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  if (!order) return <p className="text-center mt-20 text-gray-700">Loading order...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md animate-fadeIn">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-7xl" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Order Placed Successfully!</h2>
        <p className="text-center text-gray-500 mb-6">Thank you for shopping with us.</p>
        <p className="text-center text-gray-700 font-medium mb-6">Order ID: <span className="font-bold">{order.id}</span></p>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h3>
          {items.map(item => (
            <div key={item.id} className="flex justify-between mb-2">
              <span className="text-gray-700">{item.products?.name || "Product"}</span>
              <span className="text-gray-700">₹{item.price} x {item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 text-gray-800">
            <span>Total:</span>
            <span>₹{order.total_price}</span>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-center">
          <p className="text-gray-700">Estimated Delivery: <span className="font-semibold">3-5 business days</span></p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
        >
          <FaHome /> Back to Home
        </button>

        <p className="text-center text-gray-400 mt-3 text-sm">
          Redirecting to home page...
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
