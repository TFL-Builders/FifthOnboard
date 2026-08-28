// import { Link } from "react-router-dom"
import { useState } from "react";
import { Input } from "./Input";

export const InviteTeammate = (onClose) => {
    const [roleOpen, setroleOpen] = useState(false);
    const [role, setRole] = useState('');
    const RoleOptions = [
        { value: 'intern', label: 'Intern' },
        { value: 'first-class', label: 'First-class' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'manager', label: 'Manager' },
    ];

    const [departmentOpen, setDepartmentOpen] = useState(false);
    const [department, setDepartment] = useState('');
    const DepartmentOptions = [
        { value: 'hr', label: 'Human Resources' },
        { value: 'fifth-lab', label: 'Fifth-lab' },
        { value: 'data', label: 'Data-centers' },
        { value: 'engineer', label: 'Engineer' },
        { value: 'security', label: 'Security' }
    ];
    
    
  return (
    <div className="Invite flex justify-center items-center bg-transparent h-screen fixed top-0 left-0 z-50" onClick={onClose}>
        <div className="main-Invite flex flex-col text-center max-w-md relative" onClick={(e) => e.stopPropagation()}>{/*work on this using dogmodal on line 152 in HundSucher when it's to be called in people */}
            <div className="page-container bg-background flex justify-center items-center flex-col  shadow-2xl rounded-2xl mb-5 border border-primary">
                <div className="card flex flex-col gap-8 px-6">
                    <div className="flex flex-col">
                                <p className="text-[36px] pt-5 font-bold welcome">Invite member</p>
                                <div className="h-6 text-[#64748B]">Send an Invite link to their work email</div>
                    </div>
                    <hr className="text-primary"/>
                    <form action="" id="Invite-Form" className="flex flex-col px-6 mb-4">
                        <Input label="Work Email" id="work-email" type="email" placeholder="name@company.com" className="appearance-none"/>
                        <div className="roles text-left">Role</div>
                        <div className="relative w-full pb-4 ">
                            <button
                                type="button"
                                onClick={() => setroleOpen(!roleOpen)}
                                className="w-full h-12 text-left  p-2 rounded-lg border border-[#E5E7EB] focus:border-2 focus:border-primary bg-white"
                            >
                                <span className={role ? 'text-black' : 'text-[#808080]'}>
                                    {role ? RoleOptions.find((o) => o.value === role)?.label : 'Select a role'}
                                </span>
                                <svg
                                className={`absolute right-3 top-1/3 -translate-y-1/2 w-4 h-4 text-[#64748B] transition-transform ${roleOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>                            
                            </button>
                            {roleOpen && (
                                <div className="absolute w-full mt-1 bg-white border border-[#64748B] rounded-lg shadow-md z-10 divide-y divide-[#E5E7EB]">
                                {RoleOptions.map((option) => (
                                    <div
                                    key={option.value}
                                    onClick={() => {
                                        setRole(option.value);
                                        setroleOpen(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                    {option.label}
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>
                        <div className="departments text-left">Department</div>
                        <div className="relative w-full">
                            <button
                                type="button"
                                onClick={() => setDepartmentOpen(!departmentOpen)}
                                className="w-full h-12 text-left  p-2 rounded-lg border border-[#E5E7EB] bg-white focus:border-2 focus:border-primary"
                            >
                                <span className={department ? 'text-black' : 'text-[#808080]'}>
                                    {department ? DepartmentOptions.find((o) => o.value === department)?.label : 'Select a department'}
                                </span>
                                <svg
                                className={`absolute right-3 top-1/4 -translate-y-1/2 w-4 h-4 text-[#64748B] transition-transform ${departmentOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {departmentOpen && (
                                <div className="absolute w-full mt-1 bg-white border border-[#64748B] rounded-lg shadow-md z-10 divide-y divide-[#E5E7EB]">
                                {DepartmentOptions.map((option) => (
                                    <div
                                    key={option.value}
                                    onClick={() => {
                                        setDepartment(option.value);
                                        setDepartmentOpen(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                                    >
                                    {option.label}
                                    </div>
                                ))}
                                </div>
                            )}
                            <div className="text-left text-[#64748B] text-[12px] p-1 pb-4">
                                This is used to assign tasks to the person
                            </div>
                        </div>
                        <button form="Invite-Form" type="submit" className="bg-primary w-100 h-12 rounded-lg text-[white] border border-primary hover:bg-background hover:border-primary hover:text-primary">Submit</button>
                    </form>
                    
                    <div>
                    <hr className="text-primary"/>
                    <div className="final flex flex-row justify-end gap-4 m-4 mb-4">
                        <button type="button" className="cancel border p-2 rounded-md text-red-400 hover:bg-red-800 hover:text-white">
                            Cancel
                        </button>
                        <button 
                        className="border 
                        p-2 rounded-md text-white bg-primary focus:bg-white focus:text-primary"
                        // onClick= connect this to email delivery service
                        >
                            Send Invite
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
