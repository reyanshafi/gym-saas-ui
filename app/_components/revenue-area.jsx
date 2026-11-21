import { useId } from "react";

function smoothPath(points) {
  return points.reduce((path, [x, y], index) => {
    if (!index) return `M ${x} ${y}`;
    const [previousX, previousY] = points[index - 1];
    const mid = (previousX + x) / 2;
    return `${path} C ${mid} ${previousY}, ${mid} ${y}, ${x} ${y}`;
  }, "");
}

export default function RevenueArea({ values, previous, low, span }) {
  const fillId = useId();
  const width = 600;
  const height = 180;
  const plot = (items) =>
    items.map((value, index) => [
      ((index + 0.5) / items.length) * width,
      height - ((value - low) / span) * height,
    ]);
  const points = plot(values);
  const path = smoothPath(points);
  const zero = height - ((0 - low) / span) * height;
  const start = points[0][0];
  const end = points.at(-1)[0];

  return (
    <svg
      className="gym-revenue-area"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity=".025" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${end} ${zero} L ${start} ${zero} Z`}
        fill={`url(#${fillId})`}
      />
      {previous && (
        <path className="gym-revenue-previous" d={smoothPath(plot(previous))} />
      )}
      <path className="gym-revenue-line" d={path} />
    </svg>
  );
}
