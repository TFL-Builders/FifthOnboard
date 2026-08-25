// import React from 'react'
import { useState } from 'react'
import Jaytester from '../assets/Jaytester.jpg'

export const Sidebar = () => {
    const [activePage,setActivePage] = useState('');
    const pages = ['Dashboard','Onboarding','Templates','People','Settings']
  return (
    <div className="FullBar w-[15vw] h-screen flex flex-col justify-between items-center border-2 border-primary">
        <div className="Sidebar flex flex-col justify-between h-screen w-full">
            <div className="top w-full">
                <div className="Logo text-2xl text-primary ml-1 p-2">
                    FifthOnboard
                </div>
                <hr className='border border-primary w-full'/>
                 <div className="pages m-2">
                    {pages.map((page)=>(
                        <div
                        key={page}
                        onClick={() => setActivePage(page)}
                        className={`p-1.5 rounded-l cursor-pointer transition-colors ${activePage === page ? ' text-[#64748B] border border-l-2 border-primary hover:text-black' : 'text-[#64748B] border border-transparent hover:text-black'}`}
                        >
                            {page}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bottom flex flex-col gap-4 w-full items-start">
                <hr className='border border-primary w-full'/>
                <div className="UserInfo flex flex-row gap-4 ml-4">
                    <div className="profilePic border-2 border-primary rounded-full overflow-hidden h-20 w-20">
                        <img src={Jaytester} alt="Sampler Temple" className="w-full h-full object-cover" />
                    </div>
                    <div className="Person flex flex-col justify-center">
                        <div className="Name text-[10px]">Sampler Temple</div>
                        <div className="Role">Hr</div>
                    </div>
                </div>
                <div className="logOrCollapse flex flex-col gap-1 items-center ml-4">
                    <div className="Logout flex flex-row gap-2">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" strokeWidth="2" 
                                strokeLinecap="round" strokeLinejoin="round" className='text-red-900'>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </div>
                        <div className='text-red-900'>Log Out</div>
                    </div>
                    <div className="Collapse flex justify-center items-center gap-2 text-[#64748B]">
                       <div className='text-2xl'>{'<'}</div><div>Collapse</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
