/**
 * Script sao chép toàn bộ dữ liệu từ MongoDB Local sang MongoDB Atlas
 * Hướng dẫn sử dụng:
 * 1. Điền mật khẩu thật của bạn vào chuỗi kết nối Atlas trong file BackEnd/.env
 *    Ví dụ: MONGODB_URI=mongodb+srv://duynguyenth2004_db_user:MatKhauThatCuaBan@cluster0.k3tli5.mongodb.net/smartlearn_db?retryWrites=true&w=majority
 * 2. Chạy lệnh: node migrate_to_atlas.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const LOCAL_URI = 'mongodb://localhost:27017/smartlearn_db';

// Lấy Atlas URI từ biến môi trường hoặc tham số dòng lệnh
let targetUri = process.argv[2] || process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;

// Nếu URI vẫn đang trỏ về localhost, thử tìm dòng comment trong .env
if (!targetUri || targetUri.includes('localhost') || targetUri.includes('127.0.0.1')) {
  const fs = require('fs');
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const match = envContent.match(/#\s*MONGODB_URI=(mongodb\+srv:\/\/[^\r\n]+)/);
  if (match) {
    targetUri = match[1].trim();
  }
}

async function migrate() {
  console.log('========================================================');
  console.log('🚀 CHƯƠNG TRÌNH SAO CHÉP DỮ LIỆU TỪ LOCAL SANG MONGODB ATLAS');
  console.log('========================================================\n');

  if (!targetUri || targetUri.includes('<db_password>')) {
    console.error('❌ LỖI: Chưa có mật khẩu cơ sở dữ liệu MongoDB Atlas!');
    console.error('👉 Vui lòng thay thế <db_password> bằng mật khẩu thật của bạn.');
    console.error('Cú pháp chạy:');
    console.error('   node migrate_to_atlas.js "mongodb+srv://duynguyenth2004_db_user:MAT_KHAU_THAT@cluster0.k3tli5.mongodb.net/smartlearn_db?retryWrites=true&w=majority"\n');
    process.exit(1);
  }

  // Đảm bảo URI có tên database smartlearn_db
  if (targetUri.startsWith('mongodb+srv://') && !targetUri.includes('/smartlearn_db')) {
    targetUri = targetUri.replace(/\.mongodb\.net\/?(\?.*)?$/, '.mongodb\.net/smartlearn_db$1');
    if (!targetUri.includes('smartlearn_db')) {
      targetUri = targetUri.replace(/\.mongodb\.net\/?/, '.mongodb.net/smartlearn_db?retryWrites=true&w=majority');
    }
  }

  console.log('📍 1. Nguồn (Local):', LOCAL_URI);
  // Ẩn mật khẩu khi in ra console để bảo mật
  const maskedTarget = targetUri.replace(/:([^@]+)@/, ':****@');
  console.log('📍 2. Đích (Atlas):', maskedTarget, '\n');

  let localConn, atlasConn;

  try {
    console.log('⏳ Đang kết nối tới MongoDB Local...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Đã kết nối MongoDB Local thành công!');

    console.log('⏳ Đang kết nối tới MongoDB Atlas (Internet)...');
    atlasConn = await mongoose.createConnection(targetUri).asPromise();
    console.log('✅ Đã kết nối MongoDB Atlas thành công!\n');

    // Lấy danh sách tất cả collections từ Local
    const collections = await localConn.db.listCollections().toArray();
    console.log(`📦 Tìm thấy ${collections.length} bảng dữ liệu (collections) tại Local.\n`);

    let totalTransferred = 0;

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const localCol = localConn.db.collection(colName);
      const atlasCol = atlasConn.db.collection(colName);

      const docs = await localCol.find({}).toArray();
      if (docs.length === 0) {
        console.log(`⚪ Bảng [${colName}]: 0 bản ghi (bỏ qua).`);
        continue;
      }

      console.log(`⏳ Đang chuyển bảng [${colName}]: ${docs.length} bản ghi...`);

      // Sử dụng bulkWrite với upsert để an toàn, không sợ trùng lặp _id nếu chạy lại
      const ops = docs.map((doc) => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true,
        },
      }));

      const res = await atlasCol.bulkWrite(ops);
      console.log(
        `   ✅ [${colName}] -> Đã lưu thành công (Upserted/Matched: ${res.matchedCount + res.upsertedCount})`
      );
      totalTransferred += docs.length;
    }

    console.log('\n========================================================');
    console.log(`🎉 HOÀN TẤT! Đã đồng bộ thành công ${totalTransferred} bản ghi sang MongoDB Atlas!`);
    console.log('========================================================\n');
    console.log('👉 Bước tiếp theo: Cập nhật biến MONGODB_URI trong file BackEnd/.env:');
    console.log(`   MONGODB_URI=${targetUri}\n`);

  } catch (err) {
    console.error('\n❌ GẶP LỖI TRONG QUÁ TRÌNH KẾT NỐI HOẶC CHUYỂN DỮ LIỆU:');
    console.error(err.message);
    console.log('\n💡 GỢI Ý KHẮC PHỤC:');
    console.log('1. Kiểm tra lại MẬT KHẨU tài khoản `duynguyenth2004_db_user` trên MongoDB Atlas.');
    console.log('2. Đảm bảo IP của bạn đã được cho phép (Whitelist) trên MongoDB Atlas:');
    console.log('   - Vào Atlas -> "Network Access" -> chọn "Add IP Address" -> chọn "Allow Access From Anywhere" (0.0.0.0/0).');
    console.log('3. Nếu mật khẩu có ký tự đặc biệt như @, :, /, hãy mã hóa URL hoặc đổi mật khẩu đơn giản hơn.');
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
  }
}

migrate();
