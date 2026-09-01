const COLORS = [
  { bg: "#ECFEFF", text: "#0891B2" },
  { bg: "#FDF2F8", text: "#BE185D" },
  { bg: "#F0F9FF", text: "#0369A1" },
  { bg: "#FEF3C7", text: "#B45309" },
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#ECFDF5", text: "#059669" },
];

const colorFor = (name) => {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const initialsFor = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export const Avatar = ({ name, size = 36, className = "" }) => {
  const { bg, text } = colorFor(name);

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, color: text, fontSize: size * 0.4 }}
    >
      {initialsFor(name)}
    </div>
  );
};
