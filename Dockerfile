# 1. جلب نسخة Node.js
FROM node:20-alpine

# 2. تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# 3. نسخ ملفات package.json من الـ Root لتثبيت أي موديولات مشتركة إن وجدت
COPY package*.json ./

# 4. نسخ ملفات package.json الخاصة بمجلد السيرفر وتثبيت المكتبات
COPY server/package*.json ./server/
RUN npm install --production --prefix server

# 5. نسخ كود السيرفر بالكامل إلى داخل الحاوية
COPY server/ ./server/

# 6. تحديد منفذ الاتصال
EXPOSE 3000

# 7. أمر تشغيل السيرفر من داخل مجلد server
CMD ["npm", "start", "--prefix", "server"]
