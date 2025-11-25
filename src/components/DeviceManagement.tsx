import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Activity, Search, Filter, Plus, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export function DeviceManagement() {
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'warning'>('all');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
  const [selectedWard, setSelectedWard] = useState<any | null>(null);

  const [newDevice, setNewDevice] = useState({
    name: '',
    device_id: '',
    user_id: '',
    description: '',
    device_type_id: '',
    location: '',
  });


  // ================= FETCH =================
  useEffect(() => {
    fetchDevices();
    fetchDeviceTypes();
    fetchProvinces();
  }, []);

const fetchProvinces = async () => {
  try {
    const res = await axios.get('https://provinces.open-api.vn/api/p/');
    setProvinces(res.data || []);
  } catch (err) {
    console.error('Lỗi tải danh sách tỉnh:', err);
  }
};

const handleProvinceChange = async (code: string) => {
  const p = provinces.find((item) => String(item.code) === code) || null;
  setSelectedProvince(p);
  setSelectedDistrict(null);
  setSelectedWard(null);
  setDistricts([]);
  setWards([]);

  try {
    const res = await axios.get(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    setDistricts(res.data?.districts || []);
  } catch (err) {
    console.error('Lỗi tải quận/huyện:', err);
  }
};

const handleDistrictChange = async (code: string) => {
  const d = districts.find((item) => String(item.code) === code) || null;
  setSelectedDistrict(d);
  setSelectedWard(null);
  setWards([]);

  try {
    const res = await axios.get(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    setWards(res.data?.wards || []);
  } catch (err) {
    console.error('Lỗi tải xã/phường:', err);
  }
};

const handleWardChange = (code: string) => {
  const w = wards.find((item) => String(item.code) === code) || null;
  setSelectedWard(w);
};



  const fetchDeviceTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/device-types');
      setDeviceTypes(Array.isArray(res.data?.device_types) ? res.data.device_types : []);
    } catch (err) {
      console.error('Lỗi tải loại thiết bị:', err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/devices');
      setDevices(res.data?.devices || []);
    } catch (err) {
      console.error('Lỗi tải thiết bị:', err);
    }
  };

  // ================= THÊM THIẾT BỊ =================
const handleAddDevice = async () => {
  try {
    setFormError('');
    if (!newDevice.name || !newDevice.device_id || !newDevice.device_type_id) {
      setFormError('⚠️ Vui lòng nhập đủ thông tin bắt buộc.');
      return;
    }

    // 👇 Ghép chuỗi địa chỉ từ 3 cấp
    const provinceName = selectedProvince?.name || '';
    const districtName = selectedDistrict?.name || '';
    const wardName = selectedWard?.name || '';

    const locationString = [wardName, districtName, provinceName]
      .filter(Boolean)
      .join(', ');

    await axios.post('http://localhost:5000/api/add-device', {
      ...newDevice,
      user_id: 1,
      location: locationString || newDevice.location || null,
      province: selectedProvince?.name || null,
      district: selectedDistrict?.name || null,
      ward: selectedWard?.name || null
    });

    alert('✅ Thêm thiết bị thành công!');
    setIsOpen(false);
    setNewDevice({
      name: '',
      device_id: '',
      user_id: '',
      description: '',
      device_type_id: '',
      location: '',
    });
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    fetchDevices();
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      (err?.response?.status === 500 ? 'Lỗi server, vui lòng thử lại.' : 'Không thể thêm thiết bị.');
    setFormError(msg);
    setTimeout(() => setFormError(''), 4000);
  }
};


  // ================= BỘ LỌC =================
  const filteredDevices = devices.filter((d) => {
    const name = (d.name || '').toLowerCase();
    const id = (d.device_id || '').toLowerCase();
    const loc = (d.location || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const okSearch = name.includes(q) || id.includes(q) || loc.includes(q);
    const okStatus = filterStatus === 'all' || d.status === filterStatus;
    return okSearch && okStatus;
  });

  // =======================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Quản lý thiết bị IoT</CardTitle>
              <CardDescription>Tổng cộng {devices.length} thiết bị đang được quản lý</CardDescription>
            </div>

            {/* 🟢 Dialog thêm thiết bị */}
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setFormError(''); }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm thiết bị
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm thiết bị mới</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Tên thiết bị *</Label>
                    <Input
                      placeholder="Nhập tên thiết bị"
                      value={newDevice.name}
                      onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Mã thiết bị *</Label>
                    <Input
                      placeholder="Ví dụ: IOT-001"
                      value={newDevice.device_id}
                      onChange={(e) => setNewDevice({ ...newDevice, device_id: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Loại thiết bị *</Label>
                    <Select
                      value={String(newDevice.device_type_id || '')}
                      onValueChange={(val) => setNewDevice({ ...newDevice, device_type_id: Number(val) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại thiết bị" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.length
                          ? deviceTypes.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.name}
                              </SelectItem>
                            ))
                          : <SelectItem disabled value="">(Chưa có loại thiết bị)</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                 {/* Tỉnh / Thành phố */}
                    <div>
                      <Label>Tỉnh / Thành phố</Label>
                      <Select
                        value={selectedProvince ? String(selectedProvince.code) : ''}
                        onValueChange={handleProvinceChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tỉnh/thành" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((p) => (
                            <SelectItem key={p.code} value={String(p.code)}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quận / Huyện */}
                    <div>
                      <Label>Quận / Huyện</Label>
                      <Select
                        value={selectedDistrict ? String(selectedDistrict.code) : ''}
                        onValueChange={handleDistrictChange}
                        disabled={!selectedProvince}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedProvince ? 'Chọn quận/huyện' : 'Chọn tỉnh trước'} />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((d) => (
                            <SelectItem key={d.code} value={String(d.code)}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Xã / Phường */}
                    <div>
                      <Label>Xã / Phường</Label>
                      <Select
                        value={selectedWard ? String(selectedWard.code) : ''}
                        onValueChange={handleWardChange}
                        disabled={!selectedDistrict}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedDistrict ? 'Chọn xã/phường' : 'Chọn quận/huyện trước'} />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.map((w) => (
                            <SelectItem key={w.code} value={String(w.code)}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Hiển thị preview địa chỉ */}
                      <p className="text-xs text-slate-500 mt-1">
                        Địa chỉ: {[selectedWard?.name, selectedDistrict?.name, selectedProvince?.name]
                          .filter(Boolean)
                          .join(', ') || 'Chưa chọn'}
                      </p>
                    </div>

            
                  <div>
                    <Label>Mô tả</Label>
                    <Textarea
                      placeholder="Mô tả thiết bị..."
                      value={newDevice.description}
                      onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
                    />
                  </div>

                  {formError && (
                    <div className="text-red-600 text-sm font-medium border border-red-200 bg-red-50 rounded-md p-2">
                      {formError}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                    <Button onClick={handleAddDevice}>Lưu</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

      {/* Bảng thiết bị */}
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
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div>
                        <p className="text-slate-900 font-medium">{device.name}</p>
                        <p className="text-xs text-slate-500">{device.device_id}</p>
                      </div>
                    </TableCell>

                    <TableCell><Badge variant="outline">{device.device_type_name || 'Unknown'}</Badge></TableCell>
                    <TableCell className="text-slate-600">{device.location || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-orange-700">Offline</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">-</TableCell>
                    <TableCell className="text-slate-900">-</TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Xem chi tiết */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedDevice(device); setIsViewOpen(true); }}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Activity className="w-4 h-4 mr-1" />
                          Xem
                        </Button>

                        {/* Copy API */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `http://localhost:5001/upload/${device.device_id}`
                            );
                            alert('✅ Đã copy API upload!');
                          }}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          Copy API
                        </Button>

                        {/* Xóa thiết bị */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!window.confirm(`Xóa thiết bị "${device.name} - ${device.device_id}" khỏi cơ sở dữ liệu?`)) return;
                            try {
                              await axios.delete(`http://localhost:5000/api/devices/${device.device_id}`);
                              alert('🗑️ Đã xóa thiết bị thành công');
                              fetchDevices();
                            } catch (err) {
                              console.error('Lỗi xóa thiết bị:', err);
                              alert('❌ Không thể xóa thiết bị.');
                            }
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Xóa
                        </Button>

                        {/* Reset Key */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!window.confirm(`Reset API Key cho "${device.name}"?`)) return;
                            try {
                              const res = await axios.post(`http://localhost:5000/api/devices/${device.id}/reset-key`);
                              alert(`✅ API Key mới:\n${res.data.newKey}`);
                              fetchDevices();
                            } catch (err) {
                              console.error('Lỗi reset key:', err);
                              alert('❌ Không thể reset API key.');
                            }
                          }}
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        >
                          Reset Key
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 🟢 Popup Xem chi tiết */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thông tin thiết bị</DialogTitle>
          </DialogHeader>

          {selectedDevice ? (
            <div className="space-y-4">
              <div><Label>Tên thiết bị</Label><Input value={selectedDevice.name} readOnly /></div>
              <div><Label>Mã thiết bị</Label><Input value={selectedDevice.device_id} readOnly /></div>
              <div><Label>Loại</Label><Input value={selectedDevice.device_type_name || 'Unknown'} readOnly /></div>
              <div><Label>Mô tả</Label><Textarea value={selectedDevice.description || ''} readOnly /></div>

              <div>
                <Label>API Key</Label>
                <div className="flex items-center gap-2">
                  <Input value={selectedDevice.api_key || 'Chưa có'} readOnly className="font-mono text-xs" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDevice.api_key || '');
                      alert('📋 API Key đã được copy!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsViewOpen(false)}>Đóng</Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center">Không có dữ liệu thiết bị.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
