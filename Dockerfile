# 1. استخدام نسخة كاملة ومستقرة من Node.js بدلاً من alpine لتجنب نقص مكتبات النظام
FROM node:20-slim

# 2. تثبيت الحزم الأساسية للنظام التي تحتاجها بعض موديولات الـ WebSockets والـ Native Modules للعمل
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 3. تحديد مجلد العمل
WORKDIR /app

# 4. نسخ ملفات package.json من الـ Root وتثبيت المكتبات المشتركة إن وجدت
COPY package*.json ./

# 5. نسخ ملفات package.json الخاصة بالسيرفر وتثبيتها
COPY server/package*.json ./server/
RUN npm install --production --prefix server

# 6. نسخ كود السيرفر بالكامل
COPY server/ ./server/

# 7. تحديد منفذ الاتصال
EXPOSE 3000

# 8. أمر التشغيل الصريح للسيرفر
CMD ["node", "server.js"]
