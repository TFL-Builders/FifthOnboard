import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../../Components/Input";
import { Button } from "../../Components/Button";
import { ErrorBanner } from "../../Components/ErrorBanner";
import { sanitizeEmail } from "../../lib/sanitize";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { emailError } from "../../lib/validators";
import { api } from "../../lib/apiClient";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const emailErr = emailError(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailErr) return;
    setError("");
    setSubmitting(true);
    try {
      // Always responds 200 with the same message whether or not the email
      // exists — so success here just means "the request went through",
      // not "that address definitely has an account."
      await api.post("/auth/forgot-password", { email: sanitizeEmail(email) });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="full-login flex justify-center items-center bg-background h-screen">
        <div className="main-login flex flex-col text-center max-w-md">
            <div className="page-container bg-background flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5">
                <div className="card flex flex-col justify-around gap-4 px-6">
                    <div className="flex flex-col">
                                <p className="text-[36px] pt-5 font-bold welcome">Eyy.. you forgot</p>
                                <div className="h-6 text-[#64748B]">Kindly write down your email and get your code</div>
                    </div>
                    {submitted ? (
                      <div className="text-[14px] text-[#64748B] px-2 pb-4">
                        If that email exists, you'll receive a reset link shortly. Check your inbox.
                      </div>
                    ) : (
                      <div>
                          <form onSubmit={handleSubmit} id="emailForgot" className="flex flex-col">
                              <ErrorBanner message={error} />
                              <Input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                                error={emailTouched ? emailErr : ""}
                                required
                              />
                              <Button form="emailForgot" type="submit" disabled={submitting || Boolean(emailErr)}>
                                {submitting ? "Sending..." : "Submit"}
                              </Button>
                          </form>
                      </div>
                    )}
                    <div className="flex justify-center items-center gap-1 text-[13px] pb-4">
                        <span className="text-[#64748B]">Remembered your password?</span>
                        <Link to="/" className="text-primary hover:brightness-150 transition">Sign In</Link>
                    </div>
                </div>
            </div>
            <div className="text-[#64748B] c2026">© 2026 Staff Onboarding Platform. All rights reserved.</div>
        </div>
    </div>
  )
}

export default ForgotPass
