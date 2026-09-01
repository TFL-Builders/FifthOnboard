import { useState } from "react";
import { Search, Plus, FileText, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { PageHeading } from "../../Components/PageHeading";
import { IconBadge } from "../../Components/IconBadge";
import { Badge } from "../../Components/Badge";
import { Button } from "../../Components/Button";
import { IconButton } from "../../Components/IconButton";
import { FilterDropdown } from "../../Components/FilterDropdown";
import { NewTemplateModal } from "../../Components/NewTemplateModal";
import { SAMPLE_TEMPLATES } from "../../data/mockTemplates";

const CATEGORIES = ["All", ...new Set(SAMPLE_TEMPLATES.map((template) => template.category))];

export const Templates = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredTemplates = SAMPLE_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || template.category === category)
  );

  return (
    <div className="p-8 bg-background ">
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

          <FilterDropdown value={category} options={CATEGORIES} onChange={setCategory} />
        </div>

        <Button variant="action" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-border rounded-2xl p-4 flex flex-col gap-3 hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between">
              <IconBadge className="rounded-md p-2 w-9 h-9">
                <FileText className="text-[#0891B2]" size={20} />
              </IconBadge>
              <Badge>{template.category}</Badge>
            </div>
            <div>
              <div className="text-[16px] font-medium">{template.name}</div>
              <div className="text-[14px] text-[#64748B] mt-1">{template.description}</div>
            </div>
            <div className="text-[12px] text-[#94A3B8]">Updated {template.updatedAt}</div>

            <div className="flex items-center gap-2 pt-3 mt-auto border-t border-[#E5E7EB]">
              <IconButton aria-label="Edit template">
                <Pencil size={15} />
              </IconButton>
              <IconButton aria-label="Duplicate template">
                <Copy size={15} />
              </IconButton>
              <IconButton aria-label="Archive template">
                <Archive size={15} />
              </IconButton>
              <IconButton variant="danger" aria-label="Delete template">
                <Trash2 size={15} />
              </IconButton>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center text-[#64748B] py-12">
            No templates match &quot;{search}&quot;.
          </div>
        )}
      </div>

      {modalOpen && <NewTemplateModal onClose={() => setModalOpen(false)} />}
    </div>
  );
};
