import { FileText, Image as ImageIcon } from "lucide-react";
import { MediaDisplay } from "./MediaDisplay";
import cancelledClip from "../assets/CancelledFile.mp4";
import { formatRelativeTime } from "../lib/onboardingsApi";

const clips = [
  { id: 1, title: "Cancelled Document", src: cancelledClip },
];

const fileSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const fileTypeIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
  const Icon = isImage ? ImageIcon : FileText;
  return <Icon className="w-4 h-4 text-[#64748B]" />;
};

export const RecentUploads = ({ uploads = [], loading = false }) => (
  <div className="group flex flex-col p-6 w-[35%] bg-card border border-border rounded-xl shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">Recent Uploads</h3>
      <div className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
        {fileSVG()}
      </div>
    </div>
    <div className="flex flex-col gap-1">
      {loading ? (
        <div className="py-6 text-center text-sm text-[#64748B]">Loading...</div>
      ) : uploads.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#64748B] flex flex-col items-center justify-center">
          <div className=" w-[40%]">
            <MediaDisplay src={clips[0].src} />
          </div>
          <div>No documents uploaded recently.</div>
        </div>
      ) : (
        uploads.map((upload) => (
          <a
            key={upload.id}
            href={upload.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center py-2.5 border-b border-border last:border-0 hover:bg-background transition-colors rounded-lg px-1 -mx-1"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0">{fileTypeIcon(upload.fileName)}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-foreground truncate">{upload.fileName}</span>
                <span className="text-xs text-[#64748B] truncate">
                  {upload.newHireName} — {upload.taskTitle}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-[#64748B] shrink-0">
              {formatRelativeTime(upload.uploadedAt)}
            </span>
          </a>
        ))
      )}
    </div>
  </div>
);
