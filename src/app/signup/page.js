"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";  // 🔥 USE API CLIENT

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (formData) => {
        setIsLoading(true);

        try {
            // 🔥 Use ApiClient instead of raw fetch
            const result = await api.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            if (result.status === "success") {
                toast.success("Account created! Redirecting to login...");

                setTimeout(() => {
                    router.push("/login");
                }, 1200);
            } else {
                toast.error(result.message || "Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("Server error. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <Toaster />

            <div className="glass-panel w-full max-w-md rounded-[32px] p-10 text-white">

                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-emerald-300 mb-2">
                            VESNS
                        </h1>
                    </Link>
                    <p className="text-slate-400">Create your account to get started.</p>
                </div>

                {/* Signup Form */}
                <AuthForm
                    type="signup"
                    onSubmit={handleSignup}
                    isLoading={isLoading}
                />

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-4 text-sm text-slate-400">or</span>
                    <div className="flex-1 border-t border-white/10"></div>
                </div>

                {/* Login link */}
                <p className="text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
