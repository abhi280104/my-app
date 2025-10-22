import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { jwtDecode } from "jwt-decode";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session) {
          const decoded = jwtDecode(session.access_token);
          const role = decoded.user_role?.trim();
          if (role === "admin") navigate("/admin/dashboard", { replace: true });
          else navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err.message);
      } finally {
        setLoadingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoadingRegister(true);
    try {
      const { data, error: registerError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (registerError) throw registerError;

      alert("Registration successful! Please check your email to confirm.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRegister(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-700 text-lg animate-pulse">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Create Account</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={confirmPassword}
            data-testid="confirm-password-input"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loadingRegister}
            data-testid="register-button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition"
          >
            {loadingRegister ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="my-6 text-center text-gray-400 relative">
          <span className="bg-white px-3 relative z-10">or</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 -z-0"></div>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white border border-gray-300 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default Register;
