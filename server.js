const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const md5 = require('md5'); // thêm ở đầu file
const crypto = require('crypto');
const Minio = require('minio');

// Kết nối tới MinIO (container đang chạy ở localhost:9000) (LẤY Ở SERVER_MINIO)
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: '24082002'
});

const bucketName = 'thingsboard-data';

// Đảm bảo bucket tồn tại
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) return console.error('Lỗi kiểm tra bucket:', err);
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) return console.error('Không tạo được bucket:', err);
      console.log('✅ Đã tạo bucket:', bucketName);
    });
  } else {
    console.log('✅ Bucket đã tồn tại:', bucketName);
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// ========================== KẾT NỐI MYSQL ==========================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '24082002',
  database: 'iot_data_sharing'
});

db.connect(err => {
  if (err) {
    console.error('Lỗi kết nối MySQL:', err);
  } else {
    console.log('✅ Kết nối MySQL thành công!');
  }
});

// API kiểm tra kết nối
app.get('/api/health', (req, res) => {
  db.query('SELECT 1', (err, result) => {
    if (err) return res.status(500).json({ ok: false });
    res.json({ ok: true });
  });
});

// ========================== API: ĐĂNG KÝ ==========================

app.post('/api/register', (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    // 🔍 Kiểm tra đầu vào
    if (!username || !password || !name || !email) {
      console.warn('⚠️ Thiếu thông tin bắt buộc:', req.body);
      return res
        .status(400)
        .json({ message: 'Thiếu thông tin bắt buộc (username, password, name, email).' });
    }

    // ⚙️ Mã hóa password (MD5 2 lần)
    const md5 = (val) => crypto.createHash('md5').update(val).digest('hex');
    const hashedPassword = md5(md5(password));

    // 🔍 Kiểm tra username/email đã tồn tại
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    db.query(checkQuery, [username, email], (err, result) => {
      if (err) {
        console.error('Lỗi kiểm tra user:', err);
        return res.status(500).json({ message: 'Lỗi hệ thống khi kiểm tra người dùng.' });
      }

      if (result.length > 0) {
        console.warn('⚠️ Trùng username hoặc email:', username, email);
        return res
          .status(400)
          .json({ message: 'Tên đăng nhập hoặc email đã được sử dụng. Vui lòng chọn cái khác.' });
      }

      // Thêm user mới
      const insertQuery = `
        INSERT INTO users (username, password, name, email, phone, cash, role_id, ban, createAt, updateAt)
        VALUES (?, ?, ?, ?, ?, 0, 2, 0, NOW(), NOW())
      `;

      db.query(insertQuery, [username, hashedPassword, name, email, phone || null], (err2) => {
        if (err2) {
          console.error('Lỗi khi thêm user:', err2);
          return res.status(500).json({ message: 'Lỗi hệ thống khi thêm người dùng.' });
        }

        console.log(`✅ Đăng ký thành công: ${username} (${email})`);
        return res
          .status(200)
          .json({ status: 'success', message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.' });
      });
    });
  } catch (error) {
    console.error('Lỗi ngoại lệ ngoài try:', error);
    return res.status(500).json({ message: 'Lỗi không xác định từ server.' });
  }
});
// ========================== API: ĐĂNG NHẬP ==========================
// API: Đăng nhập bằng username
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  // Mã hóa MD5 2 lần như khi đăng ký
  const md5 = (val) => crypto.createHash('md5').update(val).digest('hex');
  const hashedPassword = md5(md5(password));

  const query = `
    SELECT id, username, name, email, phone, role_id, ban
    FROM users
    WHERE username = ? AND password = ?
  `;

  db.query(query, [username, hashedPassword], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn MySQL:', err);
      return res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const user = results[0];
    if (user.ban === 1) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa, liên hệ quản trị viên.' });
    }

    console.log(`✅ Người dùng đăng nhập: ${user.username} (${user.email})`);

    return res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
      },
    });
  });
});

app.post('/api/add-device', (req, res) => {
  const { name, description, device_type_id, user_id, province, district, ward } = req.body;
  let { device_id } = req.body;

  device_id = device_id.trim().toUpperCase();

  if (!name || !device_id || !device_type_id || !user_id) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }

  const api_key = crypto.randomBytes(32).toString('hex');
  const locationString = [ward, district, province].filter(Boolean).join(', ');

  const sql = `
    INSERT INTO devices (
      name, device_id, description, device_type_id,
      api_key, user_id,
      location,
      province, district, ward,
      createAt, updateAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  db.query(
    sql,
    [
      name,
      device_id,
      description || null,
      device_type_id,
      api_key,
      user_id,
      locationString,   // chuỗi hiển thị
      province || null, // Lưu riêng từng field
      district || null,
      ward || null
    ],
    (err, result) => {
      if (err) {
        console.error(' Lỗi thêm thiết bị:', err);

        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Mã thiết bị bị trùng. Vui lòng nhập mã khác.' });
        }

        return res.status(500).json({ message: 'Không thể thêm thiết bị.' });
      }

      console.log(`✅ Thêm thiết bị mới: ${device_id} (key=${api_key})`);
      res.json({ status: 'success', message: 'Thêm thiết bị thành công.', api_key });
    }
  );
});



// ================== API: RESET API KEY ==================
app.post('/api/devices/:id/reset-key', (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Thiếu ID thiết bị.' });

  const newKey = crypto.randomBytes(32).toString('hex');

  const sql = `UPDATE devices SET api_key = ?, updateAt = NOW() WHERE id = ?`;
  db.query(sql, [newKey, id], (err, result) => {
    if (err) {
      console.error(' Lỗi reset key:', err);
      return res.status(500).json({ message: 'Không thể reset API key.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
    }

    console.log(`🔑 Đã reset API key cho thiết bị ID=${id}`);
    res.json({ status: 'success', message: 'Đã reset API key thành công.', newKey });
  });
});

// ==================  API: LẤY DANH SÁCH THIẾT BỊ ==================
app.get('/api/devices', (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.device_id,
      d.name,
      d.description,
      d.device_type_id,
      d.api_key,
      d.location,
      dt.name AS device_type_name,
      d.createAt,
      d.updateAt
    FROM devices d
    LEFT JOIN device_types dt ON d.device_type_id = dt.id
    ORDER BY d.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(' Lỗi lấy danh sách thiết bị:', err);
      return res.status(500).json({ message: 'Không thể tải danh sách thiết bị.' });
    }
    res.json({ status: 'success', devices: results });
  });
});


// ========================== API: UPLOAD DỮ LIỆU CHO THIẾT BỊ ==========================
app.post("/api/device/upload", async (req, res) => {
  try {
    const { api_key, device_id, timestamp, ...sensors } = req.body;

    // 1. Kiểm tra metadata thiết bị
    const [rows] = await db.promise().query(
      "SELECT * FROM devices WHERE device_id = ? AND api_key = ?",
      [device_id, api_key]
    );
    if (rows.length === 0) {
      return res.status(403).json({ message: "Sai API key hoặc device_id" });
    }

    // 2. Lấy ngày tháng để tạo partition
    const time = new Date(timestamp || Date.now());
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const day = String(time.getDate()).padStart(2, "0");

    // 3. Lưu file phân đoạn theo sensor
    for (const [sensor, value] of Object.entries(sensors)) {
      const path = `device_id=${device_id}/sensor=${sensor}/year=${year}/month=${month}/day=${day}/`;
      const filename = `${Date.now()}.json`;

      const raw = {
        device_id,
        sensor,
        timestamp,
        value,
         province: rows[0].province || null,
       district: rows[0].district || null,
        ward: rows[0].ward || null
      };

      await minioClient.putObject(
        "thingsboard-data",
        path + filename,
        JSON.stringify(raw, null, 2)
      );
    }

    return res.json({
      status: "success",
      message: "Đã ghi dữ liệu theo thiết bị và sensor!",
    });
  } catch (err) {
    console.error(" Lỗi upload:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});
/// ========================== API: LỌC DỮ LIỆU  ==========================
app.get("/api/filter", async (req, res) => {
  const { device_id, sensor, start, end, province, district, ward } = req.query;

  try {
    const startDate = start ? new Date(start) : new Date("1970-01-01");
    const endDate   = end   ? new Date(end)   : new Date("2100-01-01");

    const result = {
      total: 0,
      data: []
    };

    const stream = minioClient.listObjectsV2("thingsboard-data", "", true);

    for await (const obj of stream) {
      if (!obj.name.endsWith(".json")) continue;

      const rec = await readJSON(obj.name);
      if (!rec) continue;

      const t = new Date(rec.timestamp);
      if (t < startDate || t > endDate) continue;

      if (device_id && rec.device_id !== device_id) continue;
      if (sensor && rec.sensor !== sensor) continue;

      if (province && rec.province !== province) continue;
      if (district && rec.district !== district) continue;
      if (ward && rec.ward !== ward) continue;

      result.data.push(rec);
      result.total++;
    }

    return res.json({ status: "success", result });

  } catch (err) {
    console.error("❌ Lỗi filter:", err);
    res.status(500).json({ message: "Lỗi filter dữ liệu" });
  }
});


// helper đọc JSON
async function readJSON(path) {
  try {
    const stream = await minioClient.getObject("thingsboard-data", path);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch (e) {
    return null;
  }
}
// ========================== API: TẠO DATASET SAU KHI LỌC DỮ LIỆU ==========================
app.get("/api/dataset", async (req, res) => {
  const { device_id, sensor, start, end, province, district, ward } = req.query;

  try {
    const startDate = start ? new Date(start) : new Date("1970-01-01");
    const endDate   = end   ? new Date(end)   : new Date("2100-01-01");

    let dataset = {
      total: 0,
      data: []
    };

    const stream = minioClient.listObjectsV2("thingsboard-data", "", true);

    for await (const obj of stream) {
      if (!obj.name.endsWith(".json")) continue;

      const rec = await readJSON(obj.name);
      if (!rec) continue;

      const t = new Date(rec.timestamp);
      if (t < startDate || t > endDate) continue;

      if (device_id && rec.device_id !== device_id) continue;
      if (sensor && rec.sensor !== sensor) continue;

      if (province && rec.province !== province) continue;
      if (district && rec.district !== district) continue;
      if (ward && rec.ward !== ward) continue;

      dataset.data.push(rec);
      dataset.total++;
    }

    return res.json(dataset);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Dataset build failed" });
  }
});


async function readJSON(path) {
  try {
    const stream = await minioClient.getObject("thingsboard-data", path);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch (err) {
    return null;
  }
}

function cleanFilter(filter) {
  const valid = {};
  for (const key in filter) {
    if (filter[key] && filter[key] !== "all" && filter[key] !== "") {
      valid[key] = filter[key];
    }
  }
  return valid;
}

// Lưu filter mới
app.post('/api/export_filters', (req, res) => {
  const { user_id, filter_name, filter_json } = req.body;

  if (!user_id || !filter_json) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const sql = `
    INSERT INTO export_filters (user_id, filter_name, filter_json, createAt)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(sql, [user_id, filter_name, JSON.stringify(filter_json)], (err, result) => {
    if (err) {
      console.error('SQL error:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// Lấy danh sách filter của 1 user
app.get('/api/export_filters/:uid', (req, res) => {
  const uid = req.params.uid;

  const sql = `
    SELECT id, user_id, filter_name, filter_json, createAt
    FROM export_filters
    WHERE user_id = ?
    ORDER BY createAt DESC
  `;

  db.query(sql, [uid], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    const parsed = rows.map((r) => {
      let json = {};
      try {
        json = r.filter_json ? JSON.parse(r.filter_json) : {};
      } catch {
        json = {};
      }
      return { ...r, filter_json: json };
    });

    res.json(parsed);
  });
});

// Xem lại dataset từ filter đã lưu
app.get('/api/export_filters/:id/dataset', async (req, res) => {
  const sql = `SELECT * FROM export_filters WHERE id = ?`;

  db.query(sql, [req.params.id], async (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows.length) return res.status(404).json({ error: 'Filter not found' });

    let filter = {};
    try {
      filter = JSON.parse(rows[0].filter_json);
    } catch {
      filter = {};
    }

    const params = new URLSearchParams();

    if (filter.device_id && filter.device_id !== 'all') params.set('device_id', filter.device_id);
    if (filter.sensor && filter.sensor !== 'all') params.set('sensor', filter.sensor);
    if (filter.start && filter.start !== 'all') params.set('start', filter.start);
    if (filter.end && filter.end !== 'all') params.set('end', filter.end);

    if (filter.location) {
      const { province, district, ward } = filter.location;
      if (province && province !== 'all') params.set('province', province);
      if (district && district !== 'all') params.set('district', district);
      if (ward && ward !== 'all') params.set('ward', ward);
    }

    const datasetUrl = `http://localhost:5000/api/dataset?${params.toString()}`;

    try {
      const response = await fetch(datasetUrl);
      const jsonData = await response.json();
      return res.json(jsonData);
    } catch (e) {
      console.error(' Dataset fetch error:', e);
      return res.status(500).json({ error: 'Dataset fetch failed' });
    }
  });
});

// Export lại CSV từ filter đã lưu
app.get('/api/export_filters/:id/export_csv', async (req, res) => {
  const sql = `SELECT * FROM export_filters WHERE id = ?`;

  db.query(sql, [req.params.id], async (err, rows) => {
    if (err) return res.status(500).send('Server error');
    if (!rows.length) return res.status(404).send('Filter not found');

    let filter = {};
    try {
      filter = JSON.parse(rows[0].filter_json);
    } catch {
      filter = {};
    }

    const params = new URLSearchParams();

    if (filter.device_id && filter.device_id !== 'all') params.set('device_id', filter.device_id);
    if (filter.sensor && filter.sensor !== 'all') params.set('sensor', filter.sensor);
    if (filter.start && filter.start !== 'all') params.set('start', filter.start);
    if (filter.end && filter.end !== 'all') params.set('end', filter.end);

    if (filter.location) {
      const { province, district, ward } = filter.location;
      if (province && province !== 'all') params.set('province', province);
      if (district && district !== 'all') params.set('district', district);
      if (ward && ward !== 'all') params.set('ward', ward);
    }

    const datasetUrl = `http://localhost:5000/api/dataset?${params.toString()}`;

    try {
      const response = await fetch(datasetUrl);
      const jsonData = await response.json();

      let rowsCSV = [];
      if (jsonData.data) rowsCSV.push(...jsonData.data);
      if (jsonData.sensors)
        Object.values(jsonData.sensors).forEach((a) => rowsCSV.push(...a));
      if (jsonData.devices)
        Object.values(jsonData.devices).forEach((a) => rowsCSV.push(...a));

      let csv = 'timestamp,device_id,sensor,value\n';
      csv += rowsCSV.map((r) => `${r.timestamp},${r.device_id},${r.sensor},${r.value}`).join('\n');

      const fileName = rows[0].filter_name || 'dataset.csv';

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(csv);
    } catch (e) {
      console.error(' Export CSV error:', e);
      return res.status(500).send('Export failed');
    }
  });
});

// xóa lịch sử
app.delete("/api/export_filters/:id", (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM export_filters WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(" Lỗi xóa lịch sử:", err);
      return res.status(500).json({ error: "Delete failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "History not found" });
    }

    return res.json({ success: true, message: "Đã xóa lịch sử!" });
  });
});


// ================== API: TỔNG HỢP==================

app.get('/api/merge', async (req, res) => {
  const { device_id, sensor, start, end } = req.query;

  try {
    const dataset = {
      device_id: device_id || "all",
      total: 0,
      sensors: {}
    };

    // Parse thời gian
    const startTime = start ? new Date(start) : new Date("1970-01-01");
    const endTime   = end   ? new Date(end)   : new Date("2100-01-01");

    // prefix cho MinIO
    let prefix = "";
    if (device_id) prefix = `device_id=${device_id}/`;
    if (device_id && sensor) prefix = `device_id=${device_id}/sensor=${sensor}/`;

    const files = [];
    const stream = minioClient.listObjectsV2("thingsboard-data", prefix, true);

    for await (const obj of stream) {
      if (obj.name.endsWith(".json")) files.push(obj.name);
    }

    // Đọc từng file
    for (const fileName of files) {
      const fileStream = await minioClient.getObject("thingsboard-data", fileName);

      const chunks = [];
      for await (const chunk of fileStream) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf-8');

      try {
        const json = JSON.parse(raw);

        // Validate dữ liệu
        if (!json.device_id || !json.sensor || !json.timestamp) continue;

        const t = new Date(json.timestamp);
        if (t < startTime || t > endTime) continue;

        // Nếu có sensor filter thì bỏ dữ liệu không liên quan
        if (sensor && json.sensor !== sensor) continue;

        // Tạo nhóm nếu chưa có
        if (!dataset.sensors[json.sensor]) {
          dataset.sensors[json.sensor] = [];
        }

        dataset.sensors[json.sensor].push(json);
        dataset.total++;

      } catch (e) {
        console.log(" JSON lỗi:", fileName);
      }
    }

    // Sort từng loại dữ liệu theo timestamp
    for (const type of Object.keys(dataset.sensors)) {
      dataset.sensors[type].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    }

    res.json({ status: "success", dataset });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi merge dữ liệu" });
  }
});

// ================== 📦 API: LẤY DANH SÁCH LOẠI THIẾT BỊ ==================
app.get('/api/device-types', (req, res) => {
  const sql = `SELECT id, name, description FROM device_types ORDER BY id ASC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(' Lỗi lấy danh sách device_types:', err);
      return res.status(500).json({ message: 'Không thể lấy danh sách loại thiết bị.' });
    }
    res.json({ status: 'success', device_types: results });
  });
});

// ================== 🗑️ API: XÓA THIẾT BỊ ==================
app.delete('/api/devices/:device_id', (req, res) => {
  const { device_id } = req.params;

  if (!device_id) {
    return res.status(400).json({ status: 'error', message: 'Thiếu mã thiết bị cần xóa.' });
  }

  const sql = 'DELETE FROM devices WHERE device_id = ?';
  db.query(sql, [device_id], (err, result) => {
    if (err) {
      console.error(' Lỗi khi xóa thiết bị:', err);
      return res.status(500).json({ status: 'error', message: 'Lỗi hệ thống khi xóa thiết bị.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy thiết bị để xóa.' });
    }

    console.log(`🗑️ Đã xóa thiết bị có device_id=${device_id}`);
    return res.status(200).json({ status: 'success', message: 'Xóa thiết bị thành công!' });
  });
});




// Khởi động server
app.listen(5000, () => console.log('🚀 Server chạy tại http://localhost:5000'));
