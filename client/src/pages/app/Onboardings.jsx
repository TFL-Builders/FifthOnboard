import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { PageHeading } from "../../Components/PageHeading";
import { FilterDropdown } from "../../Components/FilterDropdown";
import { Button } from "../../Components/Button";
import { Avatar } from "../../Components/Avatar";
import { ProgressBar } from "../../Components/ProgressBar";
import { StatusBadge } from "../../Components/StatusBadge";
import { NewOnboardingModal } from "../../Components/NewOnboardingModal";
import { OnboardingDetailModal } from "../../Components/OnboardingDetailModal";
import { Toast } from "../../Components/Toast";
import { useOnboardings } from "../../context/OnboardingsContext";

const RECENTLY_COMPLETED = [
  { id: 1, task: "Sign employment contract and NDA", onboarding: "Alicia Chen's onboarding", by: "Sampler Temple", when: "2 days ago" },
  { id: 2, task: "Provision laptop and peripherals", onboarding: "Marcus Webb's onboarding", by: "Daniel Reyes", when: "3 days ago" },
  { id: 3, task: "Complete benefits enrollment", onboarding: "Grace Kim's onboarding", by: "Grace Kim", when: "4 days ago" },
  { id: 4, task: "Ship first independent change to production", onboarding: "Marcus Webb's onboarding", by: "Marcus Webb", when: "5 days ago" },
  { id: 5, task: "Present short demo to team", onboarding: "Priya Sharma's onboarding", by: "Priya Sharma", when: "1 week ago" },
];

export const Onboardings = () => {
  const { records, toggleTask, markComplete } = useOnboardings();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filteredRecords = records.filter(
    (record) =>
      record.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All" || record.status === status.toLowerCase())
  );

  const handleLaunched = (record) => {
    setToastMessage(`${record.name}'s onboarding has been launched!`);
  };

  return (
    <div className="p-8 bg-background h-full">
      <div className="flex justify-between items-start mb-6">
        <PageHeading
          title="Onboardings"
          subtitle="Track every new hire from offer to productive."
          className="pb-0"
        />
        <Button variant="action" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          New onboarding
        </Button>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search new hires..."
                className="border border-solid border-[#E5E7EB] focus:border-primary focus:outline-none h-11 w-full rounded-[15px] pl-10 pr-2.5 bg-white"
              />
            </div>
            <FilterDropdown value={status} options={["All", "Active", "Completed"]} onChange={setStatus} />
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-[#64748B] border-b border-border">
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Template</th>
                  <th className="p-3 font-semibold">Manager</th>
                  <th className="p-3 font-semibold">Progress</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, i) => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedIndex(i)}
                    className="border-b border-border last:border-0 hover:bg-background transition-colors cursor-pointer"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={record.name} size={32} />
                        <div className="min-w-0">
                          <div className="text-[14px] truncate">{record.name}</div>
                          <div className="text-[12px] text-[#64748B] truncate">{record.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[14px]">{record.template}</td>
                    <td className={`p-3 text-[14px] ${record.manager === "Unassigned" ? "text-[#B45309]" : ""}`}>
                      {record.manager}
                    </td>
                    <td className="p-3 w-40">
                      <ProgressBar value={record.progress} />
                    </td>
                    <td className="p-3">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#64748B]">
                      No onboardings match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-80 shrink-0 border border-border rounded-2xl bg-white p-4">
          <div className="text-[16px] font-medium">Recently Completed</div>
          <div className="text-[12px] text-[#64748B] mb-3">Latest task completions across all onboardings</div>

          <div className="flex flex-col gap-3">
            {RECENTLY_COMPLETED.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Avatar name={item.by} size={28} />
                <div className="min-w-0">
                  <div className="text-[14px] font-medium leading-snug">{item.task}</div>
                  <div className="text-[12px] text-[#64748B]">in {item.onboarding}</div>
                  <div className="text-[12px] text-[#94A3B8]">
                    Completed by {item.by} · {item.when}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <NewOnboardingModal
          onClose={() => setModalOpen(false)}
          onLaunched={handleLaunched}
        />
      )}

      {selectedIndex !== null && (
        <OnboardingDetailModal
          records={filteredRecords}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
          onToggleTask={toggleTask}
          onMarkComplete={markComplete}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};
