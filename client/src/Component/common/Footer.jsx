import React from 'react';

const Footer = () => {
  return (
    <footer className="footer p-10 bg-base-200 text-base-content border-t border-base-300">
      {/* القسم الأول: معلومات عن الموقع / اللوجو */}
      <aside>
        <div className="flex items-center gap-2 mb-2">
           <div className="bg-primary p-2 rounded-lg text-primary-content font-bold">
             Logo
           </div>
           <span className="text-xl font-bold tracking-tight">اسم الموقع</span>
        </div>
        <p className="max-w-xs">
          نقدم أفضل الحلول التقنية لتطوير أعمالكم.
          <br />
          خبرة تمتد لسنوات في البرمجة والتصميم.
        </p>
      </aside>

      {/* القسم الثاني: روابط الخدمات */}
      <nav>
        <h6 className="footer-title opacity-100 text-primary">الخدمات</h6>
        <a className="link link-hover">تصميم المواقع</a>
        <a className="link link-hover">تطبيقات الجوال</a>
        <a className="link link-hover">التسويق الرقمي</a>
        <a className="link link-hover">الاستشارات الفنية</a>
      </nav>

      {/* القسم الثالث: روابط الشركة */}
      <nav>
        <h6 className="footer-title opacity-100 text-primary">الشركة</h6>
        <a className="link link-hover">من نحن</a>
        <a className="link link-hover">تواصل معنا</a>
        <a className="link link-hover">الوظائف</a>
        <a className="link link-hover">الصحافة</a>
      </nav>

      {/* القسم الرابع: السياسات والخصوصية */}
      <nav>
        <h6 className="footer-title opacity-100 text-primary">قانوني</h6>
        <a className="link link-hover">شروط الاستخدام</a>
        <a className="link link-hover">سياسة الخصوصية</a>
        <a className="link link-hover">سياسة الكوكيز</a>
      </nav>

      {/* القسم السفلي: الحقوق ووسائل التواصل الاجتماعي */}
      <div className="footer footer-center p-4 bg-base-300 text-base-content rounded mt-10">
        <aside>
          <p>© {new Date().getFullYear()} - جميع الحقوق محفوظة لشركة XYZ التقنية</p>
        </aside>
      </div>
    </footer>
  );
};

export default Footer;
