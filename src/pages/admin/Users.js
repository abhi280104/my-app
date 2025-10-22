import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Loader2, Trash2 } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Fetch all non-admin users
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("userroles")
      .select(`
        id,
        role,
        users (
          id,
          email,
          created_at
        )
      `)
      .neq("role", "admin"); // exclude admin

    if (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } else {
      // Map to a simple array
      const formattedUsers = data.map((u) => ({
        id: u.users.id,
        email: u.users.email,
        created_at: u.users.created_at,
        role: u.role,
      }));
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete a user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setDeletingUserId(userId);

    // 1️⃣ Delete from userroles
    const { error: roleError } = await supabase
      .from("userroles")
      .delete()
      .eq("id", userId);

    // 2️⃣ Delete from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (roleError || authError) {
      console.error("Error deleting user:", roleError || authError);
      alert("Failed to delete user. Check console for details.");
    } else {
      alert("User deleted successfully!");
      fetchUsers();
    }

    setDeletingUserId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-semibold mb-8 text-indigo-700 text-center">
        Registered Users
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 bg-white p-5 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{user.email}</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {user.id}</p>
              <p className="text-sm text-gray-500 mt-1">
                Created at: {new Date(user.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Role: {user.role}</p>
            </div>
            <button
              onClick={() => handleDelete(user.id)}
              disabled={deletingUserId === user.id}
              className="mt-4 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deletingUserId === user.id ? "Deleting..." : "Delete User"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
