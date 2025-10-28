import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search, Download, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const mockQueryResults = [
  {
    timestamp: '2025-10-16 14:30:25',
    deviceId: 'IOT-001',
    deviceName: 'Temperature Sensor #12',
    metric: 'temperature',
    value: '24.5°C',
    location: 'Warehouse A',
  },
  {
    timestamp: '2025-10-16 14:30:15',
    deviceId: 'IOT-002',
    deviceName: 'Humidity Sensor #8',
    metric: 'humidity',
    value: '65%',
    location: 'Warehouse A',
  },
  {
    timestamp: '2025-10-16 14:30:10',
    deviceId: 'IOT-003',
    deviceName: 'Motion Detector #5',
    metric: 'motion',
    value: 'Detected',
    location: 'Office Floor 2',
  },
  {
    timestamp: '2025-10-16 14:30:05',
    deviceId: 'IOT-005',
    deviceName: 'Pressure Sensor #15',
    metric: 'pressure',
    value: '1013 hPa',
    location: 'Factory Line 1',
  },
  {
    timestamp: '2025-10-16 14:30:00',
    deviceId: 'IOT-008',
    deviceName: 'Power Meter #9',
    metric: 'power',
    value: '245.8 kW',
    location: 'Building Main',
  },
  {
    timestamp: '2025-10-16 14:29:55',
    deviceId: 'IOT-001',
    deviceName: 'Temperature Sensor #12',
    metric: 'temperature',
    value: '24.3°C',
    location: 'Warehouse A',
  },
  {
    timestamp: '2025-10-16 14:29:50',
    deviceId: 'IOT-007',
    deviceName: 'Water Level #4',
    metric: 'water_level',
    value: '78%',
    location: 'Tank Storage',
  },
  {
    timestamp: '2025-10-16 14:29:45',
    deviceId: 'IOT-006',
    deviceName: 'Gas Sensor #7',
    metric: 'gas',
    value: '0.02 ppm',
    location: 'Factory Line 2',
  },
];

export function DataQuery() {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isQuerying, setIsQuerying] = useState(false);
  const [results, setResults] = useState(mockQueryResults);

  const handleQuery = () => {
    setIsQuerying(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockQueryResults);
      setIsQuerying(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Query Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Truy vấn dữ liệu</CardTitle>
          <CardDescription>Tìm kiếm và lọc dữ liệu từ Data Lake</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Device Filter */}
            <div className="space-y-2">
              <Label>Thiết bị</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thiết bị</SelectItem>
                  <SelectItem value="IOT-001">Temperature Sensor #12</SelectItem>
                  <SelectItem value="IOT-002">Humidity Sensor #8</SelectItem>
                  <SelectItem value="IOT-003">Motion Detector #5</SelectItem>
                  <SelectItem value="IOT-005">Pressure Sensor #15</SelectItem>
                  <SelectItem value="IOT-006">Gas Sensor #7</SelectItem>
                  <SelectItem value="IOT-007">Water Level #4</SelectItem>
                  <SelectItem value="IOT-008">Power Meter #9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metric Filter */}
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả metrics</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="humidity">Humidity</SelectItem>
                  <SelectItem value="motion">Motion</SelectItem>
                  <SelectItem value="pressure">Pressure</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="water_level">Water Level</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleQuery} disabled={isQuerying} className="flex-1 sm:flex-none">
              <Search className="w-4 h-4 mr-2" />
              {isQuerying ? 'Đang truy vấn...' : 'Truy vấn'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Query Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Kết quả truy vấn</CardTitle>
              <CardDescription>{results.length} records tìm thấy</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              <Filter className="w-3 h-3 mr-1" />
              Filtered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm text-slate-600">{row.timestamp}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.deviceId}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-900">{row.deviceName}</TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700 capitalize">{row.metric.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell className="text-slate-900">{row.value}</TableCell>
                    <TableCell className="text-sm text-slate-600">{row.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
