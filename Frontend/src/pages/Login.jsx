import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { loginUser } from "../authSlice";
import axiosClient from "../utils/axiosClient";
import { useEffect, useState } from "react";

//Schema validation

const logInSchema = z.object({
  emailId: z.string().email("email sahi se likh"),
  password: z.string().min(8, "Password chhota hai abhi"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth,
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(logInSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (searchParams.get("error") === "google_auth_failed") {
      setGoogleError("Google login failed. Please try again.");
    } else {
      setGoogleError("");
    }
  }, [searchParams]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  const handleGoogleLogin = () => {
    const apiBase = axiosClient.defaults.baseURL || "http://localhost:5000";
    window.location.href = `${apiBase}/user/google`;
  };

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-base-100 rounded-md shadow-md border border-base-300 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">LeetCode</h1>
          <p className="text-sm text-base-content/60 mt-2">
            Log in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              {...register("emailId", { required: true })}
              placeholder="jhon@example.com"
              className="input input-bordered w-full"
              type="email"
            />
            {errors.emailId && (
              <p className="text-error text-sm mt-1">
                {errors.emailId.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <div className="relative">
              <input
                {...register("password", { required: true })}
                placeholder="********"
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 text-base-content/70 hover:text-base-content"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.477 10.486a3 3 0 004.038 4.038M9.88 5.093A10.45 10.45 0 0112 4.875c4.478 0 8.268 2.943 9.543 7.125a10.523 10.523 0 01-4.17 5.674M6.228 6.228A10.451 10.451 0 002.457 12a10.523 10.523 0 005.535 6.137"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-neutral w-full mt-1"
            disabled={loading}
          >
            {loading ? "Loging In..." : "Log In"}
          </button>

          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>

          {(error || googleError) && (
            <p className="text-error text-sm text-center">
              {googleError || error}
            </p>
          )}

          <div className="text-center text-sm text-base-content/60 pt-2">
            New here?{" "}
            <button
              type="button"
              className="link link-hover"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
