import React from 'react';
import { FaInstagram, FaFacebook, FaTelegram, FaGithub } from "react-icons/fa";

const socials = [
  { name: "Instagram", icon: FaInstagram, color: "btn-error",   href: "#" },
  { name: "Facebook",  icon: FaFacebook,  color: "btn-info",    href: "#" },
  { name: "Telegram",  icon: FaTelegram,  color: "btn-info",    href: "#" },
  { name: "GitHub",    icon: FaGithub,    color: "btn-neutral", href: "#" },
];

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
      {/* القسم السفلي: الحقوق ووسائل التواصل الاجتماعي */}
      
            {/* ===== تواصل معنا ===== */}
      <section className="text-center bg-base-200">
        <h2 className="text-2xl font-black mb-2 text-base-content">تواصل معنا</h2>
        <p className="text-base-content/60 mb-10">تابعنا على منصات التواصل الاجتماعي</p>

        <div className="flex flex-wrap justify-center gap-4">
          {socials.map(({ name, icon: Icon, color, href }) => (
            <a key={name} href={href} className={`btn ${color} btn-outline gap-2`}>
              <Icon size={20} />
              {name}
            </a>
          ))}
        </div>
      </section>
      
      <div className="footer footer-center p-4 bg-base-300 text-base-content rounded mt-10">
        <aside>
          <p>© {new Date().getFullYear()} - جميع الحقوق محفوظة لشركة XYZ التقنية</p>
        </aside>
      </div>
    </footer>
  );
};

export default Footer;
