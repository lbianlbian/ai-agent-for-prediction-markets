import { useState } from 'react';
import type { Message } from "../types"

interface VideoOverlayProps {
  messages: Message[]
}

const VideoOverlay = ({messages}: VideoOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  if(messages.length > 0){
    return <> </>
  }

  return (
    <>
      {/* Bottom-right clickable icon */}
      
<div 
  className="video-icon"
  onClick={() => setIsOpen(true)}
  style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '80px',
    height: '45px',  // 16:9 aspect ratio
    backgroundImage: `url('/introthumbnail.jpeg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    zIndex: 10000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    border: '3px solid rgba(255,255,255,0.8)',
  }}
>
</div>


      {/* Expanded overlay */}
      {isOpen && (
        <div 
          className="video-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Close X button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '30px',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10002
            }}
          >
            ×
          </button>

          {/* ScreenPal embed - full size in overlay */}
          <div 
            className="sp-embed-player" 
            data-id="cTl0h2nYsfP" 
            data-aspect-ratio="1.068249" 
            style={{ 
              position: 'relative', 
              width: '90vw', 
              maxWidth: '800px',
              height: 0, 
              paddingTop: '93.611111%' 
            }}
          >
            <script src="https://go.screenpal.com/player/appearance/cTl0hvnYs1H"></script>
            <iframe 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                border: 0 
              }} 
              scrolling="no" 
              src="https://go.screenpal.com/player/cTl0hvnYs1H?ff=1&title=0" 
              allowFullScreen 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VideoOverlay;
