function DashboardPage() {
  return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">
          Dashboard
        </h1>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-gray-500">Tổng phòng</p>
            <h2 className="text-3xl font-bold">20</h2>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-gray-500">Phòng trống</p>
            <h2 className="text-3xl font-bold">5</h2>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-gray-500">Người thuê</p>
            <h2 className="text-3xl font-bold">28</h2>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-gray-500">Hợp đồng</p>
            <h2 className="text-3xl font-bold">15</h2>
          </div>
        </div>
      </div>
  );
}

export default DashboardPage;