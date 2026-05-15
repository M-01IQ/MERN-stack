import Posts from '../Component/common/Posts';

import { FaInstagram, FaFacebook, FaTelegram, FaGithub } from "react-icons/fa";

const socials = [
  { name: "Instagram", icon: FaInstagram, color: "btn-error",   href: "#" },
  { name: "Facebook",  icon: FaFacebook,  color: "btn-info",    href: "#" },
  { name: "Telegram",  icon: FaTelegram,  color: "btn-info",    href: "#" },
  { name: "GitHub",    icon: FaGithub,    color: "btn-neutral", href: "#" },
];

export default function HomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-base-100 pt-5">
      
      {/* ===== POSTS ===== */}
      
      <Posts></Posts>
      
      
      {/* ===== تواصل معنا ===== */}
      <section className="py-16 px-6 text-center bg-base-100">
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

    </div>
  );
}