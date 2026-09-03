
export const MediaDisplay = ({
  src,
  poster,
  alt = "Animated media",
  className = "w-full h-full rounded-lg object-cover text-[#64748B]",
}) => {
  return (
        <video
        key={src} // Forces the player to re-mount/reset when the URL changes
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        aria-label={alt}
        className={className}
        >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
        </video>
  );
};