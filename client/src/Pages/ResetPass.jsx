import {useState} from 'react'

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
    const [showNewPassword,setShowNewPassword] = useState(false);
    const [showResetPassword,setShowResetPassword] = useState(false);

    const rules = [ //testing till 17
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One number", test: (v) => /[0-9]/.test(v) },
                    ];

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const allRulesPass = rules.every((r) => r.test(password));
    const canSubmit = allRulesPass && passwordsMatch;

    const inputClass =
    "border border-solid border-[#E5E7EB] h-12 w-100 rounded-[5px] mb-4 pl-2.5 pr-10 bg-white";

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

                                    <label htmlFor="newPass" className="text-left pb-1"><span className="text-primary">Pass</span>word</label>
                                    <div className="relative">
                                        <input type={showNewPassword ? "text" : "password"} id="newPass" placeholder="Enter New password" value={password} /* testing on change*/onChange={(e) => setPassword(e.target.value)} className={`${inputClass} [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}/>
                                        <button type="button" onClick={() => setShowNewPassword((prev) => !prev)} className="absolute right-3 top-1/3 -translate-y-1/2 text-[#64748B] hover:text-primary transition-colors" tabIndex={-1} aria-label={showNewPassword ? "Hide password" : "Show password"}>
                                            {showNewPassword ?
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.16699 4.26667C8.76589 4.13037 9.3805 4.06319 9.99999 4.06667C15.8333 4.06667 18.3333 10 18.3333 10C17.8837 10.9269 17.328 11.7981 16.6767 12.5967M11.7667 11.7667C11.4576 12.0973 11.0849 12.362 10.6712 12.5449C10.2575 12.7278 9.81135 12.8253 9.35921 12.8317C8.90707 12.838 8.4584 12.7529 8.03974 12.5817C7.62108 12.4104 7.24102 12.1564 6.9227 11.8348C6.60438 11.5132 6.35407 11.1305 6.18657 10.7098C6.01908 10.289 5.93775 9.83889 5.94748 9.38681C5.95721 8.93473 6.05779 8.48939 6.24339 8.07577C6.42898 7.66215 6.69581 7.29001 7.02766 6.98333M1.66699 1.66667L18.3337 18.3333M2.66699 6.4C1.90032 7.28667 1.35032 8.13333 1.06699 10C1.06699 10 3.56699 15.9333 9.40032 15.9333C10.1953 15.9315 10.9845 15.8025 11.7337 15.5333" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                :
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1.66699 10C1.66699 10 4.16699 4.16667 10.0003 4.16667C15.8337 4.16667 18.3337 10 18.3337 10C18.3337 10 15.8337 15.8333 10.0003 15.8333C4.16699 15.8333 1.66699 10 1.66699 10Z" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M10.0003 12.5C11.3811 12.5 12.5003 11.3807 12.5003 10C12.5003 8.61929 11.3811 7.5 10.0003 7.5C8.61961 7.5 7.50033 8.61929 7.50033 10C7.50033 11.3807 8.61961 12.5 10.0003 12.5Z" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            }
                                        </button>
                                    </div>
                                    
                                    <label htmlFor="newPass-confirm" className="text-left pb-1">Confirm <span className="text-primary">New</span> Password</label>
                                <div className="relative">                                    
                                        <input type={showResetPassword ? "text" : "password"} id="newPass-confirm" placeholder="Re-enter New password" value={confirmPassword} /*testing onchange as well*/ onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClass} [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}/>
                                        <button type="button" onClick={() => setShowResetPassword((prev) => !prev)} className="absolute right-3 top-1/3 -translate-y-1/2 text-[#64748B] hover:text-primary transition-colors" tabIndex={-1} aria-label={showResetPassword ? "Hide password" : "Show password"}>
                                            {showResetPassword ?
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.16699 4.26667C8.76589 4.13037 9.3805 4.06319 9.99999 4.06667C15.8333 4.06667 18.3333 10 18.3333 10C17.8837 10.9269 17.328 11.7981 16.6767 12.5967M11.7667 11.7667C11.4576 12.0973 11.0849 12.362 10.6712 12.5449C10.2575 12.7278 9.81135 12.8253 9.35921 12.8317C8.90707 12.838 8.4584 12.7529 8.03974 12.5817C7.62108 12.4104 7.24102 12.1564 6.9227 11.8348C6.60438 11.5132 6.35407 11.1305 6.18657 10.7098C6.01908 10.289 5.93775 9.83889 5.94748 9.38681C5.95721 8.93473 6.05779 8.48939 6.24339 8.07577C6.42898 7.66215 6.69581 7.29001 7.02766 6.98333M1.66699 1.66667L18.3337 18.3333M2.66699 6.4C1.90032 7.28667 1.35032 8.13333 1.06699 10C1.06699 10 3.56699 15.9333 9.40032 15.9333C10.1953 15.9315 10.9845 15.8025 11.7337 15.5333" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                :
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1.66699 10C1.66699 10 4.16699 4.16667 10.0003 4.16667C15.8337 4.16667 18.3337 10 18.3337 10C18.3337 10 15.8337 15.8333 10.0003 15.8333C4.16699 15.8333 1.66699 10 1.66699 10Z" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M10.0003 12.5C11.3811 12.5 12.5003 11.3807 12.5003 10C12.5003 8.61929 11.3811 7.5 10.0003 7.5C8.61961 7.5 7.50033 8.61929 7.50033 10C7.50033 11.3807 8.61961 12.5 10.0003 12.5Z" stroke="currentColor" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            }
                                        </button>
                                </div>
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
                                    <button form="resetpassword-form" type="submit" disabled={!canSubmit} className="bg-primary w-100 h-12 rounded-lg text-[white] border border-primary mb-4 hover:bg-background hover:border-primary hover:text-primary">Reset</button>

                                    <div className="flex justify-center text-[13px] p-1">
                                        <div>
                                            <a href="/login" className="text-primary hover:brightness-150 transition">
                                                Back to Sign In
                                            </a>
                                        </div>
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
                <div className="text-[#64748B] c2026">© 2026 Contract Management Platform. All rights reserved.</div>
            </div>
        </div>
    )
}

export default ResetPass;
