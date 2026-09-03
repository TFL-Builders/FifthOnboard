// Wraps /api/v1/hire/:token/... — the new hire never logs in, so unlike
// every other API module in this app, none of these calls go through
// useAuthedApi()/the Bearer token. The opaque token IS the credential, and it
// lives in the URL path itself, so we just call the shared `api` client
// directly with no Authorization header.
import { api } from "./apiClient";

export const getHireProfile = (token) => api.get(`/hire/${token}`).then((res) => res.data);

export const updateHireTask = (token, taskId, patch) =>
  api.patch(`/hire/${token}/tasks/${taskId}`, patch).then((res) => res.data);

export const getHireTaskComments = (token, taskId) =>
  api.get(`/hire/${token}/tasks/${taskId}/comments`).then((res) => res.data);

export const postHireTaskComment = (token, taskId, body) =>
  api.post(`/hire/${token}/tasks/${taskId}/comments`, { body }).then((res) => res.data);

export const getUploadSignature = (token, taskId) =>
  api.post(`/hire/${token}/${taskId}/uploads/sign`).then((res) => res.data);

// Confirmed with the team: the deployed CLOUDINARY_UPLOAD_PRESET is
// "fifthonboard" — used only as a fallback if a given deploy's sign response
// doesn't include upload_preset for some reason, so uploads don't hard-fail
// on that alone.
const FALLBACK_UPLOAD_PRESET = "fifthonboard";

// Goes straight to Cloudinary, not our own API — the signature from
// getUploadSignature() is exactly what Cloudinary needs to accept this
// upload without the client ever holding a real API secret.
export const uploadToCloudinary = async (signature, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.cloudinary_api_key);
  formData.append("timestamp", signature.timestamp);
  formData.append("signature", signature.sign);
  formData.append("folder", signature.folder);
  formData.append("allowed_formats", signature.allowed_formats);
  formData.append("upload_preset", signature.upload_preset ?? FALLBACK_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloud_name}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(payload?.error?.message ?? "Upload failed. Please try a different file.");
  }

  return payload;
};
