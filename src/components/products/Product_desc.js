import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { FaStar, FaStarHalfAlt, FaRegStar, FaCheckCircle } from "react-icons/fa";

const ProductDescription = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Id)
        .single();

      if (error) console.error("❌ Supabase fetch error:", error.message);
      else setProduct(data);

      setLoading(false);
    };
    fetchProduct();
  }, [Id]);

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading product details...</p>;
  if (!product) return <p className="text-center mt-10 text-red-500">Product not found!</p>;

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const rating = 4.5;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;

  return (
    <div className="max-w-7xl mx-auto my-10 px-4 md:flex md:space-x-10 relative">
      {/* Product Image */}
      <div className="md:w-1/2 flex justify-center">
        <img
          src={product?.image_url || "https://picsum.photos/500/500?random=1"}
          alt={product?.name || "Product"}
          className="rounded-2xl shadow-xl object-cover w-full max-w-md hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="md:w-1/2 mt-6 md:mt-0 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mt-2">
            {Array.from({ length: fullStars }).map((_, idx) => (
              <FaStar key={idx} className="text-yellow-400 mr-1" />
            ))}
            {halfStar && <FaStarHalfAlt className="text-yellow-400 mr-1" />}
            {Array.from({ length: 5 - fullStars - (halfStar ? 1 : 0) }).map((_, idx) => (
              <FaRegStar key={idx} className="text-yellow-400 mr-1" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">{rating} / 5</span>
          </div>

          {/* Price */}
          <p className="text-2xl font-bold text-indigo-600 mt-4">
            ₹{product.price ? Number(product.price).toLocaleString() : "0"}
          </p>

          {/* Description */}
          <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center mt-6 space-x-4">
            <span className="font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 transition" onClick={decreaseQuantity}>-</button>
              <span className="px-4 py-1">{quantity}</span>
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 transition" onClick={increaseQuantity}>+</button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col space-y-4">
          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          <button
            className="w-full border border-indigo-600 text-indigo-600 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>

      {/* Top-Center Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slideDown">
          <FaCheckCircle className="text-green-500 text-xl" />
          <span>Product added to cart!</span>
        </div>
      )}
      </div>

      {/* Toast Animation */}
      <style>
        {`
          @keyframes slideDown {
            0% { opacity: 0; transform: translate(-50%, -20px); }
            100% { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default ProductDescription;
