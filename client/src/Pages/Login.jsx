
 const Login = () => {
  return (
    <div className="full-login flex justify-center items-center bg-background h-screen">
        <div className="flex flex-col text-center main-login max-w-md">
            <div className="page-container bg-background flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5">
                <div className="card flex flex-col justify-around gap-8 px-6">
                            <div className="flex flex-col">
                                <p className="text-[36px] pt-5 font-bold welcome">Welcome Back</p>
                                <div className="h-6 text-[#64748B]">Sign in to your account to continue</div>
                            </div>

                            <div>
                                <div>
                                <form action="/submit_form" method="post" className="flex flex-col login-form">
                                <label htmlFor="email-add" className="text-left pb-1">Email Address</label>
                                <input type="email" id="email-add" placeholder="Enter your email address" className="border border-solid border-[#E5E7EB] h-12 w-100 rounded-[5px] mb-4 pl-2.5 bg-white"/>
                                <label htmlFor="pass" className="text-left pb-1">Password</label>
                                <input type="password" id="pass" placeholder="Enter password" className="border border-solid border-[#E5E7EB] h-12 w-100 rounded-[5px] mb-4 pl-2.5 bg-white"/>
                                </form>
                                <button type="submit" className="bg-primary w-100 h-12 rounded-lg text-[white]">Sign In</button>
                                <div className="flex justify-center items-center gap-50 text-[13px] p-2">
                                    <div><a href="" className="text-primary">Create Account</a></div>
                                    <div><a href="" className="text-primary">Forgot Password</a></div>
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
