import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { useSelector } from "react-redux";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Redux cart items
  const cartItems = useSelector((state) => state.cart.items);

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        });
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        });
      } else {
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim() === "") {
        setSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("name")
        .ilike("name", `%${searchTerm}%`)
        .limit(5);

      if (!error && data) setSuggestions(data.map(p => p.name));
    };

    fetchSuggestions();
  }, [searchTerm]);

  return (
    <>
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="text-3xl font-extrabold text-indigo-600 cursor-pointer mr-12" onClick={() => navigate("/")}>
            SHOPIFY
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 items-center space-x-12">
            {/* Nav Links */}
            <div className="flex space-x-8 text-lg font-medium">
              <button className="text-gray-700 hover:text-indigo-600 transition" onClick={()=>{navigate('/feature')}}>Featured</button>
              <button className="text-gray-700 hover:text-indigo-600 transition">New Arrivals</button>
              <button className="text-gray-700 hover:text-indigo-600 transition">Deals</button>
              <button className="text-gray-700 hover:text-indigo-600 transition"   onClick={()=>{navigate('/catogries')}}>Categories</button>
            </div>

            {/* Search */}
            <div className="flex flex-1 mx-6 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-5 py-3 border border-gray-300 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 bg-indigo-600 text-white font-medium rounded-r-2xl hover:bg-indigo-700 transition"
              >
                Search
              </button>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-2xl shadow-md z-50">
                  {suggestions.map((sugg, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-2 cursor-pointer hover:bg-indigo-50"
                      onClick={() => {
                        setSearchTerm(sugg);
                        setSuggestions([]);
                      }}
                    >
                      {sugg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Cart */}
            <div className="relative cursor-pointer" data-testid="nav-cart" onClick={() => navigate("/cart")}>
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-9v9" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-sm" data-testid="cart-count">
                  {cartItems.length}
                </span>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-3 focus:outline-none">
                <img src={user?.avatar} alt="Profile" className="w-10 h-10 rounded-full" />
                <span className="hidden md:inline text-gray-700 font-medium text-lg">{user?.name || "Guest"}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg py-3 animate-fadeIn">
                  <button className="block w-full text-left px-4 py-3 hover:bg-indigo-50 text-lg" onClick={() => navigate("/profile")}>
                    Profile
                  </button>
                  <button className="block w-full text-left px-4 py-3 hover:bg-indigo-50 text-lg" onClick={() => navigate("/orders")}>
                    Orders
                  </button>
                  <button className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 text-lg" onClick={() => setLogoutModal(true)}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Modal */}
      {logoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
            <h2 className="text-xl font-semibold mb-4">Are you sure you want to logout?</h2>
            <div className="flex justify-between mt-6">
              <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setLogoutModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg" onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                setLogoutModal(false);
                navigate("/login");
              }}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
