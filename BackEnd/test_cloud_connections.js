const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

function getDatabaseSslCa() {
  const candidates = [
    process.env.MYSQL_SSL_CA,
    'certs/isrgrootx.pem',
    'certs/isrgrootx1.pem',
    'certs/ca.pem',
  ].filter(Boolean);

  for (const p of candidates) {
    const fullPath = path.resolve(__dirname, p);
    if (fs.existsSync(fullPath)) {
      return { path: fullPath, content: fs.readFileSync(fullPath, 'utf8') };
    }
  }
  return null;
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 KIỂM TRA KẾT NỐI TOÀN DIỆN: TIDB CLOUD & MONGODB ATLAS');
  console.log('================================================================\n');

  let tidbSuccess = false;
  let mongoSuccess = false;

  // 1. Kiểm tra TiDB Cloud
  console.log('📡 1. KIỂM TRA TIDB CLOUD (MySQL Serverless)...');
  const caInfo = getDatabaseSslCa();
  console.log(' - Host:', process.env.MYSQL_HOST);
  console.log(' - Port:', process.env.MYSQL_PORT);
  console.log(' - User:', process.env.MYSQL_USER);
  console.log(' - Database:', process.env.MYSQL_DATABASE);
  console.log(' - SSL Enabled:', process.env.MYSQL_SSL);
  console.log(' - SSL CA Certificate:', caInfo ? caInfo.path : 'Không tìm thấy');

  try {
    const tidbConn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '4000', 10),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'smartlearn-db',
      ssl: caInfo
        ? {
            ca: caInfo.content,
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2',
          }
        : undefined,
    });

    console.log(' ✅ Kết nối TiDB Cloud THÀNH CÔNG!');

    const [tables] = await tidbConn.query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log(` 📦 Danh sách ${tableNames.length} bảng trong TiDB:`);
    for (const t of tableNames) {
      const [countRes] = await tidbConn.query(`SELECT COUNT(*) as count FROM \`${t}\``);
      console.log(`   - ${t}: ${countRes[0].count} bản ghi`);
    }

    // Thử truy vấn dữ liệu mẫu từ bảng users
    const [sampleUsers] = await tidbConn.query(
      'SELECT id, username, email, full_name, role FROM users LIMIT 3'
    );
    console.log(' 👤 Dữ liệu mẫu bảng `users` trên TiDB Cloud:');
    sampleUsers.forEach((u) => {
      console.log(`   * [ID: ${u.id}] ${u.username} (${u.email}) - Role: ${u.role}`);
    });

    await tidbConn.end();
    tidbSuccess = true;
  } catch (err) {
    console.error(' ❌ LỖI KẾT NỐI TIDB CLOUD:', err.message);
  }

  console.log('\n----------------------------------------------------------------\n');

  // 2. Kiểm tra MongoDB Atlas
  console.log('🍃 2. KIỂM TRA MONGODB ATLAS...');
  const mongoUri = process.env.MONGODB_URI || '';
  const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
  console.log(' - URI:', maskedUri);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(' ✅ Kết nối MongoDB Atlas THÀNH CÔNG!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(` 📦 Danh sách ${collections.length} collections trong MongoDB Atlas:`);
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`   - ${col.name}: ${count} documents`);
    }

    // Thử truy vấn mẫu từ collection courses
    const sampleCourse = await mongoose.connection.db.collection('courses').findOne({});
    if (sampleCourse) {
      console.log(` 📚 Dữ liệu mẫu collection 'courses': "${sampleCourse.title || sampleCourse.name || sampleCourse._id}"`);
    }

    await mongoose.disconnect();
    mongoSuccess = true;
  } catch (err) {
    console.error(' ❌ LỖI KẾT NỐI MONGODB ATLAS:', err.message);
  }

  console.log('\n================================================================');
  console.log('📊 TỔNG KẾT KẾT QUẢ KIỂM TRA:');
  console.log(` - TiDB Cloud:      ${tidbSuccess ? '✅ HOẠT ĐỘNG HOÀN HẢO' : '❌ THẤT BẠI'}`);
  console.log(` - MongoDB Atlas:    ${mongoSuccess ? '✅ HOẠT ĐỘNG HOÀN HẢO' : '❌ THẤT BẠI'}`);
  console.log('================================================================\n');

  if (!tidbSuccess || !mongoSuccess) {
    process.exit(1);
  }
}

runTests();
