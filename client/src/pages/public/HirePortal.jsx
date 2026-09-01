import { useParams } from "react-router-dom";
import { Link as LinkIcon, Check, Lock } from "lucide-react";
import { Avatar } from "../../Components/Avatar";
import { ProgressBar } from "../../Components/ProgressBar";
import { useOnboardings } from "../../context/OnboardingsContext";
import { PHASES } from "../../data/mockTasks";
import Logo from "../../assets/Fifthlab.png";

const InvalidLink = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="max-w-sm w-full text-center flex flex-col items-center gap-3">
      <div className="bg-[#FEF2F2] rounded-full w-14 h-14 flex items-center justify-center">
        <LinkIcon className="text-red-500" size={24} />
      </div>
      <div className="text-[20px] font-bold">This link isn&apos;t valid</div>
      <div className="text-[14px] text-[#64748B]">
        This onboarding link is invalid or has expired. Please reach out to whoever sent it to you for a new one.
      </div>
    </div>
  </div>
);

export const HirePortal = () => {
  const { portalId } = useParams();
  const { getByPortalId, toggleTask } = useOnboardings();
  const record = getByPortalId(portalId);

  if (!record) return <InvalidLink />;

  const doneCount = record.tasks.filter((t) => t.done).length;
  const tasksByPhase = PHASES.map((phase) => ({
    phase,
    tasks: record.tasks.filter((t) => t.phase === phase),
  })).filter((group) => group.tasks.length > 0);

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <img src={Logo} alt="Fifthlabs Logo" className="h-7 w-auto self-start" />

        <div>
          <div className="text-[30px] font-bold">Welcome, {record.name}!</div>
          <div className="text-[16px] text-[#64748B] mt-1">
            {record.jobTitle} · Starting {record.startDate || "soon"}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
          <Avatar name={record.manager === "Unassigned" ? "?" : record.manager} size={40} />
          <div>
            <div className="text-[12px] text-[#64748B]">Your onboarding contact</div>
            <div className={`text-[14px] font-medium ${record.manager === "Unassigned" ? "text-[#B45309]" : ""}`}>
              {record.manager}
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="text-[14px] font-medium mb-2">
            {doneCount} of {record.tasks.length} tasks complete
          </div>
          <ProgressBar value={record.progress} />
        </div>

        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col gap-5">
          {tasksByPhase.map(({ phase, tasks }) => (
            <div key={phase} className="flex flex-col gap-1">
              <div className="text-[12px] uppercase tracking-wide text-[#64748B] font-semibold mb-1">{phase}</div>
              {tasks.map((task) => {
                const isYours = task.assigneeRole === "Employee";
                return (
                  <div
                    key={task.id}
                    role={isYours ? "button" : undefined}
                    tabIndex={isYours ? 0 : undefined}
                    onClick={isYours ? () => toggleTask(record.id, task.id) : undefined}
                    onKeyDown={
                      isYours
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") toggleTask(record.id, task.id);
                          }
                        : undefined
                    }
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      isYours ? "cursor-pointer hover:bg-background" : ""
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                        task.done ? "bg-primary border-primary" : "border-[#E5E7EB]"
                      }`}
                    >
                      {task.done && <Check className="text-white" size={12} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[14px] ${task.done ? "text-[#94A3B8] line-through" : ""}`}>
                        {task.title}
                      </div>
                      {!isYours && (
                        <div className="text-[12px] text-[#64748B] flex items-center gap-1 mt-0.5">
                          <Lock size={11} />
                          Handled by {task.assigneeRole}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="text-[12px] text-[#94A3B8] text-center">
          This link is unique to you — please don&apos;t share it with anyone else.
        </div>
      </div>
    </div>
  );
};
