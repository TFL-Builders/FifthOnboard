

import { Link } from "react-router-dom";

 const ForgotPass = () => {
  return (
    <div className="full-login flex justify-center items-center bg-background h-screen">
        <div className="main-login flex flex-col text-center max-w-md">
            <div className="page-container bg-background flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5">
                <div className="card flex flex-col justify-around gap-4 px-6">
                    <div className="flex flex-col">
                                <p className="text-[36px] pt-5 font-bold welcome">Eyy.. you forgot</p>
                                <div className="h-6 text-[#64748B]">Kindly write down your email and get your code</div>
                    </div>
                    <div>
                        <form action="" id="emailForgot" className="flex flex-col">
                            <label htmlFor="email"></label>
                            <input type="email" placeholder="Enter your email" className="border border-solid border-[#E5E7EB] h-12 w-100 rounded-[5px] mb-4 pl-2.5 bg-white"/>
                            <button form="emailForgot" type="submit" className="bg-primary w-100 h-12 rounded-lg text-[white] border border-primary hover:bg-background hover:border-primary hover:text-primary">Submit</button>
                        </form>
                    </div>
                    <div className="flex justify-center items-center gap-1 text-[13px] pb-4">
                        <span className="text-[#64748B]">Remembered your password?</span>
                        <Link to="/" className="text-primary hover:brightness-150 transition">Sign In</Link>
                    </div>
                </div>
            </div>
            <div className="text-[#64748B] c2026">© 2026 Contract Management Platform. All rights reserved.</div>
        </div>
    </div>
  )
}

export default ForgotPass
