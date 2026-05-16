const Loader = ({ size = "large" }) => {
  const isSmall = size === "small";

  return (
    <div className={`flex flex-col justify-center items-center ${isSmall ? "h-auto" : "h-[80vh]"} bg-transparent`}>
      <div className="relative flex items-center justify-center">
        {/* أثير النبض */}
        {!isSmall && (
          <div className="absolute animate-ping h-10 w-10 rounded-full bg-info/15"></div>
        )}
        
        {/* دائرة التحميل */}
        <div className={`relative rounded-full border-t-info border-r-transparent border-b-info border-l-transparent animate-spin 
          ${isSmall ? "h-5 w-5 border-2" : "h-8 w-8 border-[3px]"}`}>
        </div>
      </div>

      {/* نص التحميل  */}
      {!isSmall && (
        <p className="mt-3 text-[11px] font-semibold text-slate-400 animate-pulse uppercase tracking-[0.2em]">
          جاري التحميل
        </p>
      )}
    </div>
  );
};

export default Loader;
