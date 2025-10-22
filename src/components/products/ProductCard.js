import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decreaseQuantity, increaseQuantity } from "../../redux/slices/cartSlice"; 
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Get logged-in user (Supabase v2)
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();
  }, []);

  const cartItem = useSelector((state) =>
    state.cart.items.find((item) => item.id === product.id)
  );

  const imgSrc = product.image_url || "https://picsum.photos/300/300?random=1";

  const handleCardClick = () => {
    navigate(`/product_desc/${product.id}`);
  };

  // Update cart in DB
  const updateCartInDB = async (quantity) => {
    if (!user) return;

    try {
      const { data: existingItem } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();

      if (existingItem) {
        if (quantity > 0) {
          await supabase
            .from("cart")
            .update({ quantity, updated_at: new Date() })
            .eq("id", existingItem.id);
        } else {
          await supabase
            .from("cart")
            .delete()
            .eq("id", existingItem.id);
        }
      } else if (quantity > 0) {
        await supabase.from("cart").insert([
          { user_id: user.id, product_id: product.id, quantity }
        ]);
      }
    } catch (err) {
      console.error("Error updating cart in DB:", err);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) return alert("Please login to add items to cart!");

    dispatch(addToCart({ ...product, quantity: 1 }));
    updateCartInDB(1);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    dispatch(increaseQuantity(product.id));
    updateCartInDB(cartItem.quantity + 1);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    dispatch(decreaseQuantity(product.id));
    updateCartInDB(cartItem.quantity - 1);
  };

  return (
    <div
      className="relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer overflow-hidden group"
      onClick={handleCardClick}
      data-testid="product-card"
    >
      <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
        <img
          src={imgSrc}
          alt={product.name || "Product"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex flex-col justify-between h-36">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
          {product.name || "Unnamed Product"}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <p className="text-indigo-600 font-bold text-lg">
            ₹{product.price ? Number(product.price).toLocaleString() : "0"}
          </p>

          {cartItem ? (
            <div className="flex items-center space-x-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition"
                onClick={handleDecrease}
                data-testid="decrease-quantity-button"
              >
                -
              </button>
              <span className="text-lg font-semibold">{cartItem.quantity}</span>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition"
                onClick={handleIncrease}
                data-testid="increase-quantity-button"
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="bg-indigo-600 text-white py-1 px-3 rounded-full text-sm font-semibold hover:bg-indigo-700 transition"
              onClick={handleAddToCart}
              data-testid="add-to-cart-button"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
