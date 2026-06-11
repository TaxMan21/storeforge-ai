export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full py-20">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500 mt-4 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}
