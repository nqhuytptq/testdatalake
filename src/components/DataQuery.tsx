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
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// ===============================
// FORMAT Timestamp MinIO → VN
// ===============================
function toVietnamTime(iso: string) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "N/A";
  return format(d, "HH:mm:ss dd/MM/yyyy", { locale: vi });
}

// ===============================
// Convert input datetime-local → ISO UTC
// ===============================
// datetime-local trả về dạng: "2025-11-19T08:30"
// Đây đã là giờ Việt Nam (UTC+7)
function VNLocalToISO(input: string) {
  if (!input) return "";

  const local = new Date(input); // Đây là date theo VN
  const offset = local.getTimezoneOffset(); // VN = -420 phút

  // Chuyển sang giờ UTC chuẩn để gửi API
  return new Date(local.getTime() - offset * 60000).toISOString();
}

export function DataQuery() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("all");

  const [dateFromVN, setDateFromVN] = useState<string>("");
  const [dateToVN, setDateToVN] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [dataset, setDataset] = useState<any>(null);

  // ================== LOAD THIẾT BỊ ==================
  useEffect(() => {
    fetch("http://localhost:5000/api/devices")
      .then((res) => res.json())
      .then((data) => setDevices(data.devices || []));
  }, []);

  // ================== TRUY VẤN DATASET ==================
  const handleQuery = async () => {
    setIsLoading(true);

    const params = new URLSearchParams();

    if (selectedDevice !== "all") params.append("device_id", selectedDevice);
    if (selectedMetric !== "all") params.append("sensor", selectedMetric);

    if (dateFromVN) params.append("start", VNLocalToISO(dateFromVN));
    if (dateToVN) params.append("end", VNLocalToISO(dateToVN));

    const url = `http://localhost:5000/api/dataset?${params}`;

    const res = await fetch(url);
    const json = await res.json();

    setDataset(json);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* ================== FORM LỌC ================== */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc Dataset</CardTitle>
          <CardDescription>
            Tạo dataset theo thiết bị, sensor, thời gian
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* FROM DATE */}
            <div>
              <Label>Từ thời gian</Label>
              <Input
                type="datetime-local"
                value={dateFromVN}
                onChange={(e) => setDateFromVN(e.target.value)}
                className="w-full"
              />
            </div>

            {/* TO DATE */}
            <div>
              <Label>Đến thời gian</Label>
              <Input
                type="datetime-local"
                value={dateToVN}
                onChange={(e) => setDateToVN(e.target.value)}
                className="w-full"
              />
            </div>

            {/* DEVICE FILTER */}
            <div className="flex flex-col gap-2">
              <Label>Thiết bị</Label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">Tất cả thiết bị</option>
                {devices.map((d: any) => (
                  <option key={d.device_id} value={d.device_id}>
                    {d.device_id} — {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SENSOR FILTER */}
            <div className="flex flex-col gap-2">
              <Label>Sensor</Label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">Tất cả loại dữ liệu</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="co2">CO₂</option>
                <option value="light">Light</option>
                <option value="battery">Battery</option>
              </select>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            <Button onClick={handleQuery} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Đang lọc..." : "Lọc dữ liệu"}
            </Button>

            <Button variant="outline" disabled={!dataset}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================== KẾT QUẢ ================== */}
      {dataset && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả Dataset</CardTitle>
            <CardDescription>
              Mode: <b>{dataset.mode}</b> — Tổng: {dataset.total} bản ghi
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
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
                  {dataset.data?.map((row: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{toVietnamTime(row.timestamp)}</TableCell>
                      <TableCell>{row.device_id}</TableCell>
                      <TableCell>{row.sensor}</TableCell>
                      <TableCell>{row.value}</TableCell>
                    </TableRow>
                  ))}

                  {/* Mode = device */}
                  {dataset.sensors &&
                    Object.entries(dataset.sensors).map(([sensor, arr]: any) =>
                      arr.map((row: any, idx: number) => (
                        <TableRow key={`${sensor}-${idx}`}>
                          <TableCell>{toVietnamTime(row.timestamp)}</TableCell>
                          <TableCell>{row.device_id}</TableCell>
                          <TableCell>{row.sensor}</TableCell>
                          <TableCell>{row.value}</TableCell>
                        </TableRow>
                      ))
                    )}

                  {/* Mode = sensor */}
                  {dataset.devices &&
                    Object.entries(dataset.devices).map(([device, arr]: any) =>
                      arr.map((row: any, idx: number) => (
                        <TableRow key={`${device}-${idx}`}>
                          <TableCell>{toVietnamTime(row.timestamp)}</TableCell>
                          <TableCell>{row.device_id}</TableCell>
                          <TableCell>{row.sensor}</TableCell>
                          <TableCell>{row.value}</TableCell>
                        </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
