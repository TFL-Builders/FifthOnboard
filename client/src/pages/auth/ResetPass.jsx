import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordInput } from '../../Components/PasswordInput';
import { Button } from '../../Components/Button';
import { ErrorBanner } from '../../Components/ErrorBanner';
import { PasswordRulesChecklist } from '../../Components/PasswordRulesChecklist';
import { isPasswordValid } from '../../lib/passwordRules';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { api } from '../../lib/apiClient';

const ResetPass = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(token ? "" : "This reset link is missing its token — please use the link from your email.");
    const [submitting, setSubmitting] = useState(false);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const canSubmit = Boolean(token) && isPasswordValid(password) && passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError("");
        setSubmitting(true);
        try {
            await api.post(`/auth/reset-password?token=${encodeURIComponent(token)}`, { password });
            navigate('/', { state: { resetSuccess: true } });
        } catch (err) {
            setError(getErrorMessage(err).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="full-create flex justify-center items-center bg-background h-screen">
            <div className="flex flex-col text-center main-login max-w-md">
                <div className="page-container flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5">
                    <div className="card flex flex-col justify-around gap-8 px-6">
                                <div className="flex flex-col">
                                    <p className="text-[36px] pt-5 font-bold creating">Set New <span className="text-primary">Pass</span>word</p>
                                    <div className="h-6 text-[#64748B]">Fill in your old password and the new one</div>
                                </div>


                                <div>
                                    <form id="resetpassword-form" onSubmit={handleSubmit} className="flex flex-col create-form">

                                    <ErrorBanner message={error} />

                                    <PasswordInput label={<><span className="text-primary">Pass</span>word</>} id="newPass" placeholder="Enter New password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" disabled={!token}/>

                                    <PasswordRulesChecklist password={password} />

                                    <PasswordInput
                                      label={<>Confirm <span className="text-primary">New</span> Password</>}
                                      id="newPass-confirm"
                                      placeholder="Re-enter New password"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      className="pr-10"
                                      disabled={!token}
                                      error={confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match" : ""}
                                    />

                                    </form>
                                    <Button form="resetpassword-form" type="submit" disabled={!canSubmit || submitting} className="mb-4">
                                      {submitting ? "Resetting..." : "Reset"}
                                    </Button>

                                    <div className="flex justify-center text-[13px] p-1">
                                            <Link to="/" className="text-primary hover:brightness-150 transition">Back to Sign In</Link>
                                    </div>

                                    <div>
                                            <div className="border-t border-[#E2E8F0]"></div>
                                            <div className="flex justify-center items-center gap-1 p-6">
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.99967 18.3333C9.99967 18.3333 16.6663 15 16.6663 10V4.16667L9.99967 1.66667L3.33301 4.16667V10C3.33301 15 9.99967 18.3333 9.99967 18.3333Z" stroke="#64748B" stroke-width="0.833333" stroke-linecap="round" stroke-linejoin="round"/>
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

export default ResetPass;
