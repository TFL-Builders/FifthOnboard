import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link as LinkIcon, Check, Paperclip, MessageSquare } from "lucide-react";
import { Avatar } from "../../Components/Avatar";
import { ProgressBar } from "../../Components/ProgressBar";
import { Button } from "../../Components/Button";
import { ErrorBanner } from "../../Components/ErrorBanner";
import {
  getHireProfile,
  updateHireTask,
  getHireTaskComments,
  postHireTaskComment,
  getUploadSignature,
  uploadToCloudinary,
} from "../../lib/hirePortalApi";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { PHASE_LABELS, phaseValueToLabel } from "../../lib/templateEnums";
import Logo from "../../assets/Fifthlab.png";
import { CancelledOnboarding } from "../app/CancelledOnboarding.jsx";

// The API fixes this list server-side regardless of what's picked here —
// matching it in the file picker just avoids a round-trip for an obviously
// wrong file type.
const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.png,.docx";

const UploadTask = ({ token, task, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const signature = await getUploadSignature(token, task.id);

      if (file.size > signature.max_file_size) {
        throw new Error(`That file is too large — max ${Math.round(signature.max_file_size / (1024 * 1024))}MB.`);
      }

      const uploaded = await uploadToCloudinary(signature, file);
      await updateHireTask(token, task.id, {
        status: "done",
        attachment: {
          url: uploaded.secure_url,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        },
      });
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : getErrorMessage(err).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pl-7 mt-2 flex flex-col gap-2">
      <ErrorBanner message={error} />
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-[12px] text-[#64748B]"
        />
        <Button
          variant="secondary"
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-3 py-1.5 text-[12px]"
        >
          {uploading ? "Uploading..." : "Upload & Complete"}
        </Button>
      </div>
    </div>
  );
};

// The server gives specific, accurate copy for each failure case (unknown
// token vs. cancelled onboarding vs. expired link) — shown verbatim rather
// than replaced with one generic message.
const InvalidLink = ({ message }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="max-w-sm w-full text-center flex flex-col items-center gap-3">
      <div className="bg-[#FEF2F2] rounded-full w-14 h-14 flex items-center justify-center">
        <LinkIcon className="text-red-500" size={24} />
      </div>
      <div className="text-[20px] font-bold">This link isn&apos;t valid</div>
      <div className="text-[14px] text-[#64748B]">
        {message || "This onboarding link is invalid or has expired. Please reach out to whoever sent it to you for a new one."}
      </div>
    </div>
  </div>
);

const TaskComments = ({ token, taskId }) => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const loadComments = () => {
    setLoading(true);
    getHireTaskComments(token, taskId)
      .then(setComments)
      .catch((err) => setError(getErrorMessage(err).message))
      .finally(() => setLoading(false));
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) loadComments();
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setError("");
    try {
      const created = await postHireTaskComment(token, taskId, body.trim());
      setComments((prev) => [...prev, created]);
      setBody("");
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="pl-7 mt-1">
      <button
        type="button"
        onClick={toggleOpen}
        className="text-[12px] text-primary hover:brightness-150 transition-colors flex items-center gap-1"
      >
        <MessageSquare size={12} />
        Comments
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2 max-w-md">
          <ErrorBanner message={error} />
          {!loading &&
            comments.map((c) => (
              <div key={c.id} className="text-[13px] bg-background rounded-lg p-2">
                <div className="font-medium">{c.author}</div>
                <div className="text-[#64748B]">{c.body}</div>
              </div>
            ))}
          {!loading && comments.length === 0 && <div className="text-[12px] text-[#94A3B8]">No comments yet.</div>}

          <form onSubmit={handlePost} className="flex gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-[#E5E7EB] hover:border-primary focus:border-primary focus:outline-none rounded-lg px-2.5 h-9 text-[13px] bg-white"
            />
            <Button variant="secondary" type="submit" disabled={posting || !body.trim()} className="px-3 h-9 text-[13px]">
              {posting ? "..." : "Post"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export const HirePortal = () => {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getHireProfile(token)
      .then(setProfile)
      .catch((err) => setError(getErrorMessage(err).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading indicator for a real fetch, not derivable state
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleToggleTask = async (task) => {
    if (task.requiresUpload) return; // these complete via the upload flow below, not a plain toggle
    const nextStatus = task.status === "done" ? "pending" : "done";
    try {
      await updateHireTask(token, task.id, { status: nextStatus });
      load();
    } catch (err) {
      setError(getErrorMessage(err).message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (error) {
    return <InvalidLink message={error} />;
  }

  const doneCount = profile.tasks.filter((t) => t.status === "done").length;
  const tasksByPhase = PHASE_LABELS.map((label) => ({
    phase: label,
    tasks: profile.tasks.filter((t) => phaseValueToLabel(t.phase) === label),
  })).filter((group) => group.tasks.length > 0);

  if(profile.status === 'cancelled'){
    return(
      <CancelledOnboarding />
    )
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <img src={Logo} alt="Fifthlabs Logo" className="h-7 w-auto self-start" />

        <div>
          <div className="text-[30px] font-bold">Welcome to {profile.organizationName}, {profile.newHireName}!</div>
          <div className="text-[16px] text-[#64748B] mt-1">
            {profile.job || "New hire"} · Starting {profile.startDate ? new Date(profile.startDate).toLocaleDateString() : "soon"}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
          <Avatar name={profile.manager || "?"} size={40} />
          <div className="min-w-0">
            <div className="text-[12px] text-[#64748B]">Your onboarding contact</div>
            <div className={`text-[14px] font-medium ${!profile.manager ? "text-[#B45309]" : ""}`}>
              {profile.manager || "Unassigned"}
            </div>
            {profile.managerEmail && (
              <a href={`mailto:${profile.managerEmail}`} className="text-[12px] text-primary hover:brightness-150 transition-colors">
                {profile.managerEmail}
              </a>
            )}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="text-[14px] font-medium mb-2">
            {doneCount} of {profile.tasks.length} tasks complete
          </div>
          <ProgressBar value={profile.newHireProgressPercent} />
        </div>

        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col gap-5">
          {tasksByPhase.map(({ phase, tasks }) => (
            <div key={phase} className="flex flex-col gap-1">
              <div className="text-[12px] uppercase tracking-wide text-[#64748B] font-semibold mb-1">{phase}</div>
              {tasks.map((task) => {
                const done = task.status === "done";
                return (
                  <div key={task.id} className="flex flex-col">
                    <div
                      role={task.requiresUpload ? undefined : "button"}
                      tabIndex={task.requiresUpload ? undefined : 0}
                      onClick={task.requiresUpload ? undefined : () => handleToggleTask(task)}
                      onKeyDown={
                        task.requiresUpload
                          ? undefined
                          : (e) => {
                              if (e.key === "Enter" || e.key === " ") handleToggleTask(task);
                            }
                      }
                      className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                        task.requiresUpload ? "" : "cursor-pointer hover:bg-background"
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                          done ? "bg-primary border-primary" : "border-[#E5E7EB]"
                        }`}
                      >
                        {done && <Check className="text-white" size={12} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[14px] ${done ? "text-[#94A3B8] line-through" : ""}`}>{task.title}</div>
                        {task.description && <div className="text-[12px] text-[#64748B] mt-0.5">{task.description}</div>}
                        {task.requiresUpload && done && task.attachments?.[0] && (
                          <a
                            href={task.attachments[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] text-primary hover:brightness-150 transition-colors flex items-center gap-1 mt-0.5"
                          >
                            <Paperclip size={11} />
                            {task.attachments[0].fileName}
                          </a>
                        )}
                      </div>
                    </div>
                    {task.requiresUpload && !done && <UploadTask token={token} task={task} onUploaded={load} />}
                    <TaskComments token={token} taskId={task.id} />
                  </div>
                );
              })}
            </div>
          ))}

          {profile.tasks.length === 0 && <div className="text-[14px] text-[#94A3B8] text-center py-4">No tasks yet.</div>}
        </div>

        <div className="text-[12px] text-[#94A3B8] text-center">
          This link is unique to you — please don&apos;t share it with anyone else.
        </div>
      </div>
    </div>
  );
};
