import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "./Button";
import { ErrorBanner } from "./ErrorBanner";
import { useAuthedApi } from "../hooks/useAuthedApi";
import { getTaskComments, addTaskComment } from "../lib/onboardingsApi";
import { getErrorMessage } from "../lib/getErrorMessage";

export const TaskComments = ({ taskId }) => {
  const authedApi = useAuthedApi();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const loadComments = () => {
    setLoading(true);
    getTaskComments(authedApi, taskId)
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
      const created = await addTaskComment(authedApi, taskId, body.trim());
      setComments((prev) => [...prev, created]);
      setBody("");
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={toggleOpen}
        className="text-[12px] text-primary hover:brightness-150 transition-colors flex items-center gap-1"
      >
        <MessageSquare size={12} />
        Comments
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <ErrorBanner message={error} />
          {!loading &&
            comments.map((c) => (
              <div key={c.id} className="text-[13px] bg-background rounded-lg p-2">
                <div className="font-medium">{c.author}</div>
                <div className="text-[#64748B]">{c.body}</div>
              </div>
            ))}
          {loading && <div className="text-[12px] text-[#94A3B8]">Loading...</div>}
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
