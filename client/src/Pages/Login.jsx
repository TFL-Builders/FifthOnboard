
 const Login = () => {
  return (
    <div className="full-login flex justify-center items-center bg-[#F9FAFB]">
        <div className="flex flex-col text-center main-login">
            <div className="page-container bg-[#F9FAFB] flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5">
                <div className="card flex flex-col justify-around gap-8">
                            <div className="flex flex-col">
                                <p className="text-[36px]  font-bold welcome">Welcome Back</p>
                                <div className="h-6 text-[#64748B]">Sign in to your account to continue</div>
                            </div>

                            <div>
                                <div>
                                <form action="/submit_form" method="post" className="flex flex-col login-form">
                                <label htmlFor="email-add" className="text-left">Email Address</label>
                                <input type="email" id="email-add" placeholder="Enter your email address" className="border border-solid border-[#E5E7EB]"/>
                                <label htmlFor="pass" className="text-left">Password</label>
                                <input type="password" id="pass" placeholder="Enter password" className="border border-solid border-[#E5E7EB]"/>
                                </form>
                                <button type="submit" className="bg-[#06B6D4] w-100 h-12 rounded-lg">Sign In</button>
                                <div className="flex justify-center items-center gap-50 text-[13px] p-2">
                                    <div><a href="" className="text-[#06B6D4]">Create Account</a></div>
                                    <div><a href="" className="text-[#06B6D4]">Forgot Password</a></div>
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

export default Login;
