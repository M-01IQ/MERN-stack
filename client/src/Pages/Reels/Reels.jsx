import React from "react";
import { ArrowRight, Plus } from "lucide-react";

// المكونات المشتركة والفرعية
import Loader from "../../Component/common/Loader/Loader";
import ReelItem from "./ReelItem";
import UploadModal from "./UploadModal";

// الخطاف المخصص (الذي يحتوي على كل المنطق والأفعال)
import { useReels } from "./useReels";

const Reels = () => {
  const {
    navigate,
    isAdminUser,
    isGlobalMuted,
    isModalOpen,
    setIsModalOpen,
    formLoading,
    uploadProgress,
    selectedFile,
    setSelectedFile,
    activeVideoId,
    newReel,
    setNewReel,
    videoData,
    isLoading,
    activeIndex,
    toggleMute,
    handleDeleteReel,
    handleCreateReel,
    handleCloseModal
  } = useReels();

  if (isLoading && videoData.length === 0) return <Loader />;

  return (
    <div className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar scroll-smooth">
      {/* زر العودة للرئيسية */}
      <button 
        onClick={() => navigate("/")} 
        className="fixed top-6 right-6 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-black/60 transition-all active:scale-90 shadow-2xl"
      >
        <ArrowRight size={24} />
      </button>

      {/* زر فتح مودال الرفع (للأدمن فقط) */}
      {isAdminUser && (
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="fixed top-6 left-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all active:scale-90 shadow-2xl"
        >
          <Plus size={24} />
        </button>
      )}

      {/* مودال الرفع الفرعي للأدمن */}
      {isAdminUser && (
        <UploadModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateReel}
          formLoading={formLoading}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          uploadProgress={uploadProgress}
          newReel={newReel}
          setNewReel={setNewReel}
        />
      )}

      {/* عرض قائمة الفيديوهات */}
      {videoData.length === 0 ? (
        <div className="h-screen w-full flex items-center justify-center text-gray-400">
          لا توجد فيديوهات حالياً.
        </div>
      ) : (
        videoData.map((video, index) => {
          const shouldPreload = index === activeIndex || index === activeIndex + 1;

          return (
            <div key={video._id} data-id={video._id} className="reel-container h-screen w-full snap-start">
              <ReelItem
                id={video._id}
                videoUrl={video.videoUrl}
                userObj={video.userId}
                description={video.description}
                songName={video.songName}
                likes={video.likes}
                comments={video.comments}
                isGlobalMuted={isGlobalMuted}
                toggleMute={toggleMute}
                onDelete={handleDeleteReel}
                isAdminUser={isAdminUser}
                isActive={video._id === activeVideoId} 
                shouldPreload={shouldPreload}         
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default Reels;
