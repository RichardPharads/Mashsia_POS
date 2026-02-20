export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4 w-[500
    px] rounded-lg">
      {/* Title */}
      <div className="h-6 w-1/3 bg-gray-300 rounded"></div>

      {/* Paragraph lines */}
      <div className="h-4 w-full bg-gray-300 rounded"></div>
      <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
      <div className="h-4 w-2/3 bg-gray-300 rounded"></div>

      {/* Card */}
      <div className="h-40 w-full bg-gray-300 rounded-xl"></div>
    </div>
  );
}
