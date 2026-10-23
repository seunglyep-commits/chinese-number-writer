export interface ChineseWordSample {
  chinese: string;
  pinyin: string;
  korean: string;
}

export interface ChineseNumberData {
  id: number;
  value: number | string;
  char: string;
  traditional?: string;
  pinyin: string;
  pinyinToneNumber: string;
  tone: number; // 1, 2, 3, 4, 0(경성)
  toneName: string;
  toneTip: string;
  koreanSound: string;
  koreanMeaning: string;
  strokeCount: number;
  strokeSteps: string[];
  handGesture: {
    title: string;
    description: string;
    symbol: string;
  };
  mnemonic: string; // 기억하기 쉬운 연상 팁
  sampleWords: ChineseWordSample[];
  strokePaths: string[]; // SVG viewBox="0 0 100 100" 기준 대표 패스
}

export const CHINESE_NUMBERS: ChineseNumberData[] = [
  {
    id: 0,
    value: 0,
    char: '零',
    pinyin: 'líng',
    pinyinToneNumber: 'ling2',
    tone: 2,
    toneName: '제2성 (양평성 ↗)',
    toneTip: '질문할 때 "응?" 하듯이 중간 높이에서 높은 곳으로 가볍게 올려 발음합니다.',
    koreanSound: '령(영)',
    koreanMeaning: '영 (0)',
    strokeCount: 13,
    strokeSteps: [
      '1~8획: 비 우(雨) 머리를 씁니다 (가로, 세로, 꺾임, 점 네 개).',
      '9~13획: 아래 령(令) 자를 씁니다 (사람인 변 + 점, 꺾임).'
    ],
    handGesture: {
      title: '영(0) 손동작',
      description: '엄지와 검지를 둥글게 모아 알파벳 O 모양을 만들어 숫자 0을 나타냅니다.',
      symbol: '👌'
    },
    mnemonic: '비(雨)가 내려 땅에 물방울이 맺힌(令) 모습에서 아무것도 남지 않은 "0(영)"을 연상해 보세요.',
    sampleWords: [
      { chinese: '零下', pinyin: 'língxià', korean: '영하 (영하의 날씨)' },
      { chinese: '二零二六', pinyin: 'èr líng èr liù', korean: '2026 (년도 표기)' },
      { chinese: '零钱', pinyin: 'língqián', korean: '잔돈, 거스름돈' }
    ],
    strokePaths: [
      'M 25,20 L 75,20',
      'M 50,20 L 50,38',
      'M 20,28 L 80,28 L 80,38 L 20,38 Z',
      'M 35,32 L 35,35', 'M 45,32 L 45,35', 'M 55,32 L 55,35', 'M 65,32 L 65,35',
      'M 50,45 L 25,60', 'M 50,45 L 75,60',
      'M 45,62 L 55,62 L 50,85'
    ]
  },
  {
    id: 1,
    value: 1,
    char: '一',
    pinyin: 'yī',
    pinyinToneNumber: 'yi1',
    tone: 1,
    toneName: '제1성 (음평성 →)',
    toneTip: '솔(Sol) 음높이로 높고 길게 평평하게 쭉 뻗으며 "이-" 하고 발음합니다.',
    koreanSound: '일',
    koreanMeaning: '하나 (1)',
    strokeCount: 1,
    strokeSteps: [
      '1획: 왼쪽에서 오른쪽으로 수평으로 쭉 긋습니다 (횡 획, 横 héng).'
    ],
    handGesture: {
      title: '일(1) 손동작',
      description: '검지 손가락 하나를 위로 곧게 폅니다.',
      symbol: '☝️'
    },
    mnemonic: '손가락 하나를 옆으로 눕혀 놓은 듯한 가장 단순하고 명확한 시작선입니다.',
    sampleWords: [
      { chinese: '一个', pinyin: 'yí gè', korean: '한 개 (수량)' },
      { chinese: '一月', pinyin: 'yī yuè', korean: '1월' },
      { chinese: '一起', pinyin: 'yì qǐ', korean: '함께, 같이' }
    ],
    strokePaths: [
      'M 15,50 L 85,50'
    ]
  },
  {
    id: 2,
    value: 2,
    char: '二',
    pinyin: 'èr',
    pinyinToneNumber: 'er4',
    tone: 4,
    toneName: '제4성 (거성 ↘)',
    toneTip: '높은 음에서 아래로 "앋!" 하듯이 절도 있게 뚝 떨어뜨리며 혀를 살짝 말아 "얼!" 발음합니다.',
    koreanSound: '이',
    koreanMeaning: '둘 (2)',
    strokeCount: 2,
    strokeSteps: [
      '1획: 위에 짧은 가로획을 왼쪽에서 오른쪽으로 긋습니다.',
      '2획: 아래에 더 긴 가로획을 균형을 맞춰 긋습니다.'
    ],
    handGesture: {
      title: '이(2) 손동작',
      description: '검지와 중지를 펴서 브이(V) 형태를 만듭니다.',
      symbol: '✌️'
    },
    mnemonic: '위는 하늘, 아래는 땅, 두 개의 수평선이 조화를 이루는 둘(2)입니다.',
    sampleWords: [
      { chinese: '二月', pinyin: 'èr yuè', korean: '2월' },
      { chinese: '二十', pinyin: 'èr shí', korean: '20 (이십)' },
      { chinese: '星期二', pinyin: 'xīngqī\'èr', korean: '화요일' }
    ],
    strokePaths: [
      'M 25,35 L 75,35',
      'M 15,68 L 85,68'
    ]
  },
  {
    id: 3,
    value: 3,
    char: '三',
    pinyin: 'sān',
    pinyinToneNumber: 'san1',
    tone: 1,
    toneName: '제1성 (음평성 →)',
    toneTip: '높은 솔(Sol) 음으로 흔들리지 않고 평평하게 "싼-" 하고 발음합니다.',
    koreanSound: '삼',
    koreanMeaning: '셋 (3)',
    strokeCount: 3,
    strokeSteps: [
      '1획: 맨 위의 가로획을 중간 길이로 긋습니다.',
      '2획: 가운데 가로획을 가장 짧게 긋습니다.',
      '3획: 맨 아래 가로획을 가장 길고 안정감 있게 받쳐줍니다.'
    ],
    handGesture: {
      title: '삼(3) 손동작',
      description: '엄지와 새끼를 접고, 검지·중지·약지 3개 손가락을 곧게 폅니다.',
      symbol: '🤟'
    },
    mnemonic: '중간 획이 가장 짧고, 맨 아래 획이 가장 길다는 규칙을 기억하면 예쁜 글씨가 완성됩니다.',
    sampleWords: [
      { chinese: '三月', pinyin: 'sān yuè', korean: '3월' },
      { chinese: '三十', pinyin: 'sān shí', korean: '30 (삼십)' },
      { chinese: '三角形', pinyin: 'sānjiǎoxíng', korean: '삼각형' }
    ],
    strokePaths: [
      'M 25,30 L 75,30',
      'M 32,50 L 68,50',
      'M 15,70 L 85,70'
    ]
  },
  {
    id: 4,
    value: 4,
    char: '四',
    pinyin: 'sì',
    pinyinToneNumber: 'si4',
    tone: 4,
    toneName: '제4성 (거성 ↘)',
    toneTip: '위에서 아래로 단호하게 내리꽂듯이 "쓰!" 하고 짧고 강하게 발음합니다.',
    koreanSound: '사',
    koreanMeaning: '넷 (4)',
    strokeCount: 5,
    strokeSteps: [
      '1획: 왼쪽 세로획을 내립니다 (竖 shù).',
      '2획: 위 가로로 가다 오른쪽 아래로 꺾어 내립니다 (横折 hénzhé).',
      '3획: 안쪽 왼쪽 삐침을 씁니다 (撇 piě).',
      '4획: 안쪽 오른쪽 꺾임을 씁니다 (竖弯 shùwān).',
      '5획: 맨 아래를 가로로 닫아줍니다 (안쪽을 채운 뒤 마지막에 닫기!).'
    ],
    handGesture: {
      title: '사(4) 손동작',
      description: '엄지만 손바닥 쪽으로 접고, 나머지 4개 손가락을 가지런히 폅니다.',
      symbol: '🖐️'
    },
    mnemonic: '창문(네모 틀) 안에 커튼 두 자락(안쪽 획)이 펄럭이는 모습을 연상해보세요.',
    sampleWords: [
      { chinese: '四月', pinyin: 'sì yuè', korean: '4월' },
      { chinese: '四季', pinyin: 'sì jì', korean: '사계절 (춘하추동)' },
      { chinese: '十四', pinyin: 'shí sì', korean: '14 (십사)' }
    ],
    strokePaths: [
      'M 20,20 L 20,80',
      'M 20,20 L 80,20 L 80,80',
      'M 38,35 Q 35,55 30,65',
      'M 58,35 L 58,55 Q 60,65 70,65',
      'M 20,80 L 80,80'
    ]
  },
  {
    id: 5,
    value: 5,
    char: '五',
    pinyin: 'wǔ',
    pinyinToneNumber: 'wu3',
    tone: 3,
    toneName: '제3성 (상성 ∨)',
    toneTip: '낮게 내려갔다가 다시 부드럽게 끌어올리며 "우-우~" 하듯이 발음합니다.',
    koreanSound: '오',
    koreanMeaning: '다섯 (5)',
    strokeCount: 4,
    strokeSteps: [
      '1획: 맨 위 가로획을 긋습니다.',
      '2획: 왼쪽에서 비스듬하게 세로획을 내립니다.',
      '3획: 가운데에서 오른쪽으로 꺾어 내립니다 (横折).',
      '4획: 맨 아래 가로획을 길게 그어 받칩니다.'
    ],
    handGesture: {
      title: '오(5) 손동작',
      description: '손바닥을 활짝 펴서 다섯 손가락 모두를 보여줍니다.',
      symbol: '✋'
    },
    mnemonic: '위와 아래 두 개의 기둥 사이로 선들이 단단하게 교차하는 다섯(5)입니다.',
    sampleWords: [
      { chinese: '五月', pinyin: 'wǔ yuè', korean: '5월' },
      { chinese: '五十', pinyin: 'wǔ shí', korean: '50 (오십)' },
      { chinese: '五官', pinyin: 'wǔguān', korean: '이목구비 (오관)' }
    ],
    strokePaths: [
      'M 25,25 L 75,25',
      'M 48,25 L 42,55',
      'M 42,55 L 70,55 L 70,75',
      'M 15,80 L 85,80'
    ]
  },
  {
    id: 6,
    value: 6,
    char: '六',
    pinyin: 'liù',
    pinyinToneNumber: 'liu4',
    tone: 4,
    toneName: '제4성 (거성 ↘)',
    toneTip: '높은 음에서 힘있게 "리오우!" 하고 아래로 뚝 떨어뜨려 발음합니다.',
    koreanSound: '륙(육)',
    koreanMeaning: '여섯 (6)',
    strokeCount: 4,
    strokeSteps: [
      '1획: 맨 위에 점(点 diǎn)을 콕 찍습니다.',
      '2획: 아래에 수평 가로획을 긋습니다.',
      '3획: 왼쪽 아래로 삐쳐 내립니다 (撇).',
      '4획: 오른쪽 아래로 점 또는 파임을 내립니다 (捺 nà).'
    ],
    handGesture: {
      title: '육(6) 손동작 (★중국 고유 손짓)',
      description: '엄지와 새끼손가락만 펴고 가운데 세 손가락은 접습니다. 전화기 모양(🤙)!',
      symbol: '🤙'
    },
    mnemonic: '사람이 두 다리를 딛고 서 있는 머리와 어깨 모양처럼 생겼습니다.',
    sampleWords: [
      { chinese: '六月', pinyin: 'liù yuè', korean: '6월' },
      { chinese: '六十六', pinyin: 'liù shí liù', korean: '66' },
      { chinese: '六六大顺', pinyin: 'liù liù dà shùn', korean: '모든 일이 순조롭길 바라는 길한 성어' }
    ],
    strokePaths: [
      'M 50,18 L 52,30',
      'M 18,35 L 82,35',
      'M 36,48 Q 28,68 20,80',
      'M 64,48 Q 72,68 80,80'
    ]
  },
  {
    id: 7,
    value: 7,
    char: '七',
    pinyin: 'qī',
    pinyinToneNumber: 'qi1',
    tone: 1,
    toneName: '제1성 (음평성 →)',
    toneTip: '바람이 빠지는 듯한 맑은 소리로 높은 톤에서 "치-" 하고 곧게 뻗어줍니다.',
    koreanSound: '칠',
    koreanMeaning: '일곱 (7)',
    strokeCount: 2,
    strokeSteps: [
      '1획: 왼쪽 아래에서 오른쪽 위로 살짝 올라가는 가로획을 긋습니다.',
      '2획: 위에서 아래로 내려오다 오른쪽으로 둥글게 꺾어 갈고리로 찹니다 (竖弯钩 shùwāngōu).'
    ],
    handGesture: {
      title: '칠(7) 손동작 (★중국 고유 손짓)',
      description: '엄지, 검지, 중지 끝 세 개를 모아서 앞을 향하게 세웁니다 (돈 모양이나 꼬집는 모양).',
      symbol: '🤌'
    },
    mnemonic: '아라비아 숫자 7을 거꾸로 뒤집어 놓은 듯한 갈고리 모양을 닮았습니다.',
    sampleWords: [
      { chinese: '七月', pinyin: 'qī yuè', korean: '7월' },
      { chinese: '七夕', pinyin: 'qīxī', korean: '칠석 (견우와 직녀의 날)' },
      { chinese: '七十七', pinyin: 'qī shí qī', korean: '77' }
    ],
    strokePaths: [
      'M 20,48 L 78,38',
      'M 45,20 L 45,68 Q 45,80 62,80 L 72,80 L 75,72'
    ]
  },
  {
    id: 8,
    value: 8,
    char: '八',
    pinyin: 'bā',
    pinyinToneNumber: 'ba1',
    tone: 1,
    toneName: '제1성 (음평성 →)',
    toneTip: '입술을 모았다가 터뜨리듯 높은 톤으로 "빠-" 하고 맑게 냅니다.',
    koreanSound: '팔',
    koreanMeaning: '여덟 (8)',
    strokeCount: 2,
    strokeSteps: [
      '1획: 왼쪽에서 왼쪽 아래로 부드럽게 삐칩니다 (撇).',
      '2획: 조금 떨어진 오른쪽 높은 곳에서 시작해 오른쪽 아래로 길게 뺍니다 (捺).'
    ],
    handGesture: {
      title: '팔(8) 손동작 (★중국 고유 손짓)',
      description: '엄지와 검지를 쫙 펴서 권총 모양을 만듭니다. 중국인이 가장 좋아하는 부자(发财)의 상징!',
      symbol: '👉'
    },
    mnemonic: '두 사람이 서로 등을 맞대고 기대며 양쪽으로 뻗어 나가는 모습입니다.',
    sampleWords: [
      { chinese: '八月', pinyin: 'bā yuè', korean: '8월' },
      { chinese: '八宝饭', pinyin: 'bābǎofàn', korean: '팔보반 (달콤한 전통 찹쌀밥)' },
      { chinese: '八十八', pinyin: 'bā shí bā', korean: '88' }
    ],
    strokePaths: [
      'M 42,30 Q 35,55 22,75',
      'M 54,20 Q 64,55 82,80'
    ]
  },
  {
    id: 9,
    value: 9,
    char: '九',
    pinyin: 'jiǔ',
    pinyinToneNumber: 'jiu3',
    tone: 3,
    toneName: '제3성 (상성 ∨)',
    toneTip: '낮은 곳으로 깊숙이 내려갔다가 살짝 위로 튕기며 "지오~우" 하고 냅니다.',
    koreanSound: '구',
    koreanMeaning: '아홉 (9)',
    strokeCount: 2,
    strokeSteps: [
      '1획: 위에서 왼쪽 아래로 힘있게 삐쳐 내립니다 (撇).',
      '2획: 가로로 꺾어 내려와 부드럽게 굴려 위로 갈고리를 찹니다 (横折弯钩 hénzhéwāngōu).'
    ],
    handGesture: {
      title: '구(9) 손동작 (★중국 고유 손짓)',
      description: '검지 손가락 하나만 구부려서 갈고리 모양(문고리 형태)을 만듭니다.',
      symbol: '☝️'
    },
    mnemonic: '용이 꼬리를 휘감고 하늘로 솟아오르는 신비로운 갈고리 형상입니다.',
    sampleWords: [
      { chinese: '九月', pinyin: 'jiǔ yuè', korean: '9월' },
      { chinese: '九十', pinyin: 'jiǔ shí', korean: '90 (구십)' },
      { chinese: '长长久久', pinyin: 'cháng cháng jiǔ jiǔ', korean: '오래오래 영원하길 (동음어 연상)' }
    ],
    strokePaths: [
      'M 42,20 Q 38,55 25,80',
      'M 28,40 L 65,30 Q 72,30 70,55 L 68,70 Q 67,82 78,80 L 82,75'
    ]
  },
  {
    id: 10,
    value: 10,
    char: '十',
    pinyin: 'shí',
    pinyinToneNumber: 'shi2',
    tone: 2,
    toneName: '제2성 (양평성 ↗)',
    toneTip: '혀끝을 입천장 뒤쪽으로 살짝 말아 올리며(권설음) "쉬↗" 하고 위로 올립니다.',
    koreanSound: '십',
    koreanMeaning: '열 (10)',
    strokeCount: 2,
    strokeSteps: [
      '1획: 가로획을 왼쪽에서 오른쪽으로 먼저 긋습니다 (横).',
      '2획: 한가운데를 관통하여 세로획을 곧게 내립니다 (竖).'
    ],
    handGesture: {
      title: '십(10) 손동작 (★중국 고유 손짓)',
      description: '두 손의 검지를 십자가(十)로 교차하거나, 한 손으로 주먹(✊)을 쥡니다.',
      symbol: '✊'
    },
    mnemonic: '가로와 세로가 정확히 100% 빈틈없이 맞아떨어진 완전함(십전십미 十全十美)의 상징입니다.',
    sampleWords: [
      { chinese: '十月', pinyin: 'shí yuè', korean: '10월' },
      { chinese: '十分', pinyin: 'shí fēn', korean: '매우, 몹시, 대단히 (10점 만점)' },
      { chinese: '十全十美', pinyin: 'shí quán shí měi', korean: '완벽무결하다' }
    ],
    strokePaths: [
      'M 18,50 L 82,50',
      'M 50,18 L 50,85'
    ]
  }
];

// 성조 색상 매핑
export const TONE_COLORS = {
  1: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-300', light: 'bg-red-50', badge: '1성 (음평성)' },
  2: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-300', light: 'bg-amber-50', badge: '2성 (양평성)' },
  3: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-300', light: 'bg-emerald-50', badge: '3성 (상성)' },
  4: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-300', light: 'bg-blue-50', badge: '4성 (거성)' },
  0: { bg: 'bg-gray-400', text: 'text-gray-500', border: 'border-gray-200', light: 'bg-gray-50', badge: '경성' }
};
