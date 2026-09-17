import { Check } from "lucide-react";
import { TaskComments } from "./TaskComments";

const checklistSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

export const MyTasks = ({ tasks = [], loading = false, onToggle }) => (
  <div className="group flex flex-col p-6 w-[40%] bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">My Tasks</h3>
      <div className="w-5 h-5 text-muted-foreground text-primary transition-colors">
        {checklistSVG()}
      </div>
    </div>
    <div className="flex flex-col gap-1">
      {loading ? (
        <div className="py-6 text-center text-sm text-[#64748B]">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#64748B]">No tasks assigned to you.</div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="flex flex-col py-2.5 border-b border-border last:border-0">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => !task.requiresUpload && onToggle(task)}
                disabled={task.requiresUpload}
                className="flex items-center gap-2 min-w-0 text-left disabled:cursor-not-allowed"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    task.status === "done" ? "bg-primary border-primary" : "border-[#E5E7EB]"
                  }`}
                >
                  {task.status === "done" && <Check className="text-white" size={10} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-foreground truncate">{task.title}</span>
                  <span className="text-xs text-[#64748B] truncate">{task.onboardingName}</span>
                </div>
              </button>
              <span className={`text-xs font-medium shrink-0 ml-2 ${task.overdue ? "text-red-500" : "text-[#64748B]"}`}>
                {task.dueLabel}
              </span>
            </div>
            <div className="pl-6">
              <TaskComments taskId={task.id} />
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
