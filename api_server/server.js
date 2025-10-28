// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Minio = require('minio');
const cors = require('cors'); 

const app = express();
app.use(cors());   
app.use(bodyParser.json());


// Kết nối tới MinIO (container đang chạy ở localhost:9000)
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
  if (err) return console.error('❌ Lỗi kiểm tra bucket:', err);
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) return console.error('❌ Không tạo được bucket:', err);
      console.log('✅ Đã tạo bucket:', bucketName);
    });
  } else {
    console.log('✅ Bucket đã tồn tại:', bucketName);
  }
});

// API nhận dữ liệu từ ThingsBoard
app.post('/upload', async (req, res) => {
  try {
    const data = req.body;
    const filename = `tb_${Date.now()}.json`;
    const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf8');

    await minioClient.putObject(bucketName, filename, buffer);
    console.log('📦 Đã lưu:', filename);

    res.json({ status: 'success', file: filename });
  } catch (err) {
    console.error('❌ Lỗi upload:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});


// 📤 API: Xuất danh sách file trong bucket
app.get('/list', async (req, res) => {
  const files = [];
  const stream = minioClient.listObjectsV2(bucketName, '', true);
  stream.on('data', obj => files.push(obj.name));
  stream.on('end', () => res.json({ status: 'success', files }));
  stream.on('error', err => res.status(500).json({ error: err.message }));
});

// 📥 API: Tải về 1 file cụ thể
app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;
  try {
    const fileStream = await minioClient.getObject(bucketName, filename);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fileStream.pipe(res);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});


/// 📚 API: Merge toàn bộ file JSON trong hồ thành 1 dataset (fix async)
app.get('/merged', async (req, res) => {
  const { device, from, to } = req.query;
  const dataset = [];

  try {
    // Lấy danh sách file trong bucket
    const files = [];
    const stream = minioClient.listObjectsV2(bucketName, '', true);
    for await (const obj of stream) {
      if (obj.name.endsWith('.json')) files.push(obj.name);
    }

    // Đọc từng file tuần tự
    for (const fileName of files) {
      try {
        const fileStream = await minioClient.getObject(bucketName, fileName);
        const chunks = [];
        for await (const chunk of fileStream) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();

        try {
          const json = JSON.parse(raw);

          if (json.device && json.timestamp) {
            if ((!device || json.device === device) &&
                (!from || json.timestamp >= from) &&
                (!to || json.timestamp <= to)) {
              dataset.push(json);
            }
          }
        } catch (err) {
          console.error(`❌ Lỗi parse JSON ở file ${fileName}:`, err.message);
        }
      } catch (err) {
        console.error(`❌ Lỗi đọc file ${fileName}:`, err.message);
      }
    }

    // Sắp xếp kết quả theo timestamp
    dataset.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    res.json({ status: 'success', total: dataset.length, dataset });

  } catch (err) {
    console.error('❌ Lỗi khi merge dữ liệu:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ===================== 📦 LẤY DANH SÁCH THIẾT BỊ TỪ DỮ LIỆU =====================
app.get('/devices', async (req, res) => {
  try {
    console.log('📡 Đang tổng hợp danh sách thiết bị...');
    const allData = [];

    // ✅ 1. Liệt kê tất cả file trong bucket MinIO
    const stream = minioClient.listObjectsV2(bucketName, '', true);
    for await (const obj of stream) {
      if (obj.name.endsWith('.json')) {
        const chunks = [];
        const fileStream = await minioClient.getObject(bucketName, obj.name);
        for await (const chunk of fileStream) chunks.push(chunk);
        const content = Buffer.concat(chunks).toString('utf-8');

        try {
          const json = JSON.parse(content);
          // Một file có thể là { device, temperature, humidity, timestamp }
          if (Array.isArray(json)) allData.push(...json);
          else allData.push(json);
        } catch (e) {
          console.error('❌ Lỗi đọc JSON từ', obj.name);
        }
      }
    }

    // ✅ 2. Gom nhóm dữ liệu theo thiết bị
    const grouped = {};
    for (const rec of allData) {
      if (!rec.device) continue;
      if (!grouped[rec.device]) grouped[rec.device] = [];
      grouped[rec.device].push(rec);
    }

    // ✅ 3. Chuyển thành danh sách thiết bị
    const devices = Object.keys(grouped).map((dev) => {
      const records = grouped[dev];
      const lastRecord = records[records.length - 1];
      const lastTime = lastRecord?.timestamp || null;

      // Xác định loại thiết bị dựa theo tên
      let type = "Sensor";
      if (/temp/i.test(dev)) type = "Temperature";
      else if (/humi/i.test(dev)) type = "Humidity";
      else if (/gas/i.test(dev)) type = "Gas";
      else if (/motion/i.test(dev)) type = "Motion";
      else if (/pressure/i.test(dev)) type = "Pressure";
      else if (/water/i.test(dev)) type = "Water Level";
      else if (/light/i.test(dev)) type = "Light";
      else if (/power/i.test(dev)) type = "Power";

      // Kiểm tra thời gian hoạt động
      const now = new Date();
      const last = lastTime ? new Date(lastTime) : null;
      const diffMinutes = last ? (now - last) / (1000 * 60) : Infinity;
      let status = "offline";
      if (diffMinutes <= 2) status = "online";
      else if (diffMinutes <= 10) status = "warning";

      return {
        id: dev,
        name: dev,
        type,
        location: "Unknown", // sau này bạn có thể bổ sung
        status,
        lastSeen: lastTime,
        dataPoints: records.length,
      };
    });

    // ✅ 4. Gửi kết quả về frontend
    res.json({ devices });
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách thiết bị:', err);
    res.status(500).json({ error: 'Không thể đọc danh sách thiết bị' });
  }
});

// gộp chung react chung port
// ... các route API: /upload, /list, /merged ở phía trên

const path = require('path');
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Bắt mọi route khác trả về React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});
app.listen(5001, () => console.log('✅ Server running on port 5001'));


const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Node API chạy ở http://0.0.0.0:${PORT}`);
});



