import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "../components/ThemeToggle";
import loginMusicStudio from "../assets/images/login-music-studio.png";
import toast from "react-hot-toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-spotify-black px-4 transition-colors duration-300">
      <img
        src={loginMusicStudio}
        alt=""
        className="absolute inset-0 h-full w-full object-cover brightness-125"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,185,84,0.16),transparent_34%)]" />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex min-h-screen w-full items-center justify-center py-10"
      >
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-spotify-green shadow-xl shadow-spotify-green/20">
              <span className="text-2xl font-bold text-black">M</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome</h1>
            <p className="mt-2 text-spotify-light">Sign in to MelodyMind AI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-black/55 p-8 shadow-2xl backdrop-blur-xl">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder=""
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-spotify-light">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-spotify-green hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
