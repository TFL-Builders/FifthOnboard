import { Link } from "react-router-dom";
import { Input } from "../../Components/Input";
import { Button } from "../../Components/Button";

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
                            <Input type="email" id="email" placeholder="Enter your email"/>
                            <Button form="emailForgot" type="submit">Submit</Button>
                        </form>
                    </div>
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
