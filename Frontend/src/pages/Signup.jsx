import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { registerUser, checkAuth } from "../authSlice";
import axiosClient from "../utils/axiosClient";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

//Schema validation

const signUpSchema = z.object({
  firstName: z.string().min(4, "First name must be at least 4 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");

  // OTP Verification States
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(null);

  const { isAuthenticated, error } = useSelector(
    (state) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (searchParams.get("error") === "google_auth_failed") {
      setGoogleError("Google signup failed. Please try again.");
    } else {
      setGoogleError("");
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    setLocalLoading(true);
    setGoogleError("");
    setMessage("");
    try {
      await axiosClient.post("/user/send-otp", {
        name: data.firstName,
        emailId: data.emailId,
        password: data.password,
      });
      setMessage("OTP sent to your email!");
      setFormData(data);
      setStep(2);
    } catch (err) {
      setGoogleError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setGoogleError("");
    try {
      await axiosClient.post("/user/verify-otp", {
        name: formData.firstName,
        emailId: formData.emailId,
        password: formData.password,
        otp,
      });
      setMessage("Registration successful! 🎉 Redirecting to home...");
      dispatch(checkAuth());
    } catch (err) {
      setGoogleError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const apiBase = axiosClient.defaults.baseURL || "http://localhost:5000";
    window.location.href = `${apiBase}/user/google`;
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#262626] rounded-lg border border-[#3a3a3a] p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#e0e0e0]">CodeJudge</h1>
          <p className="text-sm text-[#8a8a8a] mt-2">
            Create your account
          </p>
        </div>

        {message && (
          <div className="alert alert-success mb-4 text-sm py-2 rounded-md">
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text text-[#e0e0e0]">First Name</span>
              </label>
              <input
                {...register("firstName", { required: true })}
                placeholder="Jhon"
                className="input input-bordered w-full bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] placeholder-[#8a8a8a] focus:border-[#ffa116] focus:outline-none rounded-lg"
              />
              {errors.firstName && (
                <p className="text-error text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text text-[#e0e0e0]">Email</span>
              </label>
              <input
                {...register("emailId", { required: true })}
                placeholder="jhon@example.com"
                className="input input-bordered w-full bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] placeholder-[#8a8a8a] focus:border-[#ffa116] focus:outline-none rounded-lg"
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
                <span className="label-text text-[#e0e0e0]">Password</span>
              </label>
              <div className="relative">
                <input
                  {...register("password", { required: true })}
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-12 bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] placeholder-[#8a8a8a] focus:border-[#ffa116] focus:outline-none rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-[#8a8a8a] hover:text-[#e0e0e0]"
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

            <motion.button
              type="submit"
              className="btn w-full mt-1 rounded-md border-none bg-[#ffa116] text-[#1a1a1a] hover:bg-[#ffb84d]"
              disabled={localLoading}
              whileTap={{ scale: 0.98 }}
            >
              {localLoading ? "Sending OTP..." : "Sign Up"}
            </motion.button>

            <motion.button
              type="button"
              className="btn btn-outline w-full rounded-md border-[#3a3a3a] text-[#e0e0e0] hover:border-[#ffa116] hover:bg-[#333333] hover:text-[#e0e0e0]"
              onClick={handleGoogleSignup}
              whileTap={{ scale: 0.98 }}
            >
              Continue with Google
            </motion.button>

            {(error || googleError) && (
              <p className="text-error text-sm text-center">
                {googleError || error}
              </p>
            )}

            <div className="text-center text-sm text-[#8a8a8a] pt-2">
              Have an account?{" "}
              <button
                type="button"
                className="link link-hover text-[#ffa116]"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-center text-sm text-[#e0e0e0]">
              Enter the OTP sent to <strong>{formData?.emailId}</strong>
            </p>

            <div>
              <label className="label">
                <span className="label-text text-[#e0e0e0]">OTP</span>
              </label>
              <input
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="input input-bordered w-full text-center tracking-widest text-lg bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] focus:border-[#ffa116] focus:outline-none rounded-lg"
              />
            </div>

            <motion.button
              type="submit"
              className="btn w-full mt-1 rounded-md border-none bg-[#ffa116] text-[#1a1a1a] hover:bg-[#ffb84d]"
              disabled={localLoading}
              whileTap={{ scale: 0.98 }}
            >
              {localLoading ? "Verifying..." : "Verify & Register"}
            </motion.button>

            <motion.button
              type="button"
              className="btn btn-outline w-full rounded-md border-[#3a3a3a] text-[#e0e0e0] hover:border-[#ffa116] hover:bg-[#333333] hover:text-[#e0e0e0]"
              onClick={() => setStep(1)}
              disabled={localLoading}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>

            {googleError && (
              <p className="text-error text-sm text-center mt-2">
                {googleError}
              </p>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default Signup;
