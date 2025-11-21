import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { Search, Download } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/* ============  đổi giờ ISO sang VN ===================== */
function toVietnamTime(iso: string) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "N/A";
  return format(d, "HH:mm:ss dd/MM/yyyy", { locale: vi });
}

/* đổi giờ hiện tại sang ISO ================ */
function VNLocalToISO(input: string) {
  if (!input) return "";
  return new Date(input).toISOString();
}


/* ====================Tạo name file======================== */
function generateDefaultFileName() {
  const now = new Date();
  const p = (x: number) => (x < 10 ? "0" + x : x);

  return `dataset_${now.getFullYear()}${p(now.getMonth() + 1)}${p(
    now.getDate()
  )}_${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}.csv`;
}

/* ===========================Export CSV========================== */
function exportCSV(dataset: any, fileName?: string) {
  if (!dataset) return;

  let rows: any[] = [];

  if (dataset.data) rows.push(...dataset.data);
  if (dataset.sensors)
    Object.values(dataset.sensors).forEach((arr: any) => rows.push(...arr));
  if (dataset.devices)
    Object.values(dataset.devices).forEach((arr: any) => rows.push(...arr));

  if (rows.length === 0) return;
  const header = "timestamp,device_id,sensor,value\n";
  const csvRows = rows
    .map(
      (r: any) => `${r.timestamp},${r.device_id},${r.sensor},${r.value}`
    )
    .join("\n");

  const blob = new Blob([header + csvRows], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  a.download = fileName || generateDefaultFileName();
  a.click();

  URL.revokeObjectURL(url);
}

export function DataQuery() {
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.id;

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("all");

  const [dateFromVN, setDateFromVN] = useState("");
  const [dateToVN, setDateToVN] = useState("");

  const [dataset, setDataset] = useState<any>(null);
  const [page, setPage] = useState(1);
const [perPage, setPerPage] = useState(10); // số dòng mỗi trang
const [rows, setRows] = useState<any[]>([]); // dữ liệu phẳng để phân trang

  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);

  /* ============================Load thiết bị từ DB================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/devices")
      .then((res) => res.json())
      .then((data) => setDevices(data.devices || []));
  }, []);

  /* ===================== Load lịch sử export======================== */
async function loadHistory() {
  if (!CURRENT_USER_ID) return;

  setIsHistoryLoading(true);
  const res = await fetch(`http://localhost:5000/api/export_filters/${CURRENT_USER_ID}`);
  const json = await res.json();

  setHistory(json || []);
  setIsHistoryLoading(false);
}

  useEffect(() => {
    loadHistory();
  }, [CURRENT_USER_ID]);
  
  /* =====Lọc dataset================== */
  async function handleQuery() {
    setIsLoading(true);
    const params = new URLSearchParams();

    if (selectedDevice !== "all") params.append("device_id", selectedDevice);
    if (selectedMetric !== "all") params.append("sensor", selectedMetric);
    if (dateFromVN) params.append("start", VNLocalToISO(dateFromVN));
    if (dateToVN) params.append("end", VNLocalToISO(dateToVN));

    const res = await fetch(
      `http://localhost:5000/api/dataset?${params.toString()}`
    );
    const json = await res.json();

    setDataset(json);
    let flat: any[] = [];

if (json.data) flat.push(...json.data);
if (json.sensors)
  Object.values(json.sensors).forEach((arr: any) => flat.push(...arr));
if (json.devices)
  Object.values(json.devices).forEach((arr: any) => flat.push(...arr));

setRows(flat);
setPage(1); // reset về trang 1

    setIsLoading(false);
  }

  /* ======= Lưu kq lọc vào DB============================= */
  async function saveFilter(filter: any, fileName: string) {
    if (!CURRENT_USER_ID) return;

    await fetch("http://localhost:5000/api/export_filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: CURRENT_USER_ID,
        filter_name: fileName,
        filter_json: filter,
      }),
    });

    loadHistory();
  }
  
  /* =========Xem lại dataset từ lịch sử DB================ */
async function handleViewDataset(id: number) {
  const res = await fetch(
    `http://localhost:5000/api/export_filters/${id}/dataset`
  );

  const json = await res.json();

  setDataset(json);
  let flat: any[] = [];

if (json.data) flat.push(...json.data);
if (json.sensors)
  Object.values(json.sensors).forEach((arr: any) => flat.push(...arr));
if (json.devices)
  Object.values(json.devices).forEach((arr: any) => flat.push(...arr));

setRows(flat);
setPage(1); // reset về trang 1

  setCurrentHistoryId(id); // Lưu ID đang xem
}


  /* =========Tải lại dataset từ lịch sử DB================ */
  function handleDownloadHistory(id: number) {
    window.open(
      `http://localhost:5000/api/export_filters/${id}/export_csv`
    );
  }
  /* =========Xóa dataset từ lịch sử DB================ */
async function handleDeleteHistory(id: number) {
  const confirmDelete = window.confirm("Bạn có chắc muốn xóa lịch sử này?");
  if (!confirmDelete) return;

  await fetch(`http://localhost:5000/api/export_filters/${id}`, {
    method: "DELETE"
  });
  if (currentHistoryId === id) {  // load lại bảng nên bị xóa

    setCurrentHistoryId(null);
  }

  loadHistory(); // load lại db lịch sử
}
const totalPages = Math.ceil(rows.length / perPage);
const startIndex = (page - 1) * perPage;
const currentData = rows.slice(startIndex, startIndex + perPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc Dataset</CardTitle>
          <CardDescription>Lọc theo thời gian, sensor, thiết bị</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Từ thời gian</Label>
              <Input
                type="datetime-local"
                value={dateFromVN}
                onChange={(e) => setDateFromVN(e.target.value)}
              />
            </div>

            <div>
              <Label>Đến thời gian</Label>
              <Input
                type="datetime-local"
                value={dateToVN}
                onChange={(e) => setDateToVN(e.target.value)}
              />
            </div>

            <div>
              <Label>Thiết bị</Label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="all">Tất cả</option>
                {devices.map((d: any) => (
                  <option value={d.device_id} key={d.device_id}>
                    {d.device_id} — {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Sensor</Label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="all">Tất cả</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="co2">CO₂</option>
                <option value="light">Light</option>
                <option value="battery">Battery</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleQuery} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Đang lọc..." : "Lọc dữ liệu"}
            </Button>
            <Button
              variant="outline"
              disabled={!dataset}
              onClick={() => {
                if (!dataset) return;

                let fileName = prompt("Nhập tên file CSV (bỏ trống để dùng tên mặc định):");

if (fileName) {
  const vietnameseRegex = /[áàảãạăắằẳẵặâấầẩẫậóòỏõọôốồổỗộơớờởỡợéèẻẽẹêếềểễệíìỉĩịúùủũụưứừửữựýỳỷỹỵđ]/i; // Chặn tên file có dấu tiếng Việt

  if (vietnameseRegex.test(fileName)) {
    alert("Không được dùng dấu tiếng Việt trong tên file! Vui lòng đặt tên không dấu.");
    return;
  }

  if (!fileName.endsWith(".csv")) {
    fileName += ".csv";
  }
}

const finalName = fileName || generateDefaultFileName();


                exportCSV(dataset, finalName);

                const filter = {
                  device_id: selectedDevice,
                  sensor: selectedMetric,
                  start: dateFromVN || "all",
                  end: dateToVN || "all",
                };

                saveFilter(filter, finalName);
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV 
            </Button>
          </div>
        </CardContent>
      </Card>
      {dataset && (
        <Card>
          
          <CardHeader>
            <CardTitle>Kết quả Dataset</CardTitle>
            <CardDescription>
              Tổng: <b>{dataset.total}</b> bản ghi
            </CardDescription>
                        <div className="flex items-center gap-2 mb-2">
  <span>Hiển thị:</span>
  <select
    value={perPage}
    onChange={(e) => {
      setPerPage(Number(e.target.value));
      setPage(1);
    }}
    className="border rounded px-2 py-1"
  >
    <option value={5}>5 dòng</option>
    <option value={10}>10 dòng</option>
    <option value={20}>20 dòng</option>
    <option value={50}>50 dòng</option>
  </select>
</div>

          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Sensor</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(() => {
                  let rows: any[] = [];

                  if (dataset.data) rows.push(...dataset.data);
                  if (dataset.sensors)
                    Object.values(dataset.sensors).forEach((arr: any) =>
                      rows.push(...arr)
                    );
                  if (dataset.devices)
                    Object.values(dataset.devices).forEach((arr: any) =>
                      rows.push(...arr)
                    );

                  if (rows.length === 0)
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500 py-4"
                        >
                          Không có dữ liệu.
                        </TableCell>
                      </TableRow>
                    );

                  return currentData.map((row: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{toVietnamTime(row.timestamp)}</TableCell>
                      <TableCell>{row.device_id}</TableCell>
                      <TableCell>{row.sensor}</TableCell>
                      <TableCell>{row.value}</TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>

            {/* ===== PAGINATION ===== */}
<div className="flex items-center justify-between text-sm text-slate-700 mt-4">

  {/* Info */}
  <span>
    Trang {page} / {totalPages} — Hiển thị {startIndex + 1}–
    {Math.min(startIndex + perPage, rows.length)} / {rows.length} bản ghi
  </span>

  {/* Pagination buttons */}
  <div className="flex items-center space-x-1">

    {/* Prev */}
    <button
      onClick={() => setPage(page - 1)}
      disabled={page === 1}
      className={`px-3 py-1 rounded-md border ${
        page === 1
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-white hover:bg-slate-50"
      }`}
    >
      «
    </button>

    {/* Page numbers (short style) */}
    {(() => {
      const arr = [];
      const maxButtons = 5;

      if (totalPages <= maxButtons) {
        for (let i = 1; i <= totalPages; i++) arr.push(i);
      } else {
        arr.push(1);

        if (page > 3) arr.push("...");

        const middle = [page - 1, page, page + 1].filter(
          (p) => p > 1 && p < totalPages
        );
        arr.push(...middle);

        if (page < totalPages - 2) arr.push("...");

        arr.push(totalPages);
      }

      return arr.map((num, i) =>
        num === "..." ? (
          <span key={i} className="px-2 text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={i}
            onClick={() => setPage(num as number)}
            className={`px-3 py-1 rounded-md border ${
              num === page
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-blue-50"
            }`}
          >
            {num}
          </button>
        )
      );
    })()}

    {/* Next */}
    <button
      onClick={() => setPage(page + 1)}
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

          </CardContent>
        </Card>
      )}

<Card>
  <CardHeader>
    <CardTitle>Lịch sử tải xuống</CardTitle>
  </CardHeader>

  <CardContent>
    {history.length === 0 && <p>Chưa có lịch sử</p>}

    {history.length > 0 && (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className="w-1/3">Tên file</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {history.map((item, idx) => (
            <TableRow key={item.id}>
              <TableCell className="text-center font-medium">
                {idx + 1}
              </TableCell>

              <TableCell className="font-medium">{item.filter_name}</TableCell>

              {/* Action Buttons */}
              <TableCell>
                <div className="flex items-center gap-2 justify-center">

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDataset(item.id)}
                    className="px-3"
                  >
                    Xem dataset
                  </Button>

                  <Button
                    size="sm"
                    className="px-3 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handleDownloadHistory(item.id)}
                  >
                    Tải CSV
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="px-3"
                    onClick={() => handleDeleteHistory(item.id)}
                  >
                    Xóa
                  </Button>

                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </CardContent>
</Card>

    </div>
  );
}
