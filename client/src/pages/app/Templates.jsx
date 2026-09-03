import { useEffect, useState } from "react";
import { Search, Plus, FileText, Pencil, Copy, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { PageHeading } from "../../Components/PageHeading";
import { IconBadge } from "../../Components/IconBadge";
import { Badge } from "../../Components/Badge";
import { Button } from "../../Components/Button";
import { IconButton } from "../../Components/IconButton";
import { FilterDropdown } from "../../Components/FilterDropdown";
import { TemplateFormModal } from "../../Components/TemplateFormModal";
import { ConfirmDialog } from "../../Components/ConfirmDialog";
import { Toast } from "../../Components/Toast";
import { useAuth } from "../../context/AuthContext";
import { useAuthedApi } from "../../hooks/useAuthedApi";
import { listTemplates, cloneTemplate, archiveTemplate, unarchiveTemplate, deleteTemplate, formatUpdatedAt } from "../../lib/templatesApi";
import { getErrorMessage } from "../../lib/getErrorMessage";

const FILTERS = ["Active", "Archived", "All"];

export const Templates = () => {
  const { user } = useAuth();
  const authedApi = useAuthedApi();
  const isAdmin = user?.role === "admin";

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Active");
  const [formTemplateId, setFormTemplateId] = useState(undefined); // undefined = closed, null = create, id = edit
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadTemplates = () => {
    setLoading(true);
    setLoadError("");
    listTemplates(authedApi, filter.toLowerCase())
      .then(setTemplates)
      .catch((err) => setLoadError(getErrorMessage(err).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading indicator for a real fetch, not derivable state
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filteredTemplates = templates.filter((template) => template.name.toLowerCase().includes(search.toLowerCase()));

  const handleSaved = (saved) => {
    setFormTemplateId(undefined);
    setToastMessage(`"${saved.name}" ${formTemplateId ? "updated" : "created"}.`);
    loadTemplates();
  };

  const handleClone = async (id) => {
    try {
      const cloned = await cloneTemplate(authedApi, id);
      setToastMessage(`Duplicated as "${cloned.name}".`);
      loadTemplates();
    } catch (err) {
      setToastMessage(getErrorMessage(err).message);
    }
  };

  const handleToggleArchive = async (template) => {
    try {
      if (template.isArchived) {
        await unarchiveTemplate(authedApi, template.id);
        setToastMessage(`"${template.name}" restored to active.`);
      } else {
        await archiveTemplate(authedApi, template.id);
        setToastMessage(`"${template.name}" archived.`);
      }
      loadTemplates();
    } catch (err) {
      setToastMessage(getErrorMessage(err).message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTemplate(authedApi, confirmDeleteId);
      setConfirmDeleteId(null);
      setToastMessage("Template deleted.");
      loadTemplates();
    } catch (err) {
      setToastMessage(getErrorMessage(err).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 bg-background h-full">
      <PageHeading title="Templates" subtitle="Create and manage reusable onboarding templates" />

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-90">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates"
              className="border border-solid border-[#E5E7EB] focus:border-primary focus:outline-none h-11 w-full rounded-[15px] pl-10 pr-2.5 bg-white"
            />
          </div>

          <FilterDropdown value={filter} options={FILTERS} onChange={setFilter} allLabel="Active" />
        </div>

        <Button variant="action" onClick={() => setFormTemplateId(null)}>
          <Plus size={18} />
          New Template
        </Button>
      </div>

      {!loading && loadError && <div className="text-center text-red-600 py-12">{loadError}</div>}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setFormTemplateId(template.id)}
              className="border border-border rounded-2xl p-4 flex flex-col gap-3 hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <IconBadge className="rounded-md p-2 w-9 h-9">
                  <FileText className="text-[#0891B2]" size={20} />
                </IconBadge>
                {template.isArchived && <Badge>Archived</Badge>}
              </div>
              <div>
                <div className="text-[16px] font-medium">{template.name}</div>
                <div className="text-[14px] text-[#64748B] mt-1">{template.taskCount} tasks</div>
              </div>
              <div className="text-[12px] text-[#94A3B8]">{formatUpdatedAt(template.updatedAt)}</div>

              <div className="flex items-center gap-2 pt-3 mt-auto border-t border-[#E5E7EB]" onClick={(e) => e.stopPropagation()}>
                <IconButton aria-label="Edit template" onClick={() => setFormTemplateId(template.id)}>
                  <Pencil size={15} />
                </IconButton>
                <IconButton aria-label="Duplicate template" onClick={() => handleClone(template.id)}>
                  <Copy size={15} />
                </IconButton>
                <IconButton aria-label={template.isArchived ? "Unarchive template" : "Archive template"} onClick={() => handleToggleArchive(template)}>
                  {template.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                </IconButton>
                {isAdmin && (
                  <IconButton variant="danger" aria-label="Delete template" onClick={() => setConfirmDeleteId(template.id)}>
                    <Trash2 size={15} />
                  </IconButton>
                )}
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center text-[#64748B] py-12">
              {search ? `No templates match "${search}".` : "No templates yet."}
            </div>
          )}
        </div>
      )}

      {formTemplateId !== undefined && (
        <TemplateFormModal
          templateId={formTemplateId}
          onClose={() => setFormTemplateId(undefined)}
          onSaved={handleSaved}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this template?"
          message="This can't be undone. Onboardings already launched from it won't be affected."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};
