// import React from 'react'
// import { useState } from "react"
import { InviteTeammate } from "../../Components/InviteTeammate"

export const People = () => {
  // const [selected,setSelected] = useState(false);
  // const [invitE,setInvitE] = useState(null);

  return (
    <div className="p-8 bg-background h-full">
      <div className="introPeople flex justify-between items-center">
          <div className="pb-6">
                <div className="profile-settings text-[30px]">People</div>
                <div className="manage text-[16px] text-[#64748B]">Manage your team members and pending invites</div>
          </div>
          <div className="Invitebutton flex gap-2 bg-primary rounded-md p-2 w-42 h-10 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="white" height="24px" width="24px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xml:space="preserve">
              <g>
                <g>
                  <path d="M352.062,314.075c-19.834-20.912-43.665-36.124-68.765-44.408c25.008-22.555,40.754-55.191,40.754-91.439    c0-67.899-55.24-123.139-123.139-123.139S77.772,110.329,77.772,178.228c0,36.248,15.746,68.884,40.754,91.439    c-25.101,8.285-48.932,23.498-68.766,44.409C17.672,347.906,0,391.728,0,437.468v19.443h401.823v-19.443    C401.823,391.728,384.15,347.906,352.062,314.075z M116.658,178.228c0-46.457,37.796-84.253,84.253-84.253    c46.457,0,84.253,37.796,84.253,84.253s-37.796,84.253-84.253,84.253C154.454,262.481,116.658,224.685,116.658,178.228z     M40.256,418.025c9.65-67.94,68.591-116.658,121.769-116.658h77.772c53.178,0,112.119,48.718,121.769,116.658H40.256z"/>
                </g>
              </g>
              <g>
                <g>
                  <polygon points="453.671,223.595 453.671,165.266 414.785,165.266 414.785,223.595 356.456,223.595 356.456,262.481     414.785,262.481 414.785,320.81 453.671,320.81 453.671,262.481 512,262.481 512,223.595   "/>
                </g>
              </g>
            </svg>
            <div className="text-white">Invite Teammate</div>
          </div>
      </div>
      <div className="w-162.5 border border-primary rounded-md">
        <div>
          <div className="flex focus:brightness-150">
            <div className="p-2">Members</div>
            <div className="p-2">Invites</div>
          </div>
          <div empty border></div>
        </div>
      </div>
    </div>
  )
}
