import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "../../Components/Input";
import { PasswordInput } from "../../Components/PasswordInput";
import { Button } from "../../Components/Button";
import { ErrorBanner } from "../../Components/ErrorBanner";
import { useAuth } from "../../context/AuthContext";
import { sanitizeEmail } from "../../lib/sanitize";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { emailError } from "../../lib/validators";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(Boolean(location.state?.resetSuccess));
  const [inviteAccepted, setInviteAccepted] = useState(Boolean(location.state?.inviteAccepted));
  const [emailTouched, setEmailTouched] = useState(false);

  const emailErr = emailError(email);
  const isFormValid = !emailErr && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setResetSuccess(false);
    setInviteAccepted(false);
    setSubmitting(true);
    try {
      await login(sanitizeEmail(email), password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="full-login flex justify-center items-center bg-background h-screen">
        <div className="flex flex-col text-center main-login max-w-md">
            <div className="page-container flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5">
                <div className="card flex flex-col justify-around gap-8 px-6">
                            <div className="flex flex-col">
                                <p className="text-[36px] pt-5 font-bold welcome">Welcome Back</p>
                                <div className="h-6 text-[#64748B]">Sign in to your account to continue</div>
                            </div>


                            <div>
                                <form id="login-form" onSubmit={handleSubmit} className="flex flex-col login-form">

                                {resetSuccess && (
                                  <div className="text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-left">
                                    Your password has been reset. Sign in with your new password.
                                  </div>
                                )}
                                {inviteAccepted && (
                                  <div className="text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-left">
                                    Your account is ready. Sign in to get started.
                                  </div>
                                )}
                                <ErrorBanner message={error} />

                                <Input
                                  label="Email Address"
                                  type="email"
                                  id="email-add"
                                  placeholder="Enter your email address"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  onBlur={() => setEmailTouched(true)}
                                  error={emailTouched ? emailErr : ""}
                                  required
                                />

                                <PasswordInput
                                  label="Password"
                                  id="pass"
                                  placeholder="Enter password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                />
                                </form>
                                <Button form="login-form" type="submit" disabled={submitting || !isFormValid}>
                                  {submitting ? "Signing in..." : "Sign In"}
                                </Button>
                                <div className="flex justify-center items-center gap-50 text-[13px] p-2">
                                    <div><Link to="/create-account" className="text-primary hover:brightness-150 transition">Create Account</Link></div>
                                    <div><Link to="/forgot-password" className="text-primary hover:brightness-150 transition">Forgot Password</Link></div>

                                </div>


                                <div>
                                        <div className="border-t border-[#E2E8F0]"></div>
                                        <div className="flex justify-center items-center gap-1 p-6">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.99967 18.3333C9.99967 18.3333 16.6663 15 16.6663 10V4.16667L9.99967 1.66667L3.33301 4.16667V10C3.33301 15 9.99967 18.3333 9.99967 18.3333Z" stroke="#64748B" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <p className="text-[#64748B]">Enterprise-grade security and authentication</p>
                                        </div>
                                </div>
                            </div>
                </div>
            </div>
            <div className="text-[#64748B] c2026">© 2026 Staff Onboarding Platform. All rights reserved.</div>
        </div>
    </div>
  )
}

export default Login;
