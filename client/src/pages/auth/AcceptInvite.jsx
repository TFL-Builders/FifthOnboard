import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Input } from "../../Components/Input";
import { PasswordInput } from "../../Components/PasswordInput";
import { Button } from "../../Components/Button";
import { ErrorBanner } from "../../Components/ErrorBanner";
import { PasswordRulesChecklist } from "../../Components/PasswordRulesChecklist";
import { sanitizeText } from "../../lib/sanitize";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { isPasswordValid } from "../../lib/passwordRules";
import { fullNameError } from "../../lib/validators";
import { acceptInvite } from "../../lib/invitesApi";

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const fullNameErr = fullNameError(fullName);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = Boolean(token) && !fullNameErr && isPasswordValid(password) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      await acceptInvite(token, { name: sanitizeText(fullName), password });
      navigate("/", { state: { inviteAccepted: true } });
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="full-create flex justify-center items-center bg-background min-h-screen py-10 overflow-y-auto">
      <div className="flex flex-col text-center main-login max-w-md">
        <div className="page-container flex justify-center items-center flex-col shadow-2xl rounded-b-2xl mb-5">
          <div className="card flex flex-col justify-around gap-8 px-6">
            <div className="flex flex-col gap-1">
              <p className="text-[13px] uppercase tracking-wide text-primary font-semibold pt-5">Staff Onboarding Platform</p>
              <p className="text-[36px] font-bold creating">
                Join Your <span className="text-primary">Team</span>
              </p>
              <div className="text-[#64748B]">Set your name and password to activate your account.</div>
            </div>

            <div>
              <form id="accept-invite-form" onSubmit={handleSubmit} className="flex flex-col create-form">
                <ErrorBanner message={!token ? "This invite link is missing its token — please use the link from your email." : error} />

                <Input
                  label="Full name"
                  type="text"
                  id="invite-name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched(true)}
                  error={touched ? fullNameErr : ""}
                  disabled={!token}
                  required
                />

                <PasswordInput
                  label="Password"
                  id="invite-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                  required
                />

                <PasswordRulesChecklist password={password} />

                <PasswordInput
                  label="Confirm password"
                  id="invite-password-confirm"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token}
                  error={confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match" : ""}
                  required
                />
              </form>

              <Button form="accept-invite-form" type="submit" className="mb-4" disabled={!canSubmit || submitting}>
                {submitting ? "Activating account..." : "Activate account"}
              </Button>

              <div className="flex justify-center items-center gap-1 text-[13px] p-2">
                <span className="text-[#64748B]">Already activated your account?</span>
                <Link to="/" className="text-primary hover:brightness-150 transition">Sign In</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[#64748B] c2026">© 2026 Staff Onboarding Platform. All rights reserved.</div>
      </div>
    </div>
  );
};

export default AcceptInvite;
