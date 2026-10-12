// ScoreControls.tsx
interface Props {
    isPlaying: boolean;
    isLoaded: boolean;
    onToggle: () => void;
    onStop: () => void;
  }
  
  export default function ScoreControls({ isPlaying, isLoaded, onToggle, onStop }: Props) {
    return (
      <div className="flex items-center gap-6 mb-8 p-4 bg-slate-900 rounded-2xl text-white shadow-inner">
        <button 
          onClick={onToggle} 
          disabled={!isLoaded}
          className={`px-10 py-3 rounded-full font-black transition-all active:scale-95 ${
            !isLoaded ? 'bg-gray-700' : isPlaying ? 'bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {!isLoaded ? "LOADING..." : isPlaying ? "⏸️ PAUSE" : "▶️ PLAY"}
        </button>
        
        <button 
          onClick={onStop}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-full text-sm font-bold"
        >
          STOP
        </button>
      </div>
    );
  }