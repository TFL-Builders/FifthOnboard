import { useState, useRef, useEffect } from "react";
import { InviteTeammate } from "../../Components/InviteTeammate";

const Roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'taskOwner', label: 'T.O.' },
  { value: 'newHire', label: 'New Hire' },
];

const Departments = [
  { value: 'hr', label: 'HR' },
  { value: 'fifthLab', label: 'Fifth-lab' },
  { value: 'customerService', label: 'Customer Service' },
  { value: 'dataCenter', label: 'Data Center' },
  { value: 'brandsAndMarketing', label: 'Brands and M' },
];

const members = [
  { id: 1, name: "Game", email: "game@gmail.com", role: "admin", department: null, status: "Active" },
  { id: 2, name: "John Smith", email: "john@test.com", role: "manager", department: "customerService", status: "Active" },
  { id: 3, name: "Jaja", email: "2023163@jkk1@nileuniversity.edu.ng", role: "taskOwner", department: "hr", status: "Disabled" },
  { id: 1, name: "Heliopolis", email: "helio@polis.com", role: "new Hire", department: "fifthLab", status: "Active" },
];

const avatarColors = ["bg-emerald-600", "bg-amber-700", "bg-fuchsia-700", "bg-sky-700", "bg-rose-700"];

const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const getInitials = (name) => {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 1).toUpperCase();
};

const roleStyles = {
  admin: "bg-red-500/15 text-red-400",
  manager: "bg-sky-500/15 text-sky-400",
  taskOwner: "bg-violet-500/15 text-violet-400",
  supervisor: "bg-amber-500/15 text-amber-400",
  newHire: "bg-teal-500/15 text-teal-400",
};

const statusStyles = {
  Active: "bg-emerald-500/15 text-emerald-400",
  Disabled: "bg-red-500/15 text-red-400",
};

export const People = () => {
  const [selected, setSelected] = useState("member");
  const [inviteModal, setInviteModal] = useState(false);
  const [query, setQuery] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState('');
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [status, setStatus] = useState("active");

  const filterRef = useRef(null);

  // Close both dropdowns when clicking anywhere outside them
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setRoleOpen(false);
        setDepartmentOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleToggle = () => {
    setDepartmentOpen(false);
    setRoleOpen((prev) => !prev);
  };

  const handleDepartmentToggle = () => {
    setRoleOpen(false);
    setDepartmentOpen((prev) => !prev);
  };

  const filteredMembers = members.filter((member) => {
    const matchesQuery = member.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesRole = !selectedRoles || member.role === selectedRoles;
    const matchesDepartment = !selectedDepartment || member.department === selectedDepartment;
    const matchesStatus = member.status.toLowerCase() === status;
    return matchesQuery && matchesRole && matchesDepartment && matchesStatus;
  });

  const inviteSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" height="24px" width="24px" viewBox="0 0 512 512">
      <g><g><path d="M352.062,314.075c-19.834-20.912-43.665-36.124-68.765-44.408c25.008-22.555,40.754-55.191,40.754-91.439    c0-67.899-55.24-123.139-123.139-123.139S77.772,110.329,77.772,178.228c0,36.248,15.746,68.884,40.754,91.439    c-25.101,8.285-48.932,23.498-68.766,44.409C17.672,347.906,0,391.728,0,437.468v19.443h401.823v-19.443    C401.823,391.728,384.15,347.906,352.062,314.075z M116.658,178.228c0-46.457,37.796-84.253,84.253-84.253    c46.457,0,84.253,37.796,84.253,84.253s-37.796,84.253-84.253,84.253C154.454,262.481,116.658,224.685,116.658,178.228z     M40.256,418.025c9.65-67.94,68.591-116.658,121.769-116.658h77.772c53.178,0,112.119,48.718,121.769,116.658H40.256z"/></g></g>
      <g><g><polygon points="453.671,223.595 453.671,165.266 414.785,165.266 414.785,223.595 356.456,223.595 356.456,262.481     414.785,262.481 414.785,320.81 453.671,320.81 453.671,262.481 512,262.481 512,223.595   "/></g></g>
    </svg>
  );

  return (
    <div className="p-8">
      <div className="introPeople flex justify-between items-center">
        <div className="pb-6">
          <div className="profile-settings text-[30px]">People</div>
          <div className="manage text-[16px] text-[#64748B]">Manage your team members and pending invites</div>
        </div>
        <button
          type="button"
          className="InviteButton flex gap-2 bg-primary rounded-md p-2 w-45 h-10 cursor-pointer"
          onClick={() => setInviteModal(true)}
        >
          {inviteSVG()}
          <div className="text-white">Invite Teammate</div>
        </button>
      </div>

      <div className="w-full border-2 border-primary rounded-md">
        <div className="flex focus:brightness-150">
          <button
            type="button"
            className={`py-2 w-[20%] flex justify-center items-center cursor-pointer ${selected === "member" ? "border-b-2 border-primary text-primary shadow-md" : "border-b-2 border-primary text-[#64748B]"}`}
            onClick={() => setSelected("member")}
          >
            Members
          </button>
          <button
            type="button"
            className={`py-2 w-[20%] flex justify-center items-center cursor-pointer ${selected === "invite" ? "border-b-2 border-primary text-primary shadow-md" : "border-b-2 border-primary text-[#64748B]"}`}
            onClick={() => setSelected("invite")}
          >
            Invites
          </button>
          <div className="py-2 w-[60%] border-b-2 border-primary"></div>
        </div>

        <div className="searchbar p-2 flex flex-wrap gap-1.5 border-b-2 border-primary">
          <div className="flex items-center gap-2 w-full max-w-70 px-4 py-2 bg-white border border-[#64748B] rounded-lg shadow-sm transition-all focus-within:border-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5 text-gray-400 shrink-0">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div ref={filterRef} className="flex gap-1.5">
            <div className="roles">
              <div className="relative w-25">
                <button
                  type="button"
                  onClick={handleRoleToggle}
                  className="w-full h-9 px-2 flex items-center justify-between rounded-md border border-[#64748B] bg-white text-sm text-left focus:border-primary focus:outline-none"
                >
                  <span className={selectedRoles ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedRoles ? Roles.find((o) => o.value === selectedRoles)?.label : 'All Roles'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${roleOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {roleOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 divide-y divide-gray-100">
                    <div
                      onClick={() => { setSelectedRoles(''); setRoleOpen(false); }}
                      className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer truncate text-gray-500"
                    >
                      All Roles
                    </div>
                    {Roles.map((role) => (
                      <div
                        key={role.value}
                        onClick={() => { setSelectedRoles(role.value); setRoleOpen(false); }}
                        className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer truncate"
                      >
                        {role.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="Department">
              <div className="relative w-40">
                <button
                  type="button"
                  onClick={handleDepartmentToggle}
                  className="w-full h-9 px-2 flex items-center justify-between rounded-md border border-[#64748B] bg-white text-sm text-left focus:border-primary focus:outline-none"
                >
                  <span className={selectedDepartment ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedDepartment ? Departments.find((o) => o.value === selectedDepartment)?.label : 'All Departments'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${departmentOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {departmentOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 divide-y divide-gray-100">
                    <div
                      onClick={() => { setSelectedDepartment(''); setDepartmentOpen(false); }}
                      className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer truncate text-gray-500"
                    >
                      All Departments
                    </div>
                    {Departments.map((department) => (
                      <div
                        key={department.value}
                        onClick={() => { setSelectedDepartment(department.value); setDepartmentOpen(false); }}
                        className="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer truncate"
                      >
                        {department.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="active border border-[#64748B] rounded-lg flex justify-center text-[14px] overflow-hidden">
            <button type="button" className={`ac p-1 flex items-center cursor-pointer ${status === "active" ? "bg-primary text-white" : "bg-white text-[#64748B]"}`} onClick={() => setStatus("active")}>
              Active
            </button>
            <div className="line border-l border-[#64748B]"></div>
            <button type="button" className={`disabled p-1 flex items-center cursor-pointer ${status === "disabled" ? "bg-primary text-white" : "bg-white text-[#64748B]"}`} onClick={() => setStatus("disabled")}>
              Disabled
            </button>
          </div>
        </div>

        {selected === "invite" ? (
          <div className="p-10 text-center text-[#64748B]">Pending invites will appear here.</div>
        ) : (
          <div className="bg-white rounded-b-md overflow-x-auto">
            <table className="w-full min-w-180px text-sm text-left">
              <thead className="border-b-2 border-primary">
                <tr className="text-gray-400 text-xs uppercase">
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      No members match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="text-[#64748B]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getAvatarColor(member.name)}`}>
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="font-medium text-[#334155]">{member.name}</div>
                            <div className="text-xs text-[#64748B]">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${roleStyles[member.role] ?? "bg-gray-500/15 text-gray-400"}`}>
                          {Roles.find((r) => r.value === member.role)?.label ?? member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#64748B]">
                        {Departments.find((d) => d.value === member.department)?.label ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[member.status]}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* set onclick value to show actions */}
                          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {/* set Onclick value to show people related */}
                          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.94-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {inviteModal && <InviteTeammate onClose={() => setInviteModal(false)} />}
    </div>
  );
};