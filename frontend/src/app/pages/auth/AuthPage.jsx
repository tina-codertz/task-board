import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// role → Route mapping
const getDashboardRoute = (role) => {
  const normalizedRole = role?.toLowerCase();
  switch (normalizedRole) {
    case "admin":
      return "/dashboard/admin";
    case "manager":
      return "/dashboard/manager";
    case "user":
      return "/dashboard/member";
    default:
      return "/dashboard/member";
  }
};

function Input({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <Icon size={18} className="text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        className="w-full outline-none text-sm"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <Lock size={18} className="text-gray-400" />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="w-full outline-none text-sm"
        value={value}
        onChange={onChange}
      />
      <button type="button" onClick={() => setShow(!show)}>
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const user = await login(loginData.email, loginData.password);

    if (user) {
      navigate(getDashboardRoute(user.role)); // role-based redirect
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    const user = await register(
      registerData.name,
      registerData.email,
      registerData.password
    );

    if (user) {
      navigate(getDashboardRoute(user.role)); //  role-based redirect
    } else {
      setError("Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

        <h1 className="text-2xl font-bold text-center text-gray-800">
          TaskBoard
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Manage your tasks easily
        </p>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
              }}
              className={`flex-1 py-2 text-sm rounded-md ${
                tab === t
                  ? "bg-white shadow text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {t === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded mb-4">
            {error}
          </div>
        )}

        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />

            <PasswordInput
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              placeholder="Password"
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded-xl">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <Input
              icon={User}
              type="text"
              placeholder="Full Name"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({ ...registerData, name: e.target.value })
              }
            />

            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />

            <PasswordInput
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              placeholder="Password"
            />

            <PasswordInput
              value={registerData.confirm}
              onChange={(e) =>
                setRegisterData({ ...registerData, confirm: e.target.value })
              }
              placeholder="Confirm Password"
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded-xl">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}