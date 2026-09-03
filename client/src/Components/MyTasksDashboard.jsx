const myTasksData = [
  { id: 1, title: "Review offer letter", onboarding: "Jordan Reyes", dueLabel: "Due tomorrow", urgent: true },
  { id: 2, title: "Set default manager", onboarding: "Sales dept", dueLabel: "Due in 3 days", urgent: false },
  { id: 3, title: "Approve IT provisioning", onboarding: "Priya Nair", dueLabel: "Due in 5 days", urgent: false },
];

const checklistSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

export const MyTasks = () => (
  <div className="group flex flex-col p-6 w-[40%] bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">My Tasks</h3>
      <div className="w-5 h-5 text-muted-foreground text-primary transition-colors">
        {checklistSVG()}
      </div>
    </div>
    <div className="flex flex-col gap-1">
      {myTasksData.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#64748B]">No tasks assigned to you.</div>
      ) : (
        myTasksData.map((task) => (
          <div
            key={task.id}
            className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
          >
            <div className="flex flex-col">
              <span className="text-sm text-foreground">{task.title}</span>
              <span className="text-xs text-[#64748B]">{task.onboarding}</span>
            </div>
            <span className={`text-xs font-medium ${task.urgent ? "text-red-500" : "text-[#64748B]"}`}>
              {task.dueLabel}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);