import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/NavBar";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          name: session.user.user_metadata.full_name || "",
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="text-center mt-24 text-gray-600">Loading...</div>;

  return (
    <>
    
    <div className="max-w-3xl mx-auto p-6 mt-24 bg-white shadow-lg rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-indigo-600">My Profile</h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <FaHome />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-10">
        <div className="flex flex-col items-center mb-6 md:mb-0">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-indigo-100 shadow-md"
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={user.name}
              disabled
              className="w-full px-4 py-3 border rounded-xl bg-indigo-50 border-indigo-200 text-gray-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 border rounded-xl bg-indigo-50 border-indigo-200 text-gray-800 font-medium"
            />
          </div>
        </div>
      </div>

     
    </div>
    <Footer/>
    </>
  );
};

export default Profile;
