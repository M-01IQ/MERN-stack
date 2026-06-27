import Posts from '../../Component/common/posts/Posts';
import StoriesBar from '../../Component/common/Stories/StoriesBar'
import Footer from '../../Component/common/Footer/Footer'

export default function HomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-base-100 pt-5">
      
      {/* =====STORIES===== */}
      <StoriesBar></StoriesBar>
      {/* ===== POSTS ===== */}
      <Posts></Posts>
      {/* ===== FOOTER ===== */}
      <Footer></Footer>
      
    </div>
  );
}