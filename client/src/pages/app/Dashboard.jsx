import { PageHeading } from "../../Components/PageHeading";
import { useEffect, useState } from "react";
import { InviteTeammate } from "../../Components/InviteTeammate";
// import { Button } from "../../Components/Button";
import { NewOnboardingModal } from "../../Components/NewOnboardingModal";
import { Toast } from "../../Components/Toast";
import { TemplateFormModal } from "../../Components/TemplateFormModal";
import { UpcomingTaskDeadlines } from "../../Components/upcomingTaskDeadlines";
import { MyTasks } from "../../Components/MyTasksDashboard";
import { QuickActions } from "../../Components/QuickActions";
import { RecentUploads } from "../../Components/RecentUploads";
import { useAuth } from "../../context/AuthContext";
import { useAuthedApi } from "../../hooks/useAuthedApi";
import { getUserTasks } from "../../lib/usersApi";
import { updateTaskStatus, listOnboardings } from "../../lib/onboardingsApi";
import { listInvites } from "../../lib/invitesApi";
import { getRecentUploads } from "../../lib/settingsApi";
import { getErrorMessage } from "../../lib/getErrorMessage";

const ORG_DASHBOARD_ROLES = ["admin", "hr", "manager"];
const EXPIRING_SOON_DAYS = 7;

const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const diffDays = (new Date(dateStr).getTime() - Date.now()) / 86400000;
  return diffDays >= 0 && diffDays <= EXPIRING_SOON_DAYS;
};

const isThisQuarter = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3);
};

const formatStartDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const formatDueLabel = (dueAt) => {
  if (!dueAt) return { label: "No due date", overdue: false };
  const diffDays = Math.ceil((new Date(dueAt).getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`, overdue: true };
  if (diffDays === 0) return { label: "Due today", overdue: false };
  if (diffDays === 1) return { label: "Due tomorrow", overdue: false };
  return { label: `Due in ${diffDays} days`, overdue: false };
};

const statusStyles = {
  active: "bg-sky-500/15 text-sky-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  archived: "bg-gray-500/15 text-gray-400",
};
const statusLabels = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  archived: "Archived",
};

const progressColor = (value) => {
  if (value === 100) return "bg-emerald-500";
  if (value >= 50) return "bg-sky-500";
  return "bg-amber-500";
};

const activeOnboardingSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="6"/>
    <circle cx="32" cy="32" r="28" fill="none" stroke="#06B6D4" strokeWidth="6" strokeDasharray="176" strokeDashoffset="44" strokeLinecap="round" transform="rotate(-90 32 32)"/>
    <circle cx="32" cy="24" r="7" fill="#64748B"/>
  <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round"/>
  </svg>);

  const completedOnboardingSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="6" />
    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      strokeWidth="6" 
      strokeLinecap="round" 
      transform="rotate(-90 32 32)" 
    />
    <circle cx="32" cy="24" r="7" fill="#64748B" />
    <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
    <g transform="translate(18, 18)">
      <circle cx="32" cy="32" r="10" fill="#10B981" />
      <path d="M 28 32 L 31 35 L 36 29" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>);

  const pendingInvites = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="6" />

    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      strokeWidth="6" 
      strokeDasharray="176" 
      strokeDashoffset="132" 
      strokeLinecap="round" 
      transform="rotate(-90 32 32)" 
    />

    <path d="M 18 24 L 32 34 L 46 24" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="18" y="20" width="28" height="20" rx="3" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>);

  const expiringOnboardingsSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="6" />

    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      strokeWidth="6" 
      strokeDasharray="176" 
      strokeDashoffset="26" 
      strokeLinecap="round" 
      transform="rotate(-90 32 32)" 
    />

    <circle cx="32" cy="24" r="7" fill="#64748B" />
    <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />

    <g transform="translate(18, 18)">
      <circle cx="32" cy="32" r="10" fill="#EF4444" />
      <path d="M 32 28.5 V 32.5 L 34.5 34.5" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>);

  const canceledOnboardingsSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="6" />
    <circle 
      cx="32" cy="32" r="28" 
      fill="none" 
      stroke="#06B6D4" 
      strokeWidth="6" 
      strokeDasharray="176" 
      strokeDashoffset="88" 
      strokeLinecap="round" 
      transform="rotate(-90 32 32)" 
    />
    <circle cx="32" cy="24" r="7" fill="#64748B" />
    <path d="M 19 44 C 19 36, 45 36, 45 44" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
    <g transform="translate(18, 18)">
      <circle cx="32" cy="32" r="10" fill="#EF4444" />
      <path d="M 29 29 L 35 35 M 35 29 L 29 35" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>);

const Dashboard = () => {
  const { user } = useAuth();
  const authedApi = useAuthedApi();
  const [inviteModal, setInviteModal] = useState(false);
  const [OnboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastVariant, setToastVariant] = useState("success");
  const [myTasks, setMyTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [activeOnboardings, setActiveOnboardings] = useState([]);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [completedThisQuarterCount, setCompletedThisQuarterCount] = useState(0);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [recentUploads, setRecentUploads] = useState([]);
  const [orgDataLoading, setOrgDataLoading] = useState(true);

  const canManageTemplates = ["admin", "hr"].includes(user?.role);
  const canLaunchOnboarding = ["admin", "hr"].includes(user?.role);
  const canInvite = canManageTemplates || user?.role === "manager";
  const canViewOrgDashboard = ORG_DASHBOARD_ROLES.includes(user?.role);

  const loadMyTasks = () => {
    if (!user?.id) return;
    setTasksLoading(true);
    getUserTasks(authedApi, user.id, { status: "pending,in_progress" })
      .then((groups) => {
        const flattened = groups.flatMap((group) =>
          group.tasks.map((task) => {
            const { label, overdue } = formatDueLabel(task.dueAt);
            return {
              id: task.id,
              title: task.title,
              onboardingName: group.newHireName,
              status: task.status,
              requiresUpload: task.requiresUpload,
              dueAt: task.dueAt,
              dueLabel: label,
              overdue,
            };
          })
        );
        flattened.sort((a, b) => {
          if (!a.dueAt) return 1;
          if (!b.dueAt) return -1;
          return new Date(a.dueAt) - new Date(b.dueAt);
        });
        setMyTasks(flattened);
      })
      .catch(() => setMyTasks([]))
      .finally(() => setTasksLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading indicator for a real fetch, not derivable state
    loadMyTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadOrgData = () => {
    if (!canViewOrgDashboard) {
      setOrgDataLoading(false);
      return;
    }
    setOrgDataLoading(true);
    Promise.all([
      listOnboardings(authedApi, { status: "active" }),
      listOnboardings(authedApi, { status: "cancelled" }),
      listOnboardings(authedApi, { status: "completed" }),
      listInvites(authedApi),
      getRecentUploads(authedApi),
    ])
      .then(([active, cancelled, completed, invites, uploads]) => {
        setActiveOnboardings(active);
        setCancelledCount(cancelled.length);
        setCompletedThisQuarterCount(completed.filter((o) => isThisQuarter(o.completedAt)).length);
        setPendingInvitesCount(invites.length);
        setRecentUploads(uploads);
      })
      .catch(() => {
        setActiveOnboardings([]);
        setCancelledCount(0);
        setCompletedThisQuarterCount(0);
        setPendingInvitesCount(0);
        setRecentUploads([]);
      })
      .finally(() => setOrgDataLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading indicator for a real fetch, not derivable state
    loadOrgData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewOrgDashboard]);

  const expiringCount = activeOnboardings.filter((o) => isExpiringSoon(o.hirePortalExpiresAt)).length;

  const handleToggleMyTask = async (task) => {
    try {
      await updateTaskStatus(authedApi, task.id, { status: "done" });
      loadMyTasks();
    } catch (err) {
      setToastVariant("error");
      setToastMessage(getErrorMessage(err).message);
    }
  };

  const upcomingDeadlines = myTasks.filter((t) => t.dueAt).slice(0, 5);

  const handleLaunched = (record) => {
    setToastVariant("success");
    setToastMessage(`${record.newHireName}'s onboarding has been launched!`);
    loadOrgData();
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
              {orgDataLoading ? "–" : expiringCount}
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
              {orgDataLoading ? "–" : cancelledCount}
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
              {orgDataLoading ? "–" : completedThisQuarterCount}
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
              {orgDataLoading ? "–" : pendingInvitesCount}
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
                      <div className="text-4xl font-light text-foreground text-[#64748B]">
                        {orgDataLoading ? "–" : activeOnboardings.length}
                      </div>
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
                  {orgDataLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-[#64748B]">
                        Loading...
                      </td>
                    </tr>
                  ) : activeOnboardings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-[#64748B]">
                        No active onboardings.
                      </td>
                    </tr>
                  ) : (
                    activeOnboardings.map((onboarding) => (
                      <tr key={onboarding.id} className="text-gray-300 hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#64748B]">{onboarding.name}</td>
                        <td className="px-6 py-4 text-[#64748B]">{onboarding.template}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 w-32">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${progressColor(onboarding.progress)}`}
                                style={{ width: `${onboarding.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#64748B] w-8 shrink-0">{onboarding.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[onboarding.status] ?? "bg-gray-500/15 text-gray-400"}`}>
                            {statusLabels[onboarding.status] ?? onboarding.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#64748B]">{formatStartDate(onboarding.startDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </div>
          </div>
          <RecentUploads uploads={recentUploads} loading={orgDataLoading} />
        </div>
        <div className="quickAndUpcoming flex flex-col gap-4">
          <div className="upcomingAndRecent flex gap-4">
            <MyTasks tasks={myTasks} loading={tasksLoading} onToggle={handleToggleMyTask} />
            <UpcomingTaskDeadlines tasks={upcomingDeadlines} loading={tasksLoading} />
            <QuickActions
            onInvite={() => setInviteModal(true)}
            onNewOnboarding={() => setOnboardingModalOpen(true)}
            onNewTemplate={() => setTemplateModalOpen(true)}
            canInvite={canInvite}
            canManageTemplates={canManageTemplates}
            canLaunchOnboarding={canLaunchOnboarding}
          />
          </div>
        </div>
        {inviteModal && <InviteTeammate onClose={() => setInviteModal(false)} />}

        {OnboardingModalOpen && (
                <NewOnboardingModal
                  onClose={() => setOnboardingModalOpen(false)}
                  onLaunched={handleLaunched}
                />
              )}

        {toastMessage && <Toast message={toastMessage} variant={toastVariant} onDismiss={() => setToastMessage(null)} />}

        {templateModalOpen && <TemplateFormModal onClose={() => setTemplateModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;
