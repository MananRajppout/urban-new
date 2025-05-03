export default function Skeleton({ width, height, radius, className }) {
  return (
    <div
      style={{ width, height, borderRadius: radius }}
      className={"skeleton " + className}
    ></div>
  );
}
