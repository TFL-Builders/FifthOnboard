export const ErrorBanner = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 text-left">
      {message}
    </div>
  );
};
