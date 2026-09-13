const lockSVG = () =>  (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E1E7EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>)

export const CancelledOnboarding = () => {
  return (
    <div className="flex items-center justify-center h-200 w-screen">
        <div className="Cancelled flex flex-col justify-center items-center w-[120] gap-2">
            <div className="svg rounded-full bg-[#64748B] p-4">
                {lockSVG()}
            </div>
            <div className="text text-center flex flex-col gap-2">
                <div className="main text-[24px] font-extrabold text-primary leading-[1.2]">
                    Your invite link has expired
                </div>
                <div className="extra text-[15px] text-[#64748B] leading-[1.6]">
                    This portal link has expired. Please contact your manager to get a new one.
                </div>
                <div className="extra text-[13px] text-[#64748B]">
                    Please reach out to your manager or HR team directly.
                </div>
            </div>
        </div>
    </div>
  )
}