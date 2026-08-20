
 const Login = () => {
  return (
    <div className=" full-login flex justify-center align-center">
        <div className="flex justify-center items-center flex-col text-center main-login bg-amber-300 shadow">
            <div className="page-container bg-[#F9FAFB]">
                <div className="card flex flex-col justify-around gap-8 h-80">
                            <div className="flex flex-col">
                                <p className="text-[36px] h-11.75">Welcome Back</p>
                                <div className="h-6">Sign in to your account to continue</div>
                            </div>

                            <div>
                                <form action="/submit_form" method="post" className="flex flex-col login-form">
                                <label htmlFor="email-add" className="text-left">Email Address</label>
                                <input type="email" id="email-add" placeholder="Enter your email address" />
                                <label htmlFor="pass" className="text-left">Password</label>
                                <input type="password" id="pass" placeholder="Enter password"/>
                                </form>
                                <button type="submit" className="bg-primary w-100 h-12 rounded-lg">Sign In</button>
                            </div> 

                            <div>
                                    <div className="h-6 border-t border-[#E2E8F0]"></div>
                                    <div className="flex justify-center items-center gap-1">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.99967 18.3333C9.99967 18.3333 16.6663 15 16.6663 10V4.16667L9.99967 1.66667L3.33301 4.16667V10C3.33301 15 9.99967 18.3333 9.99967 18.3333Z" stroke="#64748B" stroke-width="0.833333" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <p>Enterprise-grade security and authentication</p>
                                    </div>
                            </div>
                </div>
            </div>
            <div className="text-[#64748B]">© 2026 Contract Management Platform. All rights reserved.</div>
        </div>
    </div>
  )
}

export default Login;
