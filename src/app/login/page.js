"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api"; // 🔥 USE YOUR API CLIENT

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (formData) => {
        setIsLoading(true);

        try {
            // 🔥 Use ApiClient instead of raw fetch
            const result = await api.login({
                email: formData.email,
                password: formData.password,
            });

            if (result.status === "success") {
                toast.success("Login successful!");

                // Token is saved automatically by api.setToken() 🎉

                setTimeout(() => {
                    router.push("/"); // redirect to home
                }, 1000);
            } else {
                toast.error(result.message || "Invalid login credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Unable to connect to backend");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <Toaster />

            <div className="glass-panel w-full max-w-md rounded-[32px] p-10 text-white">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-emerald-300 mb-2">
                            VESNS
                        </h1>
                    </Link>
                    <p className="text-slate-400">
                        Welcome back! Please login to your account.
                    </p>
                </div>

                {/* Login Form */}
                <AuthForm
                    type="login"
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                />

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-4 text-sm text-slate-400">or</span>
                    <div className="flex-1 border-t border-white/10"></div>
                </div>

                {/* Sign up link */}
                <p className="text-center text-sm text-slate-400">
                    Don't have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
