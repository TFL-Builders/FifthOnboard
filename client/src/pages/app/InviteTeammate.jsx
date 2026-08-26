// import { Link } from "react-router-dom"

export const InviteTeammate = () => {
  return (
    <div className="Invite flex justify-center items-center bg-transparent h-screen">
        <div className="main-Invite flex flex-col text-center max-w-md">
            <div className="page-container bg-background flex justify-center items-center flex-col  shadow-2xl rounded-b-2xl mb-5 border border-primary">
                <div className="card flex flex-col gap-8 px-6">
                    <div className="flex flex-col">
                                <p className="text-[36px] pt-5 font-bold welcome">Invite member</p>
                                <div className="h-6 text-[#64748B]">Send an Invite link to their work email</div>
                    </div>
                    <hr/>
                    <form action="" id="Invite-Form" className="flex flex-col px-6 mb-4">
                                <label htmlFor="work-email">Work Email</label>
                                <input type="email" placeholder="name@company.com" className="border border-solid border-[#E5E7EB] h-12 w-100 rounded-[5px] mb-4 pl-2.5 bg-white"/>
                                <button form="Invite-Form" type="submit" className="bg-primary w-100 h-12 rounded-lg text-[white] border border-primary hover:bg-background hover:border-primary hover:text-primary">Submit</button>
                    </form>
                    <div>
                    <hr />
                    <div className="final flex flex-row justify-end gap-4 m-4 mb-4">
                        <div className="cancel border p-2 rounded-md">
                            Cancel
                        </div>
                        <button className="border p-2 rounded-md">
                            Send Invite
                        </button>
                    </div>
                    </div>
                </div>
            </div>
            <div className="text-[#64748B] c2026">© 2026 Contract Management Platform. All rights reserved.</div>
        </div>
    </div>
  )
}
