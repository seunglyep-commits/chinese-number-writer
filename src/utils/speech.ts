// 중국어 TTS 음성 재생 유틸리티

let chineseVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

export function initVoices(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // 중국어 음성(zh-CN, zh, Mandarin 등) 탐색
        const zh = voices.find(v => v.lang.toLowerCase() === 'zh-cn' || v.lang.toLowerCase() === 'zh_cn') ||
                   voices.find(v => v.lang.toLowerCase().startsWith('zh')) ||
                   voices.find(v => v.name.includes('Chinese') || v.name.includes('Mandarin'));
        chineseVoice = zh || null;
        voicesLoaded = true;
        resolve(chineseVoice);
      }
    };

    updateVoices();
    if (!voicesLoaded) {
      window.speechSynthesis.onvoiceschanged = () => {
        updateVoices();
      };
      // 1초 후에도 안 불리면 null 반환
      setTimeout(() => {
        if (!voicesLoaded) resolve(null);
      }, 1000);
    }
  });
}

export function playChineseAudio(text: string, rate: number = 0.85): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // 이전 음성 중단

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = rate; // 초보 학습자를 위해 기본적으로 살짝 또박또박한 0.85 속도
      utterance.pitch = 1.0;

      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}

// 음성 인식(STT) 지원 여부 확인
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}
