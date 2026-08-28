import {useState} from 'react'
import { Link } from 'react-router-dom';
import { PasswordInput } from '../../Components/PasswordInput';
import { Button } from '../../Components/Button';

const CheckCircleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M4.5 7.2L6.2 8.9L9.5 5.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    );

    const EmptyCircleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
    );

const ResetPass = () => {
    const [password, setPassword] = useState(""); // testing till 5
    const [confirmPassword, setConfirmPassword] = useState("");

    const rules = [ //testing till 17
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One number", test: (v) => /[0-9]/.test(v) },
                    ];

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const allRulesPass = rules.every((r) => r.test(password));
    const canSubmit = allRulesPass && passwordsMatch;

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
                                    <form id="resetpassword-form" action="/reset_password" method="post" className="flex flex-col create-form">

                                    <PasswordInput label={<><span className="text-primary">Pass</span>word</>} id="newPass" placeholder="Enter New password" value={password} /* testing on change*/onChange={(e) => setPassword(e.target.value)} className="pr-10"/>

                                    <PasswordInput label={<>Confirm <span className="text-primary">New</span> Password</>} id="newPass-confirm" placeholder="Re-enter New password" value={confirmPassword} /*testing onchange as well*/ onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10"/>
                                <div className="flex flex-col gap-1 items-start mb-4 -mt-1 pl-4">
                                        {rules.map((rule) => {
                                            const passed = rule.test(password);
                                            return (
                                            <div
                                                key={rule.label}
                                                className={`flex items-start gap-1.5 text-[12px] transition-colors ${
                                                passed ? "text-emerald-600" : "text-[#94A3B8]"
                                                }`}
                                            >
                                                {passed ? <CheckCircleIcon /> : <EmptyCircleIcon />}
                                                {rule.label}
                                            </div>
                                            );
                                        })}
                                        {confirmPassword.length > 0 && !passwordsMatch && (
                                            <div className="flex items-center gap-1.5 text-[12px] text-red-500">
                                            <EmptyCircleIcon />
                                            Passwords do not match
                                            </div>
                                        )}
                                </div>

                                    </form>
                                    <Button form="resetpassword-form" type="submit" disabled={!canSubmit} className="mb-4">Reset</Button>

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
