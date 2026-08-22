import { useState } from "react";

 const Login = () => {
const [showPassword, setShowPassword] = useState(false);

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
                                <form id="login-form" action="/submit_form" method="post" className="flex flex-col login-form">

                                <label htmlFor="email-add" className="text-left pb-1">Email Address</label>
                                <input type="email" id="email-add" placeholder="Enter your email address" className="border border-solid border-[#E5E7EB] h-12 w-100 rounded-[5px] mb-4 pl-2.5 bg-white"/>

                                <label htmlFor="pass" className="text-left pb-1">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} id="pass" placeholder="Enter password" className="border border-solid border-[#E5E7EB] h-12 w-100 rounded-[5px] mb-4 pl-2.5 bg-white"/>
                                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/3 -translate-y-1/2 text-[#64748B] hover:text-primary transition-colors" tabIndex={-1}>
                                        {showPassword ?
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
                                </form>
                                <button form="login-form" type="submit" className="bg-primary w-100 h-12 rounded-lg text-[white] border border-primary hover:bg-background hover:border-primary hover:text-primary transition-colors duration-300">Sign In</button>
                                <div className="flex justify-center items-center gap-50 text-[13px] p-2">
                                    <div><a href="" className="text-primary hover:brightness-150 transition">Create Account</a></div>
                                    <div><a href="" className="text-primary hover:brightness-150 transition">Forgot Password</a></div>
                        
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

export default Login;
