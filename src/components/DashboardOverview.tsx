import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, Database, HardDrive, TrendingUp, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import { fetchFiles, fetchMerged } from "../api";

export function DashboardOverview() {
  const [files, setFiles] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [devices, setDevices] = useState<string[]>([]);
  const [device, setDevice] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [loading, setLoading] = useState(false);
  const [manualReloadEffect, setManualReloadEffect] = useState(false); // 🌟 hiệu ứng một lần
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy danh sách file và dữ liệu ban đầu
 useEffect(() => {
  fetchFiles().then((res) => setFiles(res.data.files || []));
  loadAllDevices(); // lấy danh sách thiết bị ban đầu
  loadData();       // tải dữ liệu
}, []);

// 🔹 Hàm chỉ lấy danh sách tất cả thiết bị (1 lần)
const loadAllDevices = async () => {
  try {
    const res = await fetchMerged(); // không truyền params => lấy all thiết bị
    const allData = res.data.dataset || [];
    const uniqueDevices = [...new Set(allData.map((d: any) => d.device))];
    setDevices(uniqueDevices);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách thiết bị:", err);
  }
};

  const loadData = async () => {
    try {
      const params: Record<string, string> = {};
      if (device) params.device = device;
      const res = await fetchMerged(params);
      const data = res.data.dataset || [];
      setDataset(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Hàm gọi lại dữ liệu định kỳ (không hiệu ứng)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      loadData(); // auto refresh không có animation
    }, refreshInterval * 1000);
    return () => clearInterval(intervalRef.current!);
  }, [device, refreshInterval]);

  // Hàm bấm thủ công có hiệu ứng
  const handleManualReload = async () => {
    setLoading(true);
    setManualReloadEffect(true); // bật hiệu ứng fade biểu đồ
    await loadData();
    setTimeout(() => {
      setManualReloadEffect(false); // tắt hiệu ứng sau 1 giây
      setLoading(false);
    }, 1000);
  };

  // Chuẩn hóa dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    return dataset.map((r: any) => ({
      ...r,
      ts: r.timestamp ? dayjs(r.timestamp).format("HH:mm:ss") : "",
      temperature: r.temperature ? Number(r.temperature) : undefined,
      humidity: r.humidity ? Number(r.humidity) : undefined,
      co2: r.co2 ? Number(r.co2) : undefined,
    }));
  }, [dataset]);

  const avgTemp =
    dataset.length > 0
      ? (
          dataset.reduce(
            (sum: number, d: any) => sum + (Number(d.temperature) || 0),
            0
          ) / dataset.length
        ).toFixed(2)
      : "--";
  const avgHum =
    dataset.length > 0
      ? (
          dataset.reduce(
            (sum: number, d: any) => sum + (Number(d.humidity) || 0),
            0
          ) / dataset.length
        ).toFixed(2)
      : "--";

  return (
    <div className="space-y-6 transition-all duration-300">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Tổng file trong MinIO</p>
                <p className="text-xl font-bold text-slate-900">{files.length}</p>
                <p className="text-xs text-slate-500">Dữ liệu cảm biến đang lưu</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Tổng bản ghi</p>
                <p className="text-xl font-bold text-slate-900">{dataset.length}</p>
                <p className="text-xs text-slate-500">Records từ API merged</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Avg Temperature</p>
                <p className="text-xl font-bold text-slate-900">{avgTemp} °C</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Avg Humidity</p>
                <p className="text-xl font-bold text-slate-900">{avgHum} %</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc đơn giản */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc dữ liệu</CardTitle>
          <CardDescription>Lọc theo thiết bị và thời gian làm mới</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <select
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Tất cả thiết bị</option>
            {devices.map((dev) => (
              <option key={dev} value={dev}>
                {dev}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            Refresh mỗi
            <input
              type="number"
              min="0"
              className="border rounded-md px-2 py-1 w-16 text-center"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            />
            giây
          </label>

          <button
            onClick={handleManualReload}
            disabled={loading}
            className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 ${
              loading ? "opacity-70 cursor-not-allowed scale-95" : "active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Tải lại
              </>
            )}
          </button>
        </CardContent>
      </Card>

      {/* Biểu đồ dữ liệu thực với hiệu ứng fade */}
      <Card
        className={`transition-all duration-700 ${
          manualReloadEffect ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"
        }`}
      >
        <CardHeader>
          <CardTitle>Biểu đồ dữ liệu cảm biến</CardTitle>
          <CardDescription>
            Biểu đồ theo thời gian (Temperature / Humidity / CO₂)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#f97316" dot={false} name="Temperature (°C)" />
              <Line type="monotone" dataKey="humidity" stroke="#10b981" dot={false} name="Humidity (%)" />
              <Line type="monotone" dataKey="co2" stroke="#3b82f6" dot={false} name="CO₂ (ppm)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Xem trước JSON */}
{/* Bảng dữ liệu mẫu */}
{/* Bảng dữ liệu mẫu có phân trang */}
<Card>
  <CardHeader>
    <CardTitle>Dữ liệu cảm biến chi tiết</CardTitle>
    <CardDescription>
      Toàn bộ bản ghi của thiết bị đã chọn (10 dòng mỗi trang)
    </CardDescription>
  </CardHeader>

  <CardContent>
    {dataset.length === 0 ? (
      <p className="text-sm text-slate-500 italic">
        Không có dữ liệu cho thiết bị này.
      </p>
    ) : (
      <PaginatedTable dataset={dataset} />
    )}
  </CardContent>
</Card>



    </div>
  );
}
// 🌟 Component bảng có phân trang + chọn trang
function PaginatedTable({ dataset }: { dataset: any[] }) {
  const [page, setPage] = React.useState(1);
  const perPage = 10;

  const totalPages = Math.ceil(dataset.length / perPage);
  const startIndex = (page - 1) * perPage;
  const currentData = dataset.slice(startIndex, startIndex + perPage);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleGoToPage = (num: number) => setPage(num);

  // Tạo dải số trang hiển thị (ví dụ 1 ... 4 5 [6] 7 8 ... 20)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift("...");
    if (page + delta < totalPages - 1) range.push("...");
    if (!range.includes(1)) range.unshift(1);
    if (!range.includes(totalPages)) range.push(totalPages);
    return range;
  };

  return (
    <div className="space-y-4">
      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-100 text-slate-800">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Thời gian</th>
              <th className="px-4 py-2 text-left">Thiết bị</th>
              <th className="px-4 py-2 text-left">Nhiệt độ (°C)</th>
              <th className="px-4 py-2 text-left">Độ ẩm (%)</th>
              <th className="px-4 py-2 text-left">CO₂ (ppm)</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item: any, idx: number) => (
              <tr
                key={startIndex + idx}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                } border-t border-slate-100`}
              >
                <td className="px-4 py-2">{startIndex + idx + 1}</td>
                <td className="px-4 py-2">
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleString("vi-VN")
                    : "-"}
                </td>
                <td className="px-4 py-2">{item.device || "-"}</td>
                <td className="px-4 py-2 text-orange-600">
                  {typeof item.temperature === "number"
                    ? item.temperature.toFixed(2)
                    : item.temperature
                    ? String(item.temperature)
                    : "-"}
                </td>
                <td className="px-4 py-2 text-green-600">
                  {typeof item.humidity === "number"
                    ? item.humidity.toFixed(2)
                    : item.humidity
                    ? String(item.humidity)
                    : "-"}
                </td>
                <td className="px-4 py-2 text-blue-600">
                  {typeof item.co2 === "number"
                    ? item.co2.toFixed(2)
                    : item.co2
                    ? String(item.co2)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Điều hướng phân trang */}
      <div className="flex items-center justify-between text-sm text-slate-700 flex-wrap gap-2">
        <span>
          Trang {page} / {totalPages} — Hiển thị {startIndex + 1}–
          {Math.min(startIndex + perPage, dataset.length)} / {dataset.length} bản ghi
        </span>

        <div className="flex items-center space-x-1">
          {/* Nút Trước */}
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-3 py-1 rounded-md border ${
              page === 1
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-white hover:bg-slate-50"
            }`}
          >
            «
          </button>

          {/* Các số trang */}
          {getPageNumbers().map((num, i) =>
            num === "..." ? (
              <span key={i} className="px-2 text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={i}
                onClick={() => handleGoToPage(num as number)}
                className={`px-3 py-1 rounded-md border ${
                  num === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-blue-50"
                }`}
              >
                {num}
              </button>
            )
          )}

          {/* Nút Sau */}
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-md border ${
              page === totalPages
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-white hover:bg-slate-50"
            }`}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
