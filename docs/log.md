import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, AlertTriangle, Volume2 } from 'lucide-react';

// 🎨 SignalCraft 디자인 시스템 컬러
const COLORS = {
  background: '#050505',
  normal: '#00FF9D',   // Neon Green
  warning: '#FF5E00',  // Neon Orange
  critical: '#FF0055', // Neon Red
};

export default function App() {
  const [status, setStatus] = useState('normal');
  const [audioLevel, setAudioLevel] = useState(new Array(40).fill(10)); // 40개의 파동 바
  const animationRef = useRef(null);
  
  const currentColor = COLORS[status];

  // 🔊 가상의 오디오 데이터 생성 (애니메이션 루프)
  useEffect(() => {
    const updateAudioData = () => {
      // 상태에 따라 파동의 격렬함(Amplitude) 결정
      let baseAmp = status === 'normal' ? 20 : status === 'warning' ? 50 : 90;
      let speed = status === 'normal' ? 0.05 : status === 'warning' ? 0.1 : 0.2;

      setAudioLevel(prev => prev.map((_, i) => {
        // Perlin Noise와 비슷한 효과를 위해 Math.sin 사용 + 랜덤 노이즈
        const time = Date.now() * speed;
        const wave = Math.sin(i * 0.5 + time) * 0.5 + 0.5; 
        const noise = Math.random() * 0.5;
        return 10 + (baseAmp * wave * noise) + (Math.random() * baseAmp * 0.3);
      }));

      animationRef.current = requestAnimationFrame(updateAudioData);
    };

    animationRef.current = requestAnimationFrame(updateAudioData);
    return () => cancelAnimationFrame(animationRef.current);
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen overflow-hidden relative font-mono select-none" style={{ backgroundColor: COLORS.background }}>
      
      {/* 🎥 스타일 정의 */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.1; }
          100% { transform: scale(3); opacity: 0; }
        }
        .status-glow {
          box-shadow: 0 0 80px ${currentColor}40, inset 0 0 20px ${currentColor};
        }
        .neon-text {
          text-shadow: 0 0 10px ${currentColor};
        }
      `}</style>

      {/* 1️⃣ 배경 배경 파동 (Echo Effect) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full border border-opacity-20" style={{ borderColor: currentColor, animation: 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
        <div className="w-64 h-64 rounded-full border border-opacity-20 absolute" style={{ borderColor: currentColor, animation: 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '1s' }} />
      </div>

      {/* 2️⃣ 메인 비주얼라이저 (Circular Audio Spectrum) */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        
        {/* 회전하는 링 */}
        <div className="absolute inset-0 border border-neutral-800 rounded-full animate-[spin-slow_20s_linear_infinite] opacity-30 border-dashed" />
        <div className="absolute inset-4 border border-neutral-900 rounded-full animate-[spin-slow_15s_linear_infinite_reverse] opacity-50" />

        {/* 🌊 오디오 파동 바 (Bars) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {audioLevel.map((height, i) => {
            const rotation = (i / audioLevel.length) * 360;
            return (
              <div
                key={i}
                className="absolute w-1.5 origin-bottom rounded-full transition-all duration-75"
                style={{
                  height: `${height}px`,
                  backgroundColor: currentColor,
                  transform: `rotate(${rotation}deg) translateY(-60px)`, // 원형 배치
                  opacity: 0.8,
                  boxShadow: `0 0 10px ${currentColor}`
                }}
              />
            );
          })}
        </div>

        {/* 중앙 코어 (Core) */}
        <div className="absolute w-32 h-32 rounded-full bg-black z-10 flex items-center justify-center border-2 status-glow transition-colors duration-500" style={{ borderColor: currentColor }}>
           <div className="text-center">
             <Activity className="w-8 h-8 mx-auto mb-1 transition-colors duration-500" color={currentColor} />
             <span className="text-xs font-bold tracking-widest text-white opacity-80">{status.toUpperCase()}</span>
           </div>
        </div>
      </div>

      {/* 📝 헤드업 디스플레이 (HUD) */}
      <div className="absolute top-12 w-full max-w-md px-8 flex justify-between items-end z-20">
        <div>
          <h1 className="text-neutral-500 text-[10px] font-bold tracking-[0.4em] mb-1">TARGET SYSTEM</h1>
          <p className="text-white text-xl font-bold tracking-wider neon-text" style={{ color: currentColor }}>COMPRESSOR-X</p>
        </div>
        <div className="text-right">
           <div className="flex items-center gap-2 justify-end mb-1">
             <Volume2 size={14} color={currentColor} />
             <span className="text-neutral-400 text-xs">{status === 'normal' ? '45dB' : status === 'warning' ? '72dB' : '98dB'}</span>
           </div>
           <div className="w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
             <div className="h-full transition-all duration-300" style={{ width: status === 'normal' ? '30%' : status === 'warning' ? '60%' : '95%', backgroundColor: currentColor }} />
           </div>
        </div>
      </div>

      {/* 🕹️ 컨트롤러 */}
      <div className="absolute bottom-12 w-full max-w-sm px-6 z-30">
        <div className="grid grid-cols-3 gap-3 bg-neutral-900/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-800">
            <button onClick={() => setStatus('normal')} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${status === 'normal' ? 'bg-neutral-800 ring-1 ring-[#00FF9D]' : 'hover:bg-neutral-800/50'}`}>
              <Activity size={18} color={status === 'normal' ? '#00FF9D' : '#555'} />
              <span className={`text-[10px] font-bold ${status === 'normal' ? 'text-[#00FF9D]' : 'text-neutral-500'}`}>NORMAL</span>
            </button>
            
            <button onClick={() => setStatus('warning')} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${status === 'warning' ? 'bg-neutral-800 ring-1 ring-[#FF5E00]' : 'hover:bg-neutral-800/50'}`}>
              <AlertTriangle size={18} color={status === 'warning' ? '#FF5E00' : '#555'} />
              <span className={`text-[10px] font-bold ${status === 'warning' ? 'text-[#FF5E00]' : 'text-neutral-500'}`}>WARNING</span>
            </button>

            <button onClick={() => setStatus('critical')} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${status === 'critical' ? 'bg-neutral-800 ring-1 ring-[#FF0055]' : 'hover:bg-neutral-800/50'}`}>
              <Zap size={18} color={status === 'critical' ? '#FF0055' : '#555'} />
              <span className={`text-[10px] font-bold ${status === 'critical' ? 'text-[#FF0055]' : 'text-neutral-500'}`}>CRITICAL</span>
            </button>
        </div>
        <p className="text-center text-[9px] text-neutral-600 mt-4 tracking-widest">SIGNALCRAFT AI • AUDIO DIAGNOSIS MODULE</p>
      </div>

    </div>
  );
}