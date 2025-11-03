"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EyeToggle from "@/components/EyeToggle";
import { api } from "@/utils/api";
import { generateDeviceFingerprint } from "@/utils/deviceDetection";
import { setUserSession } from "@/utils/tokenManager";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [isResending, setIsResending] = useState(false);
  //  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loginVerificationState, setLoginVerificationState] =
    useState<boolean>(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const resendVerificationTokenUrl =
    process.env.NEXT_PUBLIC_RESEND_VERIFICATION_TOKEN;
  const router = useRouter();

  const canLogin = email.trim() !== "" && password.trim() !== "";

 const handleLogin = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsLoading(true);
   setError("");

   try {
     const deviceFingerprint = generateDeviceFingerprint();

     const request = await api.login({
       Email: email,
       Password: password,
       LoginDevice: deviceFingerprint,
     });

     const response = request.data?.data;

     if (request.success && response) {
       if (!response.accessToken) {
         setNeedsVerification(true);
         toast.success(
           "Please verify your login. A code has been sent to your email."
         );
         return; 
       }
       setUserSession({
         userId: response.userId,
         email: response.email,
         name: response.name,
         userType: response.role,
         accessToken: response.accessToken,
         wrongLoginAttempts: response.wrongLoginAttempts,
         profileComplete: response.isProfileSetupComplete,  
       });

       if (!response.isProfileSetupComplete) {
         router.push(`/profile/setup/${response.role.toLowerCase()}`);
       } else {
         router.push("/dashboard");
       }
       
     } else {
       const errorMessage =
         request.message || "Login failed. Please try again.";
       setError(errorMessage);
       toast.error(errorMessage);
     }
   } catch (error) {
     console.error("Login error:", error);
     const errorMessage = "An unexpected error occurred. Please try again.";
     setError(errorMessage);
     toast.error(errorMessage);
   } finally {
     setIsLoading(false);
   }
 };


  const handleVerifyLogin = async () => {
    if (!verificationToken.trim()) {
      setError("Please enter the verification token.");
      setLoginVerificationState(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const deviceFingerprint = generateDeviceFingerprint();

      const request = await api.verifyLogin({
        Email: email,
        Token: verificationToken,
        Device: deviceFingerprint,
      });

      if (request.success && request.data) {
        const response = request.data.data;

        setUserSession({
          userId: response.userId,
          email: response.email,
          name: response.name,
          userType: response.role || "Unknown",
          accessToken: response.accessToken,
          wrongLoginAttempts: response.wrongLoginAttempts,
          profileComplete: response.isProfileSetupComplete,  
        });

        if (!response.isProfileSetupComplete) {
          if (response.role === "Producer") {
            router.push("/profile/setup/producer");
          } else if (response.role === "Writer") {
            router.push("/profile/setup/writer");
          } //else {
          //router.push(`/dashboard`);
          //}
        } else {
          router.push("/dashboard");
        }
      } else {
        const errorMessage =
          request.message || "Verification failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoginVerificationState(false);
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoginVerificationState(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    const deviceFingerprint = generateDeviceFingerprint();

    try {
      const response = await fetch(
        `${baseUrl}${resendVerificationTokenUrl}/${email}/login/${deviceFingerprint}`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const res = await response.json();

      if (response.ok) {
        toast.success(
          "Verification token has been resent successfully! Please check your mail box."
        );
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorMessage =
          res.message || "Could not resend verification email.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch {
      const errorMessage = "Something went wrong while resending.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0000] px-4">
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-5xl h-[600px] overflow-hidden">
        {/* Left: 40% width full-bleed image */}
        <div className="hidden md:block md:w-2/5 relative">
          <Image
            src="/family.png"
            alt="Login Illustration"
            fill
            className="object-cover object-left-top"
            priority
          />
        </div>

        {/* Right: Form Section (60%) */}
        <div className="flex-1 md:w-3/5 relative flex flex-col justify-center items-center px-6 md:px-12 overflow-y-auto">
          <div className="w-full max-w-sm ">
            {" "}
            <div className="absolute top-6 left-4">
              <BackButton label="Back" href="/" />
            </div>
            <div className="mb-4 self-start">
              <Image src="/logo.png" alt="Bara Logo" width={70} height={40} />
            </div>
            {/* Heading (left-aligned) */}
            <h1 className="text-2xl font-semibold mb-8 text-[#22242A] text-left">
              {needsVerification ? "Verify Login" : "Log in"}
            </h1>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {needsVerification ? (
              /* Verification Form */
              <>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    We&apos;ve sent a verification code to your email. Please
                    enter it below to complete your login.
                  </p>
                </div>

                <label className="block text-sm font-medium text-[#22242A] mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                  maxLength={6}
                />

                <button
                  type="button"
                  onClick={handleVerifyLogin}
                  disabled={!verificationToken.trim() || isLoading}
                  className={`w-full font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    verificationToken.trim() && !isLoading
                      ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                      : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
                  }`}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isLoading ? "Verifying..." : "Verify Login"}
                  {!isLoading && <span className="ml-2 text-lg">→</span>}
                </button>

                <div className="mt-2 pt-2 border-t border-gray-200 flex">
                  <button
                    type="button"
                    onClick={() => {
                      setNeedsVerification(false);
                      setVerificationToken("");
                      setError("");
                    }}
                    className="w-full mt-3 text-sm text-[#333740] text-left hover:text-[#800000] transition-colors cursor-pointer"
                  >
                    ← Back to login
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={
                      !loginVerificationState ||
                      isResending ||
                      resendCooldown > 0
                    }
                    className={`w-full mt-3 text-sm rounded-md text-right transition-colors ${
                      !loginVerificationState ||
                      isResending ||
                      resendCooldown > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#333740] hover:text-[#800000] cursor-pointer"
                    }`}
                  >
                    {isResending
                      ? "Sending..."
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Google Login */}
                {/* <button
                  type="button"
                  className="w-full bg-[#800000] text-white font-medium py-3 rounded-md hover:bg-[#1a0000] flex items-center justify-center gap-4 mb-6"
                >
                  <Image
                    src="/Google.png"
                    alt="Google Icon"
                    width={20}
                    height={20}
                  />
                  Log in with Google
                </button> */}
                {/* <div className="flex items-center justify-center my-4">
                  <span className="text-sm text-[#333740]">or</span>
                </div> */}
                {/* Email */}
                <label className="block text-sm font-medium text-[#22242A] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-3 mb-4 bg-white focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                />
                {/* Password */}
                <label className="block text-sm font-medium text-[#22242A] mb-2">
                  Password
                </label>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white
          focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                  />
                  <EyeToggle
                    isVisible={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                  />
                </div>
                {/* Forgot Password + Actions */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <a
                    href="/auth/forgot-password"
                    className="text-[#333740] font-medium text-medium"
                  >
                    Forgot your password?
                  </a>
                </div>
                {/* Login Button */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={!canLogin || isLoading}
                  className={`w-full font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    canLogin && !isLoading
                      ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                      : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
                  }`}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isLoading ? "Logging in..." : "Log in"}
                  {!isLoading && <span className="ml-2 text-lg">→</span>}
                </button>
                {/* Create Account */}

                <p className="text-sm text-center mt-6 text-[#333740] font-medium text-medium">
                  Don’t have an account?{" "}
                  <a
                    href="/auth/register"
                    className="text-[#810306] underline font-medium text-medium"
                  >
                    Create account
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
