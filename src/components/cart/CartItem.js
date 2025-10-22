import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  setCart,
} from "../../redux/slices/cartSlice"; // Make sure this path is correct
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

const CartPage = () => {
  const { items, totalQuantity, totalPrice } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true); // To prevent race conditions

  // 1️⃣ Fetch logged-in user & cart from Supabase
  useEffect(() => {
    const fetchUserAndCart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return navigate("/login");

      setUser(session.user);

      // Fetch cart items
      const { data: cartData, error } = await supabase
        .from("cart")
        .select("quantity, product_id(*)")
        .eq("user_id", session.user.id);

      if (error) console.error("Error fetching cart:", error);
      else {
        const itemsFromDB = cartData.map((item) => ({
          id: item.product_id.id,
          name: item.product_id.name,
          price: item.product_id.price,
          img: item.product_id.image_url,
          quantity: item.quantity,
        }));
        dispatch(setCart(itemsFromDB));
      }
      setLoadingCart(false);
    };
    fetchUserAndCart();
  }, [dispatch, navigate]);

  // 2️⃣ Sync Redux cart with Supabase
  const updateCartInDB = async (productId, quantity) => {
    if (!user) return;

    try {
      const { data: existingItem } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (existingItem) {
        if (quantity > 0) {
          await supabase
            .from("cart")
            .update({ quantity, updated_at: new Date() })
            .eq("id", existingItem.id);
        } else {
          await supabase.from("cart").delete().eq("id", existingItem.id);
        }
      } else if (quantity > 0) {
        await supabase.from("cart").insert([
          { user_id: user.id, product_id: productId, quantity },
        ]);
      }
    } catch (err) {
      console.error("Error updating cart in DB:", err);
    }
  };

  // 3️⃣ Handlers
  const handleIncrease = (item) => {
    const latestItem = items.find(i => i.id === item.id);
    const newQuantity = latestItem ? latestItem.quantity + 1 : 1;
    dispatch(addToCart(item));
    updateCartInDB(item.id, newQuantity);
  };

  const handleDecrease = (item) => {
    const latestItem = items.find(i => i.id === item.id);
    const newQuantity = latestItem ? latestItem.quantity - 1 : 0;
    dispatch(decreaseQuantity(item.id));
    updateCartInDB(item.id, newQuantity);
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart(item.id));
    updateCartInDB(item.id, 0);
  };

  const handleCheckout = async () => {
    if (!user) return alert("User not logged in!");
    if (items.length === 0) return alert("Cart is empty!");

    try {
      const productIds = items.map((i) => i.id);
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, stock, price")
        .in("id", productIds);

      if (productsError) throw new Error("Error fetching product data!");

      // Check stock
      for (let item of items) {
        const product = productsData.find((p) => p.id === item.id);
        if (!product) return alert(`Product "${item.name}" no longer exists.`);
        if (item.quantity > product.stock)
          return alert(`Only ${product.stock} unit(s) of "${item.name}" available.`);
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ user_id: user.id, total: totalPrice, status: "pending" }])
        .select()
        .single();

      if (orderError) throw new Error("Error creating order!");

      // Create order items
      const orderItems = items.map((i) => ({
        order_id: orderData.id,
        product_id: i.id,
        quantity: i.quantity,
        price: i.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw new Error("Error saving order items!");

      // Update product stock
      const updates = items.map((i) => {
        const product = productsData.find((p) => p.id === i.id);
        return supabase
          .from("products")
          .update({ stock: product.stock - i.quantity })
          .eq("id", i.id);
      });
      await Promise.all(updates);

      // Clear cart
      dispatch(clearCart());
      await supabase.from("cart").delete().eq("user_id", user.id);

      navigate(`/order-confirmation/${orderData.id}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong during checkout.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600 flex items-center gap-2">
        🛒 Your Cart
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white shadow rounded-lg p-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.img || "https://picsum.photos/80?random=" + item.id}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-500 text-sm">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    disabled={loadingCart}
                    onClick={() => handleDecrease(item)}
                  >
                    -
                  </button>

                  <span className="px-2">{item.quantity}</span>

                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    disabled={loadingCart}
                    onClick={() => handleIncrease(item)}
                  >
                    +
                  </button>

                  <button
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    onClick={() => handleRemove(item)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="w-full md:w-80 flex-shrink-0 bg-white shadow rounded-lg p-6 flex flex-col justify-between h-[300px]">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">Summary</h3>

            <div className="space-y-2 flex-1 overflow-y-auto">
              <p className="flex justify-between text-gray-600">
                <span>Total Items:</span> <span>{totalQuantity}</span>
              </p>
              <p className="flex justify-between text-gray-600 text-lg font-bold">
                <span>Total Price:</span> <span>₹{totalPrice}</span>
              </p>
            </div>

            <button
              className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
