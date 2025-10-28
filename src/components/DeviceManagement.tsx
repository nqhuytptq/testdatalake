import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Activity, Search, Filter, Plus, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const mockDevices = [
  {
    id: 'IOT-001',
    name: 'Temperature Sensor #12',
    type: 'Temperature',
    location: 'Warehouse A',
    status: 'online',
    lastSeen: '1 phút trước',
    dataPoints: '1.2K',
  },
  {
    id: 'IOT-002',
    name: 'Humidity Sensor #8',
    type: 'Humidity',
    location: 'Warehouse A',
    status: 'online',
    lastSeen: '2 phút trước',
    dataPoints: '980',
  },
  {
    id: 'IOT-003',
    name: 'Motion Detector #5',
    type: 'Motion',
    location: 'Office Floor 2',
    status: 'online',
    lastSeen: '30 giây trước',
    dataPoints: '2.5K',
  },
  {
    id: 'IOT-004',
    name: 'Light Sensor #3',
    type: 'Light',
    location: 'Office Floor 1',
    status: 'offline',
    lastSeen: '2 giờ trước',
    dataPoints: '750',
  },
  {
    id: 'IOT-005',
    name: 'Pressure Sensor #15',
    type: 'Pressure',
    location: 'Factory Line 1',
    status: 'online',
    lastSeen: '5 phút trước',
    dataPoints: '1.8K',
  },
  {
    id: 'IOT-006',
    name: 'Gas Sensor #7',
    type: 'Gas',
    location: 'Factory Line 2',
    status: 'warning',
    lastSeen: '1 phút trước',
    dataPoints: '890',
  },
  {
    id: 'IOT-007',
    name: 'Water Level #4',
    type: 'Water Level',
    location: 'Tank Storage',
    status: 'online',
    lastSeen: '3 phút trước',
    dataPoints: '1.1K',
  },
  {
    id: 'IOT-008',
    name: 'Power Meter #9',
    type: 'Power',
    location: 'Building Main',
    status: 'online',
    lastSeen: '1 phút trước',
    dataPoints: '3.2K',
  },
];

export function DeviceManagement() {
  const [devices, setDevices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get('http://localhost:5001/devices');
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error('❌ Lỗi tải thiết bị:', err);
    }
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Quản lý thiết bị IoT</CardTitle>
          <CardDescription>
            Tổng cộng {devices.length} thiết bị đang được quản lý
          </CardDescription>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm thiết bị
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên, ID, hoặc vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Data Points</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div>
                        <p className="text-slate-900">{device.name}</p>
                        <p className="text-xs text-slate-500">{device.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{device.type}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{device.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          device.status === 'online' ? 'bg-green-500' :
                          device.status === 'offline' ? 'bg-slate-400' :
                          'bg-orange-500'
                        }`}></div>
                        <span className={`text-sm capitalize ${
                          device.status === 'online' ? 'text-green-700' :
                          device.status === 'offline' ? 'text-slate-600' :
                          'text-orange-700'
                        }`}>
                          {device.status}
                        </span>
                      </div>
                    </TableCell>
<TableCell className="text-slate-600 text-sm">
  {device.lastSeen
    ? new Date(device.lastSeen).toLocaleString('vi-VN')
    : '-'}
</TableCell>
<TableCell className="text-slate-900">
  {device.dataPoints?.toLocaleString('vi-VN')}
</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Activity className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>Cấu hình</DropdownMenuItem>
                          <DropdownMenuItem>Xem logs</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Xóa thiết bị</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
