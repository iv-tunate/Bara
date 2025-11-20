"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import EyeToggle from "@/components/EyeToggle";
import { Suspense } from "react";
import Logo from "@/components/Logo";
type Role = "Writer" | "Producer" | "Admin";

interface RegisterDTO {
  Email: string;
  Password: string;
  Type: Role;
}

function RegisterPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<Role>("Writer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const registerUrl = process.env.NEXT_PUBLIC_REGISTER_USER;

  const showPasswordRequirements = password.length > 0;
  const passwordCriteria = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[#?!@$%^&*-]/.test(password),
    upperCase: /[A-Z]/.test(password),
  };

  const isValidPassword =
    passwordCriteria.length &&
    passwordCriteria.number &&
    passwordCriteria.special &&
    passwordCriteria.upperCase;

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (
      typeParam === "Writer" ||
      typeParam === "Producer" ||
      typeParam === "Admin"
    ) {
      setUserType(typeParam);
    }
  }, [searchParams]);

  const doPasswordsMatch =
    password === confirmPassword && confirmPassword !== "";

  const canContinue =
    email.trim() !== "" && termsChecked && isValidPassword && doPasswordsMatch;

  const handleContinue = async () => {
    if (canContinue) {
      setIsLoading(true);

      try {
        const registerData: RegisterDTO = {
          Email: email,
          Password: password,
          Type: userType,
        };

        const response = await fetch(`${baseUrl}${registerUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(registerData),
        });
        const resBody = await response.json();
        const userId = resBody.data.userId;
        localStorage.setItem("userId", userId);
        localStorage.setItem("userType", userType);
        if (response.ok) {
          setShowSuccess(true);
          //console.log("Navigating to verify-email with email:", email);
          setTimeout(() => {
            if (email && email.trim()) {
              router.push(
                `/auth/verify-email?email=${encodeURIComponent(email)}`
              );
            } else {
              console.error(
                "Email is empty or undefined, cannot navigate to verify-email"
              );
            }
          }, 1000);
        } else {
          const errorData = await response.json();
          console.error("Registration failed:", errorData);
        }
      } catch (error) {
        console.error("Registration error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0000] px-4">
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl h-[600px]">
        <div className="flex-1 flex flex-col justify-center overflow-y-auto">
          <div className="px-8">
            <Logo />
          </div>
          <div className="py-0 md:px-10">
            <div>
              <h1 className="text-2xl font-semibold mb-8 text-[#22242A]">
                Create a{" "}
                <span className="font-bold text-2xl text-[#800000]">
                  {userType}
                </span>{" "}
                account
              </h1>

              {/* Google Button */}
              {/* <button
            onClick={handleGoogleClick}
            className="w-full bg-[#800000] text-white font-medium py-3 rounded-md hover:bg-[#1a0000] flex items-center justify-center gap-4"
          >
            <Image src="/Google.png" alt="Google Icon" width={20} height={20} />
            Create with Google
          </button> */}

              {/* <div className="flex items-center justify-center my-4">
              <span className="text-sm text-[#333740]">or</span>
            </div> */}

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

              <label className="block text-sm font-medium text-[#22242A] mb-2">
                Password
              </label>
              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white
                  focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                />
                <EyeToggle
                  isVisible={showPassword}
                  onToggle={() => setShowPassword((p) => !p)}
                />
              </div>

              {showPasswordRequirements && (
                <div className="text-xs mt-2 mb-2 ml-1">
                  <p
                    className={`flex items-center gap-2 ${
                      passwordCriteria.length
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordCriteria.length && (
                      <Image
                        src="/check.png"
                        alt="valid"
                        width={10}
                        height={10}
                      />
                    )}
                    <span>At least 8 characters</span>
                  </p>
                  <p
                    className={`flex items-center gap-2 ${
                      passwordCriteria.number
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordCriteria.number && (
                      <Image
                        src="/check.png"
                        alt="valid"
                        width={10}
                        height={10}
                      />
                    )}
                    <span>Contains at least a number</span>
                  </p>
                  <p
                    className={`flex items-center gap-2 ${
                      passwordCriteria.special
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordCriteria.special && (
                      <Image
                        src="/check.png"
                        alt="valid"
                        width={10}
                        height={10}
                      />
                    )}
                    <span>Contains at least a special character</span>
                  </p>
                  <p
                    className={`flex items-center gap-2 ${
                      passwordCriteria.upperCase
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordCriteria.upperCase && (
                      <Image
                        src="/check.png"
                        alt="valid"
                        width={10}
                        height={10}
                      />
                    )}
                    <span>Contains at least an uppercase letter</span>
                  </p>
                </div>
              )}

              <label className="block text-sm font-medium text-[#22242A] mb-2">
                Confirm password
              </label>
              <div className="relative mb-2">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 bg-white
                  focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
                />
                <EyeToggle
                  isVisible={showConfirm}
                  onToggle={() => setShowConfirm((p) => !p)}
                />
              </div>
              {confirmPassword.length > 0 && !doPasswordsMatch && (
                <p className="text-red-600 text-sm mb-3">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start mt-4">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 mr-2 accent-[#810306]"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
              />
              <label htmlFor="terms" className="text-xs text-[#333740]">
                By checking this box, you agree to the IP policy and Terms of
                use of Bara.
              </label>
            </div>
            <div className="mt-2">
              {/* Continue Button */}
              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue || isLoading}
                className={`w-full font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                  canContinue && !isLoading
                    ? "bg-[#800000] text-white hover:bg-[#1a0000]"
                    : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
                }`}
              >
                {isLoading ? "Creating account..." : "Continue"}
                {!isLoading && <span className="ml-2 text-lg">→</span>}
              </button>

              {showSuccess && (
                <div className="mx-auto mt-6 w-72 flex items-center justify-center border border-[#0DA500] rounded-md px-2 py-2 text-[#0DA500] text-sm font-medium gap-2">
                  <Image
                    src="/Check_ring.png"
                    alt="Success Icon"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  Registration Successful
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:w-1/2 relative hidden md:flex items-center justify-center p-8">
          <Image
            src="/Mask group.png"
            alt="Register Illustration"
            width={350}
            height={350}
            className="object-contain"
          />
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading register form…</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
