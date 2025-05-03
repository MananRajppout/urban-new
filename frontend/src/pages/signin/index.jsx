import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
import { iosLogIn, logIn } from "@/lib/api/ApiAuth";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { isIOS, isMacOs, browserName } from 'react-device-detect';


const SignInPage = () => {
  const router = useRouter();
  const { verified } = router.query;



  //check for device and browser for login
  const shouldRenderGoogleLogin =
  (isIOS || isMacOs) && (browserName === "Chrome" || browserName === "Safari");

  const [isSubmit, setIsSubmit] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

  const formData = useRef({
    email: "",
    password: "",
  });

  useEffect(() => {
    document.title = "Sign In | UrbanChat.ai";

    console.log('check for ',verified)
    if (verified === "true") {
      toast.success("Account verified successfully, please login to continue.");
    }
  }, [verified]);

  const onSignInSubmit = async () => {
    if (isSubmit) return;

    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (formData.current.email === "") {
      setEmailError("Please enter your email");
      return;
    }

    if (formData.current.password === "") {
      setPasswordError("Please enter your password");
      return;
    }

    try {
      setIsSubmit(true);
      const res = await logIn(
        formData.current.email,
        formData.current.password
      );

      if (res.data && res.data.token) {
        localStorage.setItem("access_token", res.data.token);

        // Dispatch a custom event to notify Navbar about the login
        const event = new Event("login");
        window.dispatchEvent(event);

        toast.success("Signed in successfully!");
        window.location.href = "/ai-voice-agent";
      } else {
        toast.error(res.message || "An error occurred while logging in.");
        setGeneralError(res.message || "An error occurred while logging in.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast.error(errorMessage);
      setGeneralError(errorMessage);
    } finally {
      setIsSubmit(false);
    }
  };



  //use for lognin with google loginios function  remove the passport js 
  const handleGoogleSignIn = () => {
    window.location.href = "https://backend.urbanchat.ai/api/auth/google";
 

  };

  //use log in for ios here and macbook here and also same use for window remove the passport js 
  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const accessToken = tokenResponse.access_token;
  
        const res = await iosLogIn({
          access_token: accessToken,
        });

         const token=res.data.token;
      
        localStorage.setItem("access_token",token);
        const event = new Event("signup");

        window.dispatchEvent(event);
        setTimeout(() => {
          router.push("/ai-voice-agent");
        }, 500);
  
       
      } catch (err) {
        setIsLoading(false);
        console.log(' Error calling backend:', err);
      }
    },
    onError: () => {
      console.log(" Google Login Failed");
    },
  });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <ParticleBackground />

      {/* Floating gradient orbs */}
      <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
      <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/10 blur-[120px] animate-pulse-slow animation-delay-1000" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-4xl md:text-5xl font-bold text-gradient inline-block mb-0"
          >
            UrbanChat.ai
          </Link>
          <p className="text-foreground/70 mb-0">
            Welcome back! Sign in to continue
          </p>
        </div>

        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-1">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full cursor-pointer border border-subtle-border rounded-sm flex items-center justify-center gap-2 py-5 hover:bg-white/10"
              onClick={loginGoogle}
            >
              {isLoading ? <>
                  <div>
                    <svg class="w-5 h-5 animate-spin mt-0.5" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="stroke" values="#4285F4;#EA4335;#FBBC05;#34A853;#4285F4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </div>
                  <span >Signing in with Google......</span>
                </>
                  : <>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path
                          fill="#4285F4"
                          d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                        />
                      </g>
                    </svg>
                    Sign in with Google

                  </>}
            </Button>

            <div className="flex items-center gap-2 py-2">
              <div className="flex-grow bg-white/10 h-[1px]" />
              <span className="text-xs text-foreground/50">OR</span>
              <div className="flex-grow bg-white/10 h-[1px]" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 rounded-sm border border-subtle-border"
                  onChange={(e) => (formData.current.email = e.target.value)}
                />
              </div>
              {emailError && (
                <span className="text-red-500 text-xs">{emailError}</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  href="/password-reset"
                  className="text-xs text-brand-green hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 rounded-sm border border-subtle-border"
                  onChange={(e) => (formData.current.password = e.target.value)}
                />
              </div>
              {passwordError && (
                <span className="text-red-500 text-xs">{passwordError}</span>
              )}
            </div>

            {/* General error message */}
            {generalError && (
              <p className="text-red-500 text-sm">{generalError}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full border-0 cursor-pointer bg-brand-green hover:bg-brand-green-dark text-black font-semibold"
              onClick={onSignInSubmit}
            >
              {isSubmit ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                  Signing In...
                </span>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
            <p className="text-center text-sm text-foreground/70">
              Don&rsquo;t have an account?{" "}
              <Link
                href="/signup"
                className="text-brand-green hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-foreground/70 hover:text-foreground flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
