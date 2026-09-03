const upcomingDeadlinesData = [
  { id: 1, task: "Laptop setup", person: "Priya Nair", dueLabel: "Overdue by 3 days", overdue: true },
  { id: 2, task: "Sign handbook ack.", person: "Jordan Reyes", dueLabel: "Due tomorrow", overdue: false },
  { id: 3, task: "90-day review scheduled", person: "Marcus Lee", dueLabel: "Due in 6 days", overdue: false },
];

const clockSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

export const UpcomingTaskDeadlines = () => (
  <div className="group flex flex-col p-6 w-[40%] bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</h3>
      <div className="w-5 h-5 text-muted-foreground text-primary transition-colors">
        {clockSVG()}
      </div>
    </div>
    <div className="flex flex-col gap-1">
      {upcomingDeadlinesData.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#64748B]">Nothing due soon.</div>
      ) : (
        upcomingDeadlinesData.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
          >
            <div className="flex flex-col">
              <span className="text-sm text-foreground">{item.task}</span>
              <span className="text-xs text-[#64748B]">{item.person}</span>
            </div>
            <span className={`text-xs font-medium ${item.overdue ? "text-red-500" : "text-[#64748B]"}`}>
              {item.dueLabel}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);