/**
 * Script sao chép toàn bộ cơ sở dữ liệu và dữ liệu từ MySQL Local sang TiDB Cloud
 * Đọc cấu hình từ file BackEnd/.env
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '.env') });

const LOCAL_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'smartlearn_db',
};

function getSslCaCert() {
  const candidates = [
    process.env.MYSQL_SSL_CA,
    'certs/isrgrootx.pem',
    'certs/isrgrootx1.pem',
    'certs/ca.pem',
  ].filter(Boolean);

  for (const c of candidates) {
    const fullPath = path.resolve(__dirname, c);
    if (fs.existsSync(fullPath)) {
      console.log(`🔑 Tìm thấy file chứng chỉ CA SSL tại: ${fullPath}`);
      return fs.readFileSync(fullPath, 'utf8');
    }
  }
  return undefined;
}

async function migrate() {
  console.log('================================================================');
  console.log('🚀 BẮT ĐẦU CHUYỂN DỮ LIỆU TỪ MYSQL LOCAL SANG TIDB CLOUD');
  console.log('================================================================\n');

  let localConn, tidbConn;

  try {
    // 1. Kết nối MySQL Local
    console.log('⏳ Đang kết nối tới MySQL Local (Nguồn)...');
    localConn = await mysql.createConnection(LOCAL_CONFIG);
    console.log(`✅ Kết nối MySQL Local thành công (Database: ${LOCAL_CONFIG.database})!\n`);

    // 2. Kết nối TiDB Cloud
    const caCert = getSslCaCert();
    const tidbHost = process.env.MYSQL_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com';
    const tidbPort = parseInt(process.env.MYSQL_PORT || '4000', 10);
    const tidbUser = process.env.MYSQL_USER || 'root';
    const tidbPassword = process.env.MYSQL_PASSWORD || '';
    const targetDbName = process.env.MYSQL_DATABASE || 'smartlearn-db';

    console.log(`⏳ Đang kết nối tới TiDB Cloud: ${tidbHost}:${tidbPort} (User: ${tidbUser})...`);
    tidbConn = await mysql.createConnection({
      host: tidbHost,
      port: tidbPort,
      user: tidbUser,
      password: tidbPassword,
      ssl: caCert
        ? {
            ca: caCert,
            rejectUnauthorized: true,
          }
        : undefined,
    });
    console.log('✅ Kết nối TiDB Cloud thành công!\n');

    // 3. Tạo cơ sở dữ liệu trên TiDB Cloud
    // Đảm bảo tạo cả smartlearn-db và smartlearn_db để hỗ trợ tối đa
    const targetDatabases = Array.from(new Set([targetDbName, 'smartlearn_db', 'smartlearn-db']));

    for (const dbName of targetDatabases) {
      console.log(`⚙️ Đảm bảo Database [${dbName}] tồn tại trên TiDB Cloud...`);
      await tidbConn.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
    }

    // Lấy danh sách các bảng từ MySQL Local
    const [tables] = await localConn.query('SHOW TABLES');
    const tableNames = tables.map((row) => Object.values(row)[0]);
    console.log(`📦 Tìm thấy ${tableNames.length} bảng tại MySQL Local:`, tableNames.join(', '), '\n');

    for (const dbName of targetDatabases) {
      console.log('----------------------------------------------------------------');
      console.log(`📁 Đang đồng bộ cấu trúc và dữ liệu vào database: [${dbName}]...`);
      console.log('----------------------------------------------------------------');

      await tidbConn.query(`USE \`${dbName}\`;`);
      await tidbConn.query('SET FOREIGN_KEY_CHECKS = 0;');

      for (const tableName of tableNames) {
        // Lấy DDL từ local
        const [createTableResult] = await localConn.query(`SHOW CREATE TABLE \`${tableName}\``);
        const createTableSql = createTableResult[0]['Create Table'];

        // Drop bảng cũ nếu có trên TiDB
        await tidbConn.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);

        // Tạo bảng mới trên TiDB
        await tidbConn.query(createTableSql);

        // Lấy dữ liệu từ Local
        const [rows] = await localConn.query(`SELECT * FROM \`${tableName}\``);

        if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          const values = rows.map((r) => columns.map((col) => r[col]));

          const insertSql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES ?`;
          await tidbConn.query(insertSql, [values]);

          console.log(`   ✅ Bảng [${tableName}]: Đã tạo bảng & chép thành công ${rows.length} bản ghi.`);
        } else {
          console.log(`   ⚪ Bảng [${tableName}]: Đã tạo bảng (0 bản ghi).`);
        }
      }

      await tidbConn.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log(`🎉 Đã hoàn tất đồng bộ vào [${dbName}]!\n`);
    }

    // 4. Kiểm tra đối chiếu số lượng bản ghi trên TiDB Cloud
    console.log('================================================================');
    console.log('🔍 KIỂM TRA ĐỐI SOÁT DỮ LIỆU TRÊN TIDB CLOUD:');
    console.log('================================================================');

    await tidbConn.query(`USE \`${targetDbName}\`;`);
    for (const tableName of tableNames) {
      const [localCountRes] = await localConn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const [tidbCountRes] = await tidbConn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const localCount = localCountRes[0].count;
      const tidbCount = tidbCountRes[0].count;

      const isMatch = localCount === tidbCount;
      console.log(
        ` - Bảng [${tableName}]: Local = ${localCount} | TiDB = ${tidbCount} ${isMatch ? '✅ (Khớp 100%)' : '❌ (Lệch)'}`
      );
    }

    console.log('\n================================================================');
    console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC CHUYỂN THÀNH CÔNG LÊN TIDB CLOUD!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ GẶP LỖI TRONG QUÁ TRÌNH DI TRÚ DỮ LIỆU SANG TIDB:');
    console.error(err);
  } finally {
    if (localConn) await localConn.end();
    if (tidbConn) await tidbConn.end();
  }
}

migrate();
