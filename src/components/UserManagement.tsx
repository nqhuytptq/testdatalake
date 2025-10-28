import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, UserPlus, MoreVertical, Shield, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin: string;
  devicesAccess: number;
}

const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'Admin PTIT',
    email: 'admin@ptit.edu.vn',
    role: 'admin',
    status: 'active',
    lastLogin: '5 phút trước',
    devicesAccess: 24,
  },
  {
    id: '2',
    name: 'Manager',
    email: 'manager@ptit.edu.vn',
    role: 'manager',
    status: 'active',
    lastLogin: '1 giờ trước',
    devicesAccess: 18,
  },
  {
    id: '3',
    name: 'User',
    email: 'user@ptit.edu.vn',
    role: 'viewer',
    status: 'active',
    lastLogin: '2 giờ trước',
    devicesAccess: 8,
  },
  {
    id: '4',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@ptit.edu.vn',
    role: 'viewer',
    status: 'active',
    lastLogin: '1 ngày trước',
    devicesAccess: 5,
  },
  {
    id: '5',
    name: 'Trần Thị B',
    email: 'tranthib@ptit.edu.vn',
    role: 'manager',
    status: 'active',
    lastLogin: '3 giờ trước',
    devicesAccess: 12,
  },
  {
    id: '6',
    name: 'Lê Văn C',
    email: 'levanc@ptit.edu.vn',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '7 ngày trước',
    devicesAccess: 3,
  },
];

const roleLabels: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  viewer: 'Người xem',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  manager: 'bg-blue-100 text-blue-700 border-blue-200',
  viewer: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user: currentUser } = useAuth();

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const canManageUsers = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>Tổng cộng {mockUsers.length} người dùng trong hệ thống</CardDescription>
            </div>
            {canManageUsers && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Thêm người dùng
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm người dùng mới</DialogTitle>
                    <DialogDescription>
                      Tạo tài khoản mới cho người dùng trong hệ thống
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="newUserName">Họ và tên</Label>
                      <Input id="newUserName" placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUserEmail">Email</Label>
                      <Input id="newUserEmail" type="email" placeholder="user@ptit.edu.vn" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUserRole">Vai trò</Label>
                      <Select defaultValue="viewer">
                        <SelectTrigger id="newUserRole">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Quản trị viên</SelectItem>
                          <SelectItem value="manager">Quản lý</SelectItem>
                          <SelectItem value="viewer">Người xem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUserPassword">Mật khẩu tạm thời</Label>
                      <Input id="newUserPassword" type="password" placeholder="••••••••" />
                    </div>
                    <Button className="w-full">Tạo tài khoản</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-48">
                <Shield className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="manager">Quản lý</SelectItem>
                <SelectItem value="viewer">Người xem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Quyền truy cập</TableHead>
                  {canManageUsers && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.status === 'active' ? 'bg-green-500' : 'bg-slate-400'
                          }`}
                        ></div>
                        <span
                          className={`text-sm capitalize ${
                            user.status === 'active' ? 'text-green-700' : 'text-slate-600'
                          }`}
                        >
                          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{user.lastLogin}</TableCell>
                    <TableCell className="text-slate-900">{user.devicesAccess} thiết bị</TableCell>
                    {canManageUsers && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <UserIcon className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa quyền</DropdownMenuItem>
                            <DropdownMenuItem>Reset mật khẩu</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={user.status === 'active' ? 'text-orange-600' : ''}
                            >
                              {user.status === 'active' ? 'Tắt tài khoản' : 'Kích hoạt tài khoản'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Xóa người dùng</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Phân quyền theo vai trò</CardTitle>
          <CardDescription>Mô tả quyền hạn của từng vai trò trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-red-600" />
                <h4 className="text-red-900">Quản trị viên</h4>
              </div>
              <ul className="space-y-2 text-sm text-red-800">
                <li>• Toàn quyền quản lý hệ thống</li>
                <li>• Thêm/xóa người dùng</li>
                <li>• Quản lý tất cả thiết bị</li>
                <li>• Xem và export mọi dữ liệu</li>
                <li>• Cấu hình hệ thống</li>
              </ul>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="text-blue-900">Quản lý</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Quản lý thiết bị được phân quyền</li>
                <li>• Xem và truy vấn dữ liệu</li>
                <li>• Export dữ liệu</li>
                <li>• Xem analytics và reports</li>
                <li>• Cấu hình alerts</li>
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-5 h-5 text-slate-600" />
                <h4 className="text-slate-900">Người xem</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Xem dữ liệu được phân quyền</li>
                <li>• Xem dashboard và charts</li>
                <li>• Truy vấn dữ liệu cơ bản</li>
                <li>• Không thể chỉnh sửa</li>
                <li>• Không thể export</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
