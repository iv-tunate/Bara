"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import EyeToggle from "@/components/EyeToggle";
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
    if (!canContinue) return;
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
      if (response.ok) {
        localStorage.setItem("userId", resBody.data.userId);
        localStorage.setItem("userType", userType);
        setShowSuccess(true);
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        }, 1000);
      } else {
        console.error("Registration failed:", resBody);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0000] px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Form Section */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-12 overflow-y-auto">
          <div className="mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold mb-6 text-[#22242A]">
            Create a{" "}
            <span className="font-bold text-2xl text-[#800000]">
              {userType}
            </span>{" "}
            account
          </h1>

          {/* Email */}
          <label className="block text-sm font-medium text-[#22242A] mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-3 mb-4 focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
          />

          {/* Password */}
          <label className="block text-sm font-medium text-[#22242A] mb-2">
            Password
          </label>
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
            />
            <EyeToggle
              isVisible={showPassword}
              onToggle={() => setShowPassword((p) => !p)}
            />
          </div>

          {showPasswordRequirements && (
            <div className="text-xs mt-2 mb-2 ml-1 space-y-1">
              <p
                className={`flex items-center gap-2 ${
                  passwordCriteria.length ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordCriteria.length && (
                  <Image src="/check.png" alt="valid" width={10} height={10} />
                )}
                At least 8 characters
              </p>
              <p
                className={`flex items-center gap-2 ${
                  passwordCriteria.number ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordCriteria.number && (
                  <Image src="/check.png" alt="valid" width={10} height={10} />
                )}
                Contains at least a number
              </p>
              <p
                className={`flex items-center gap-2 ${
                  passwordCriteria.special ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordCriteria.special && (
                  <Image src="/check.png" alt="valid" width={10} height={10} />
                )}
                Contains at least a special character
              </p>
              <p
                className={`flex items-center gap-2 ${
                  passwordCriteria.upperCase ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordCriteria.upperCase && (
                  <Image src="/check.png" alt="valid" width={10} height={10} />
                )}
                Contains at least an uppercase letter
              </p>
            </div>
          )}

          {/* Confirm Password */}
          <label className="block text-sm font-medium text-[#22242A] mb-2">
            Confirm password
          </label>
          <div className="relative mb-2">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full border border-[#ABADB2] rounded-md px-3 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000]"
            />
            <EyeToggle
              isVisible={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
            />
          </div>
          {confirmPassword.length > 0 && !doPasswordsMatch && (
            <p className="text-red-600 text-sm mb-3">Passwords do not match.</p>
          )}

          {/* Terms */}
          <div className="flex items-start mt-4 mb-4">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 mr-2 accent-[#810306]"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
            />
            <label htmlFor="terms" className="text-xs text-[#333740]">
              By checking this box, you agree to the IP policy and Terms of use
              of Bara.
            </label>
          </div>

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
            <div className="mx-auto mt-6 w-full md:w-72 flex items-center justify-center border border-[#0DA500] rounded-md px-2 py-2 text-[#0DA500] text-sm font-medium gap-2">
              <Image
                src="/Check_ring.png"
                alt="Success Icon"
                width={16}
                height={16}
              />
              Registration Successful
            </div>
          )}
        </div>

        {/* Illustration */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-[#f9f9f9] p-8">
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
