import { useState } from "react";
import { PageHeading } from "../../Components/PageHeading";
import { IconBadge } from "../../Components/IconBadge";

export const Profile = () => {
    const [selected, setSelected] = useState("on");
    const [soundOpen, setSoundOpen] = useState(false)
    const [sound, setSound] = useState('')
    const sounds  = [{ value: 'bell', label: 'Bell' },
        { value: 'scream', label: 'Scream' },
        { value: 'shriek', label: 'Shriek' },
        { value: 'pan', label: 'Pan' },
        { value: 'drumroll', label: 'Drum' }
    ]

  return (
    <div className="p-8 bg-background"> Functionality. See So that we continue using it. That's, that's why I'm interested in it. And you? yeah, but like I would want to And that's here, you know, we find the UI Also ensure that the Back end can handle, because most data analysts, They work with like a, a ton of data, so you're Looking at thousands of Data and rules of data and all of that, so make sure that it's a solid thing. But yeah, good, good projection anyway. Thank you, Rob. All right.
        <div className="size w-162.5">
            <PageHeading title="Profile Settings" subtitle="Manage your account information and profile picture" />

            <div className="profilePic border border-[#64748B] rounded-xl mb-6">
                <div className="top border-b border-[#64748B] p-4">
                    <div className="topword text-[16px]">Profile Picture</div>
                    <div className="bottomword text-[14px] text-[#64748B]">Upload or update your profile picture</div>
                </div>
                <div className="actualPic">
                    <div className="containpic flex p-4 items-center">
                        <IconBadge className="rounded-full p-4">
                            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30.0837 33.25V30.0833C30.0837 28.4036 29.4164 26.7927 28.2287 25.605C27.0409 24.4173 25.43 23.75 23.7503 23.75H14.2503C12.5706 23.75 10.9597 24.4173 9.77198 25.605C8.58425 26.7927 7.91699 28.4036 7.91699 30.0833V33.25" stroke="#0891B2" strokeWidth="1.58333" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19.0003 17.4167C22.4981 17.4167 25.3337 14.5811 25.3337 11.0833C25.3337 7.58553 22.4981 4.75 19.0003 4.75C15.5025 4.75 12.667 7.58553 12.667 11.0833C12.667 14.5811 15.5025 17.4167 19.0003 17.4167Z" stroke="#0891B2" strokeWidth="1.58333" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </IconBadge>
                        <div className="svgabout ml-4">
                            <button className="upload text-[15px] bg-primary p-2 text-[#FFFFFF] rounded-md mb-1"> <span className="pr-2">+</span> <span>Upload Photo</span></button> 
                            {/* work on the button and allow it to receive photos using JS */}
                            <div className="specifications text-[12px] text-[#64748B]">JPG, PNG or WEBP. Max size 5MB. Recommended: 400x400px</div>
                        </div>
                    </div>  
                </div>
            </div>

            <div className="profileNotifications border border-[#64748B] rounded-xl mb-6">
                <div className="top border-b border-[#64748B] p-4 flex justify-between">
                    <div className="notifications flex ">
                        <IconBadge className="p-2 mr-2 w-8.5 h-8.5 rounded-xl">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 6C4.5 4.80653 4.97411 3.66193 5.81802 2.81802C6.66193 1.97411 7.80653 1.5 9 1.5C10.1935 1.5 11.3381 1.97411 12.182 2.81802C13.0259 3.66193 13.5 4.80653 13.5 6C13.5 11.25 15.75 12.75 15.75 12.75H2.25C2.25 12.75 4.5 11.25 4.5 6Z" stroke="#0891B2" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M7.72461 15.75C7.85015 15.9783 8.0347 16.1688 8.25898 16.3014C8.48326 16.434 8.73904 16.504 8.99961 16.504C9.26017 16.504 9.51596 16.434 9.74024 16.3014C9.96452 16.1688 10.1491 15.9783 10.2746 15.75" stroke="#0891B2" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </IconBadge>
                        
                        <div className="word">
                            <div className="topword text-[16px]">Notification Settings</div>
                            <div className="bottomword text-[14px] text-[#64748B]">Manage your notification preferences</div> 
                        </div>
                    </div>
                    <div className="review text-[14px] text-[#64748B] flex items-center">
                        <div className="pr-4">Review</div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.33301 8H12.6663" stroke="#64748B" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 3.33398L12.6667 8.00065L8 12.6673" stroke="#64748B" strokeWidth="0.666667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div className="Notification-Settings">
                    <div className="NotificationToggle p-4 flex justify-between">
                        <div className="BellSvg ml-4 flex items-center">
                            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.542 4.79102L5.75033 8.62435H1.91699V14.3743H5.75033L10.542 18.2077V4.79102Z" stroke="#0891B2" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14.8926 8.10742C15.7909 9.00599 16.2955 10.2246 16.2955 11.4951C16.2955 12.7657 15.7909 13.9843 14.8926 14.8828" stroke="#0891B2" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18.2754 4.72461C20.072 6.52175 21.0813 8.95887 21.0813 11.5C21.0813 14.0412 20.072 16.4783 18.2754 18.2754" stroke="#0891B2" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div className="sound ml-2">
                                <div className="">Notification Sound</div>
                                <div className="specifications text-[12px] text-[#64748B]">Play sound while when receiving notifications</div>
                            </div>                          
                        </div>
                        <div className="OnOrOff bg-primary w-12.5 h-7 flex justify-center items-center rounded-2xl">
                            <div
                                onClick={() => setSelected('off')}
                                className={`rounded-full p-1.5 cursor-pointer transition-colors ${
                                    selected === 'off' ? 'bg-white' : 'bg-primary'
                                }`}
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M7.5 2.5L2.5 7.5"
                                        stroke={selected === 'off' ? '#06B6D4' : 'white'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M2.5 2.5L7.5 7.5"
                                        stroke={selected === 'off' ? '#06B6D4' : 'white'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div
                                onClick={() => setSelected('on')}
                                className={`rounded-full p-1.5 cursor-pointer transition-colors ${
                                    selected === 'on' ? 'bg-white' : 'bg-primary'
                                }`}
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8.33366 2.5L3.75033 7.08333L1.66699 5"
                                        stroke={selected === 'on' ? '#06B6D4' : 'white'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div> 
                    <div className="SoundType pt-0 p-4">
                        <div className="soundWords pb-1.5">Sound Type</div>
                        <div className="dropdown flex gap-4">
                            <div className="actual-dropdown">
                                <div className="relative w-full pb-4 ">
                            <button
                                type="button"
                                onClick={() => setSoundOpen(!soundOpen)}
                                className="w-136 h-12 text-left  p-2 rounded-lg border border-[#E5E7EB] focus:border-2 focus:border-primary bg-white"
                            >
                                <span className={sound ? 'text-black' : 'text-[#808080]'}>
                                    {sound ? sounds.find((o) => o.value === sound)?.label : 'Select a sound'}
                                </span>
                                <svg
                                className={`absolute right-3 top-1/3 -translate-y-1/2 w-4 h-4 text-[#64748B] transition-transform ${soundOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>                            
                            </button>
                            {soundOpen && (
                                <div className="absolute w-full mt-1 bg-white border border-[#64748B] rounded-lg shadow-md z-10 divide-y divide-[#E5E7EB]">
                                {sounds.map((option) => (
                                    <div
                                    key={option.value}
                                    onClick={() => {
                                        setSound(option.value);
                                        setSoundOpen(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                    {option.label}
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>
                            </div>
                            <div className="play border border-[#64748B] bg-[#FFFFFF] hover:bg-primary rounded-sm h-12 w-12 flex justify-center items-center">
                                <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.542 4.79102L5.75033 8.62435H1.91699V14.3743H5.75033L10.542 18.2077V4.79102Z" stroke="#64748B" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14.8926 8.10742C15.7909 9.00599 16.2955 10.2246 16.2955 11.4951C16.2955 12.7657 15.7909 13.9843 14.8926 14.8828" stroke="#64748B" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                                    {/* stroke =#0891B2 */}
                                    <path d="M18.2754 4.72461C20.072 6.52175 21.0813 8.95887 21.0813 11.5C21.0813 14.0412 20.072 16.4783 18.2754 18.2754" stroke="#64748B" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <div className="extraInfo text-[14px] font-medium text-[#64748B] pt-2">Choose your preferred notification sound. Click the speaker icon to test.</div>
                    </div>
                </div>
            </div>
            <div className="Account-info border border-[#64748B] rounded-xl">
                <div className="introAccount p-4 flex gap-2 items-center border-b border-[#64748B]">
                    <IconBadge className="rounded-md p-2 w-8.5 h-8.5">
                        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M30.0837 33.25V30.0833C30.0837 28.4036 29.4164 26.7927 28.2287 25.605C27.0409 24.4173 25.43 23.75 23.7503 23.75H14.2503C12.5706 23.75 10.9597 24.4173 9.77198 25.605C8.58425 26.7927 7.91699 28.4036 7.91699 30.0833V33.25" stroke="#0891B2" strokeWidth="1.58333" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19.0003 17.4167C22.4981 17.4167 25.3337 14.5811 25.3337 11.0833C25.3337 7.58553 22.4981 4.75 19.0003 4.75C15.5025 4.75 12.667 7.58553 12.667 11.0833C12.667 14.5811 15.5025 17.4167 19.0003 17.4167Z" stroke="#0891B2" strokeWidth="1.58333" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </IconBadge>
                    <div className="info">
                        <div className="text-[16px] ">Account information</div>
                        <div className="text-[14px] text-[#64748B]">Your profile details and account settings</div>
                    </div>
                </div>
                <div className="accountForm p-4">
                    <form action="" method="post" className="flex flex-col">
                        <div className="toprow flex gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="Username" className="mb-1 text-sm font-medium">Label</label>
                                <input
                                    type="text"
                                    id="Username"
                                    placeholder="Sampler Temple"
                                    className="border border-solid border-[#E5E7EB] focus:border-primary focus:outline-none h-12 w-73.5 rounded-[5px] mb-4 pl-2.5 bg-white"
                                />  
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="Email-show" className="mb-1 text-sm font-medium">E-mail</label>
                            <input
                                type="email"
                                id="Email-show"
                                placeholder="Sampler@organisation.com"
                                className="border border-solid border-[#E5E7EB] focus:border-primary focus:outline-none h-12 w-73.5 rounded-[5px] mb-4 pl-2.5 bg-white"
                            />
                            </div>
                        </div>

                        <div className="bottomrow flex gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="sound" className="mb-1 text-sm font-medium">Role</label>
                                <input
                                    type="text"
                                    id="sound"
                                    placeholder="User"
                                    className="border border-solid border-[#E5E7EB] focus:border-primary focus:outline-none h-12 w-73.5 rounded-[5px] mb-4 pl-2.5 bg-white"
                                />
                            </div>
                            
                            <div className="flex gap-2 items-center">
                                <div className="flex flex-col">
                                    <label htmlFor="Status" className="mb-1 text-sm font-medium">Account Status</label>
                                    <input
                                    type="text"
                                    id="Status"
                                    placeholder="Active"
                                    className="border border-solid border-[#E5E7EB] focus:border-primary focus:outline-none h-12 w-58.5 rounded-[5px] mb-4 pl-2.5 bg-white"
                                    />
                                </div>
                                <svg className="mb-4" width="50" height="46" viewBox="0 0 50 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect y="34" width="8" height="8" rx="4" fill="#10B981"/>
                                        <path d="M18.572 42.144C17.788 42.144 17.092 41.964 16.484 41.604C15.884 41.236 15.416 40.728 15.08 40.08C14.744 39.424 14.576 38.664 14.576 37.8C14.576 36.944 14.744 36.192 15.08 35.544C15.416 34.888 15.884 34.376 16.484 34.008C17.092 33.64 17.788 33.456 18.572 33.456C19.38 33.456 20.084 33.64 20.684 34.008C21.284 34.376 21.748 34.888 22.076 35.544C22.412 36.192 22.58 36.944 22.58 37.8C22.58 38.664 22.412 39.424 22.076 40.08C21.748 40.728 21.284 41.236 20.684 41.604C20.084 41.964 19.38 42.144 18.572 42.144ZM18.584 41.256C19.176 41.256 19.692 41.12 20.132 40.848C20.58 40.568 20.928 40.172 21.176 39.66C21.424 39.14 21.548 38.52 21.548 37.8C21.548 37.08 21.424 36.464 21.176 35.952C20.928 35.432 20.58 35.036 20.132 34.764C19.692 34.492 19.176 34.356 18.584 34.356C17.992 34.356 17.472 34.492 17.024 34.764C16.576 35.036 16.228 35.432 15.98 35.952C15.732 36.464 15.608 37.08 15.608 37.8C15.608 38.52 15.732 39.14 15.98 39.66C16.228 40.172 16.576 40.568 17.024 40.848C17.472 41.12 17.992 41.256 18.584 41.256ZM23.9923 42V35.844H24.9043L24.9643 36.876C25.1483 36.508 25.4163 36.22 25.7683 36.012C26.1203 35.804 26.5243 35.7 26.9803 35.7C27.4523 35.7 27.8603 35.792 28.2043 35.976C28.5483 36.16 28.8163 36.44 29.0083 36.816C29.2003 37.184 29.2963 37.652 29.2963 38.22V42H28.2883V38.328C28.2883 37.744 28.1523 37.304 27.8803 37.008C27.6083 36.712 27.2323 36.564 26.7523 36.564C26.4323 36.564 26.1363 36.644 25.8643 36.804C25.6003 36.964 25.3883 37.196 25.2283 37.5C25.0763 37.796 25.0003 38.164 25.0003 38.604V42H23.9923ZM30.8947 42V33.36H31.9027V42H30.8947ZM33.6863 42V35.844H34.6943V42H33.6863ZM34.1903 34.596C33.9903 34.596 33.8223 34.532 33.6863 34.404C33.5583 34.268 33.4943 34.1 33.4943 33.9C33.4943 33.7 33.5583 33.54 33.6863 33.42C33.8223 33.292 33.9903 33.228 34.1903 33.228C34.3823 33.228 34.5463 33.292 34.6823 33.42C34.8183 33.54 34.8863 33.7 34.8863 33.9C34.8863 34.1 34.8183 34.268 34.6823 34.404C34.5463 34.532 34.3823 34.596 34.1903 34.596ZM36.4611 42V35.844H37.3731L37.4331 36.876C37.6171 36.508 37.8851 36.22 38.2371 36.012C38.5891 35.804 38.9931 35.7 39.4491 35.7C39.9211 35.7 40.3291 35.792 40.6731 35.976C41.0171 36.16 41.2851 36.44 41.4771 36.816C41.6691 37.184 41.7651 37.652 41.7651 38.22V42H40.7571V38.328C40.7571 37.744 40.6211 37.304 40.3491 37.008C40.0771 36.712 39.7011 36.564 39.2211 36.564C38.9011 36.564 38.6051 36.644 38.3331 36.804C38.0691 36.964 37.8571 37.196 37.6971 37.5C37.5451 37.796 37.4691 38.164 37.4691 38.604V42H36.4611ZM46.0034 42.144C45.4434 42.144 44.9434 42.012 44.5034 41.748C44.0714 41.476 43.7314 41.1 43.4834 40.62C43.2354 40.132 43.1114 39.568 43.1114 38.928C43.1114 38.28 43.2354 37.716 43.4834 37.236C43.7314 36.748 44.0714 36.372 44.5034 36.108C44.9434 35.836 45.4514 35.7 46.0274 35.7C46.6274 35.7 47.1314 35.836 47.5394 36.108C47.9554 36.372 48.2714 36.724 48.4874 37.164C48.7034 37.604 48.8114 38.084 48.8114 38.604C48.8114 38.684 48.8114 38.768 48.8114 38.856C48.8114 38.944 48.8074 39.044 48.7994 39.156H43.8674V38.376H47.8154C47.7994 37.792 47.6194 37.344 47.2754 37.032C46.9394 36.712 46.5154 36.552 46.0034 36.552C45.6674 36.552 45.3554 36.632 45.0674 36.792C44.7794 36.952 44.5434 37.188 44.3594 37.5C44.1834 37.804 44.0954 38.188 44.0954 38.652V38.988C44.0954 39.492 44.1834 39.916 44.3594 40.26C44.5434 40.604 44.7794 40.864 45.0674 41.04C45.3554 41.208 45.6674 41.292 46.0034 41.292C46.4434 41.292 46.7954 41.204 47.0594 41.028C47.3234 40.844 47.5194 40.588 47.6474 40.26H48.6434C48.5394 40.62 48.3674 40.944 48.1274 41.232C47.8954 41.512 47.5994 41.736 47.2394 41.904C46.8874 42.064 46.4754 42.144 46.0034 42.144Z" fill="#059669"/>
                                </svg>
                            </div>
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}
