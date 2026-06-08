import React, { useState } from 'react';
import Linkify from 'linkify-react';

const ExpandableText = ({ text, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  const renderLink = ({ attributes, content }) => {
  return (
    <a 
      {...attributes} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-primary hover:underline break-all"
    >
      {content}
    </a>
  );
};

  if (text.length <= maxLength) {
    return (
      <p className="text-base-content/70 leading-relaxed whitespace-pre-wrap break-words">
        
        <Linkify options={{ render: renderLink }}>{text}</Linkify>
        
      </p>
    );
  }
  
  const displayedText = isExpanded ? text : text.slice(0, maxLength) + "...";
  
  return (
    <div className="text-right">
      <p className="text-base-content/70 leading-relaxed whitespace-pre-wrap break-words">
        
        <Linkify options={{ render: renderLink }}>{displayedText}</Linkify>
        
      </p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="text-primary hover:underline text-sm font-bold mt-2 focus:outline-none"
      >
        {isExpanded ? "عرض أقل" : "قراءة المزيد"}
      </button>
    </div>
  );
};

export default ExpandableText;
