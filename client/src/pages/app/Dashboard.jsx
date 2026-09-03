import { PageHeading } from "../../Components/PageHeading";
import { useState } from "react";
import { InviteTeammate } from "../../Components/InviteTeammate";
import { Button } from "../../Components/Button";
import { NewOnboardingModal } from "../../Components/NewOnboardingModal";
import { Toast } from "../../Components/Toast";
import { NewTemplateModal } from "../../Components/NewTemplateModal";
import { UpcomingTaskDeadlines } from "../../Components/upcomingTaskDeadlines";
import { MyTasks } from "../../Components/myTasks";

const statusStyles = {
  "In Progress": "bg-sky-500/15 text-sky-400",
  "Completed": "bg-emerald-500/15 text-emerald-400",
  "Blocked": "bg-red-500/15 text-red-400",
  "Not Started": "bg-gray-500/15 text-gray-400",
};

const progressColor = (value) => {
  if (value === 100) return "bg-emerald-500";
  if (value >= 50) return "bg-sky-500";
  return "bg-amber-500";
};
const inviteSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" height="24px" width="24px" viewBox="0 0 512 512">
      <g><g><path d="M352.062,314.075c-19.834-20.912-43.665-36.124-68.765-44.408c25.008-22.555,40.754-55.191,40.754-91.439    c0-67.899-55.24-123.139-123.139-123.139S77.772,110.329,77.772,178.228c0,36.248,15.746,68.884,40.754,91.439    c-25.101,8.285-48.932,23.498-68.766,44.409C17.672,347.906,0,391.728,0,437.468v19.443h401.823v-19.443    C401.823,391.728,384.15,347.906,352.062,314.075z M116.658,178.228c0-46.457,37.796-84.253,84.253-84.253    c46.457,0,84.253,37.796,84.253,84.253s-37.796,84.253-84.253,84.253C154.454,262.481,116.658,224.685,116.658,178.228z     M40.256,418.025c9.65-67.94,68.591-116.658,121.769-116.658h77.772c53.178,0,112.119,48.718,121.769,116.658H40.256z"/></g></g>
      <g><g><polygon points="453.671,223.595 453.671,165.266 414.785,165.266 414.785,223.595 356.456,223.595 356.456,262.481     414.785,262.481 414.785,320.81 453.671,320.81 453.671,262.481 512,262.481 512,223.595   "/></g></g>
    </svg>
  );

const activeOnboardingSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" stroke-width="6"/>
    <circle cx="32" cy="32" r="28" fill="none" stroke="#06B6D4" stroke-width="6" stroke-dasharray="176" stroke-dashoffset="44" stroke-linecap="round" transform="rotate(-90 32 32)"/>
    <circle cx="32" cy="24" r="7" fill="#64748B"/>
  <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
  </svg>);

  const completedOnboardingSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" stroke-width="6" />
    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      stroke-width="6" 
      stroke-linecap="round" 
      transform="rotate(-90 32 32)" 
    />
    <circle cx="32" cy="24" r="7" fill="#64748B" />
    <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" stroke-width="6" stroke-linecap="round" />
    <g transform="translate(18, 18)">
      <circle cx="32" cy="32" r="10" fill="#10B981" />
      <path d="M 28 32 L 31 35 L 36 29" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>);

  const pendingInvites = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" stroke-width="6" />

    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      stroke-width="6" 
      stroke-dasharray="176" 
      stroke-dashoffset="132" 
      stroke-linecap="round" 
      transform="rotate(-90 32 32)" 
    />

    <path d="M 18 24 L 32 34 L 46 24" fill="none" stroke="#64748B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="18" y="20" width="28" height="20" rx="3" fill="none" stroke="#64748B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>);

  const expiringOnboardingsSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" stroke-width="6" />

    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      stroke-width="6" 
      stroke-dasharray="176" 
      stroke-dashoffset="26" 
      stroke-linecap="round" 
      transform="rotate(-90 32 32)" 
    />

    <circle cx="32" cy="24" r="7" fill="#64748B" />
    <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" stroke-width="6" stroke-linecap="round" />

    <g transform="translate(18, 18)">
      <circle cx="32" cy="32" r="10" fill="#EF4444" />
      <path d="M 32 28.5 V 32.5 L 34.5 34.5" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>);

  const canceledOnboardingsSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" stroke-width="6" />
    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      stroke-width="6" 
      stroke-dasharray="176" 
      stroke-dashoffset="88" 
      stroke-linecap="round" 
      transform="rotate(-90 32 32)" 
    />
    <circle cx="32" cy="24" r="7" fill="#64748B" />
    <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" stroke-width="6" stroke-linecap="round" />
    <g transform="translate(18, 18)">
      <circle cx="32" cy="32" r="10" fill="#EF4444" />
      <path d="M 29 29 L 35 35 M 35 29 L 29 35" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    </g>
  </svg>);

  const projects = [
  {
    id: 1,
    name: "Hank Shrader",
    template: "Marketing Sprint",
    progress: 72,
    status: "In Progress",
    startDate: "Jan 12, 2026",
  },
  {
    id: 2,
    name: "Gustavo Fring",
    template: "Product Rollout",
    progress: 100,
    status: "Completed",
    startDate: "Nov 3, 2025",
  },
  {
    id: 3,
    name: "Better Saul",
    template: "Call",
    progress: 10,
    status: "Completed",
    startDate: "Nov 3, 2025",
  },
];

const Dashboard = () => {
  const [inviteModal, setInviteModal] = useState(false);
  const [OnboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);


  const handleLaunched = (record) => {
    setToastMessage(`${record.name}'s onboarding has been launched!`);
  };
  
  return (
    <div className="p-8">
      <PageHeading title="Dashboard" subtitle="Welcome back, here's what's happening comprehensively." />
      <div className="linkcard flex gap-2 pb-4">
          <div className="group flex flex-col p-6 w-full sm:max-w-xs bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Expiring Onboardings
              </h3>
              <div className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
                {expiringOnboardingsSVG()}
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground">
              2
            </div>
          </div>
          <div className="group flex flex-col p-6 w-full sm:max-w-xs bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Canceled Onboardings
              </h3>
              <div className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
                {canceledOnboardingsSVG()}
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground">
              1
            </div>
          </div>
          <div className="group flex flex-col p-6 w-full sm:max-w-xs bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Completed Onboardings <span className="text-[10px]">per quarter</span>
              </h3>
              <div className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
                {completedOnboardingSVG()}
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground">
              8
            </div>
          </div>
          <div className="group flex flex-col p-6 w-full sm:max-w-xs bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Pending Invites
              </h3>
              <div className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
                {pendingInvites()}
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground">
              4
            </div>
          </div>
        </div>
        <div className="activeAndUpload flex flex-row gap-2 pb-4">
          <div className="active w-[60%]">
            <div className="group flex flex-col p-6 bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Active Onboardings
                    <div className="flex items-center gap-2">
                      <div className="text-4xl font-light text-foreground text-[#64748B]">7</div>
                      <span className="font-light text-[#64748B]">currently in progress</span>
                    </div>
                  </h3>
                  <div className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
                    {activeOnboardingSVG()}
                  </div>
              </div>
              <div className=" rounded-xl overflow-hidden">
              <table className="text-sm text-left">
                <thead>
                  <tr className="text-[#64748B] text-xs uppercase tracking-wide border-b border-border">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Template</th>
                    <th className="px-6 py-4 font-semibold">Progress</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-[#64748B]">
                        No projects yet.
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id} className="text-gray-300 hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#64748B]">{project.name}</td>
                        <td className="px-6 py-4 text-[#64748B]">{project.template}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 w-32">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${progressColor(project.progress)}`}
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#64748B] w-8 shrink-0">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[project.status] ?? "bg-gray-500/15 text-gray-400"}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#64748B]">{project.startDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </div>
          </div>
          <div className="group flex flex-col p-6 w-[35%] bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer">
              <div className="flex justify-between items-center mb-2 ">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Recent Uploads
                </h3>
                <div className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
                  {completedOnboardingSVG()}
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground">
                <p className="text-[20px]">Interns C.V. and WAEC Result</p>
              </div>
          </div>
        </div>
        <div className="quickAndUpcoming flex flex-col gap-4">
          <div className="upcomingAndRecent flex gap-4">
            <MyTasks />
            <UpcomingTaskDeadlines />
            <div className="quickActions p-2">
            <div className="wording text-[#64748B] pb-2">Quick Actions</div>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="InviteButton flex gap-2 bg-primary rounded-md p-2 w-45 h-10 cursor-pointer"
                onClick={() => setInviteModal(true)}
              >
                {inviteSVG()}
                <div className="text-white">Invite Teammate</div>
              </button>
              <Button className="w-45 h-10" variant="action" onClick={() => setOnboardingModalOpen(true)}>
                New onboarding
              </Button>
              <Button className="w-45 h-10" variant="action" onClick={() => setTemplateModalOpen(true)}>
                New Template
              </Button>
            </div>
          </div>
          </div>
        </div>
        {inviteModal && <InviteTeammate onClose={() => setInviteModal(false)} />}

        {OnboardingModalOpen && (
                <NewOnboardingModal
                  onClose={() => setOnboardingModalOpen(false)}
                  onLaunched={handleLaunched}
                />
              )}

        {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

        {templateModalOpen && <NewTemplateModal onClose={() => setTemplateModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;
