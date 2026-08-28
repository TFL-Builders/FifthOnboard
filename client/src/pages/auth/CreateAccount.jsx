import { Link } from "react-router-dom";
import { Input } from "../../Components/Input";
import { PasswordInput } from "../../Components/PasswordInput";
import { Button } from "../../Components/Button";

const CreateAcc = () => {
  return (
    <div className="full-create flex justify-center items-center bg-background min-h-screen py-10 overflow-y-auto">
        <div className="flex flex-col text-center main-login max-w-md">
            <div className="page-container flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5">
                <div className="card flex flex-col justify-around gap-8 px-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-[13px] uppercase tracking-wide text-primary font-semibold pt-5">Staff Onboarding Platform</p>
                                <p className="text-[36px] font-bold creating">Cr<span className="text-primary">ea</span>te <span className="text-primary">A</span>ccount</p>
                                <div className="text-[#64748B]">Set up your organization's onboarding workspace in minutes.</div>
                            </div>


                            <div>
                                <form id="create-form" action="/submit_form" method="post" className="flex flex-col create-form">

                                <Input label={<><span className="text-primary">User</span>name</>} type="text" id="user-create" placeholder="Enter your name"/>

                                <Input label="Organization name" type="text" id="user-org" placeholder="Enter your Organization"/>

                                <Input label={<>Email Ad<span className="text-primary">dress</span></>} type="email" id="email-create" placeholder="Enter your email address"/>

                                <PasswordInput label={<><span className="text-primary">Pass</span>word</>} id="pass-create" placeholder="Enter password"/>

                                <PasswordInput label={<>Confirm <span className="text-primary">Pass</span>word</>} id="pass-confirm" placeholder="Re-enter password"/>

                                </form>
                                <Button form="create-form" type="submit" className="mb-4">Create</Button>

                                <div className="flex justify-center items-center gap-1 text-[13px] p-2">
                                    <span className="text-[#64748B]">Already have an account?</span>
                                    <Link to="/" className="text-primary hover:brightness-150 transition">Sign In</Link>
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

export default CreateAcc;
