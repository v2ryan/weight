import React, { useState, useMemo } from 'react';

// ==================== 動態題庫生成器 ====================
const generateQuestions = (count, difficulty, questionType) => {
  const questions = [];
  
  const allTypes = ['gram-scale', 'kg-scale', 'division', 'balance', 'compare', 'combo-scale-balance'];
  let types;
  
  if (questionType === 'all') {
    types = allTypes;
  } else if (questionType === 'scale') {
    types = ['gram-scale', 'kg-scale'];
  } else if (questionType === 'division') {
    types = ['division'];
  } else if (questionType === 'balance') {
    types = ['balance'];
  } else if (questionType === 'compare') {
    types = ['compare'];
  } else if (questionType === 'combo') {
    types = ['combo-scale-balance'];
  } else {
    types = allTypes;
  }
  
  const config = difficulty === 'easy' ? {
    gramScale: {
      maxOptions: [500, 800],
      majorSteps: [100],
      minorDivisor: 2,
    },
    kgScale: {
      max: 5,
      majorStep: 1,
      minorStep: 0.5,
      decimals: [0, 0.5],
    },
    division: {
      counts: [2, 4, 5, 10],
      totalWeights: [100, 200, 400, 500, 800, 1000],
    },
    balance: {
      weightSets: [
        ['500g', '200g'],
        ['1kg', '100g'],
        ['500g', '500g'],
        ['1kg', '200g', '100g'],
        ['500g', '200g', '100g'],
      ],
    },
    compare: {
      weights: [500, 1000, 1500, 2000, 2500, 3000],
    },
    combo: {
      mainWeights: [150, 200, 250, 300],
      smallWeights: [30, 40, 50],
      smallCounts: [2, 3, 4],
    },
  } : {
    gramScale: {
      maxOptions: [500, 800, 1000],
      majorSteps: [100, 200],
      minorDivisor: 5,
    },
    kgScale: {
      max: 5,
      majorStep: 1,
      minorStep: 0.2,
      decimals: [0, 0.2, 0.4, 0.6, 0.8],
    },
    division: {
      counts: [3, 6, 7, 8, 9],
      totalWeights: [150, 240, 420, 630, 720, 810],
    },
    balance: {
      weightSets: [
        ['1kg', '500g', '200g', '50g'],
        ['2kg', '100g', '50g', '20g'],
        ['1kg', '500g', '200g', '100g', '50g'],
        ['500g', '200g', '200g', '100g', '50g', '20g'],
        ['2kg', '500g', '200g', '50g', '10g'],
      ],
    },
    compare: {
      weights: [750, 1250, 1800, 2350, 2750, 3200],
    },
    combo: {
      mainWeights: [160, 180, 220, 270, 320],
      smallWeights: [25, 35, 45, 55],
      smallCounts: [3, 4, 5],
    },
  };

  const emojis = {
    fruits: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍐', '🥝', '🥭', '🍒'],
    foods: ['🍰', '🧁', '🍪', '🥐', '🥯', '🍩', '🥮'],
    veggies: ['🥕', '🥔', '🍆', '🥒', '🌽', '🥬', '🧅'],
    heavy: ['🍉', '🎃', '🥥', '🍍'],
    bags: ['🎒', '📦', '🧳', '👜', '🛍️'],
    containers: ['🥛', '🫖', '🍵', '☕', '🥤'],
    balls: ['⚪', '🔴', '🟡', '🟢', '🔵'],
    boxes: ['📦', '🎁', '🧊', '🧱'],
  };

  const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const calculateWeightSum = (weights) => {
    return weights.reduce((sum, w) => {
      const num = parseFloat(w);
      if (w.includes('kg')) return sum + num * 1000;
      return sum + num;
    }, 0);
  };

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    let question;

    switch (type) {
      case 'gram-scale': {
        const max = randomPick(config.gramScale.maxOptions);
        const majorStep = randomPick(config.gramScale.majorSteps);
        const minorStep = majorStep / config.gramScale.minorDivisor;
        
        const numMinorSteps = Math.floor(max / minorStep);
        let value;
        do {
          const stepIndex = randomInt(1, numMinorSteps - 1);
          value = stepIndex * minorStep;
        } while (value % majorStep === 0);
        
        question = {
          type: 'gram-scale',
          question: `請看磅秤，這個物品有多重？`,
          scaleMin: 0,
          scaleMax: max,
          majorStep,
          minorStep,
          pointerValue: value,
          answer: value,
          unit: '克',
          emoji: randomPick([...emojis.fruits, ...emojis.foods]),
          hint: `先看指針在哪兩個數字之間，再數小格。答案是 ${value} 克！`,
        };
        break;
      }

      case 'kg-scale': {
        const { max, majorStep, minorStep, decimals } = config.kgScale;
        const baseKg = randomInt(1, max - 1);
        const decimal = randomPick(decimals);
        const value = baseKg + decimal;
        
        question = {
          type: 'kg-scale',
          question: `請看磅秤，這個物品有多重？`,
          scaleMin: 0,
          scaleMax: max,
          majorStep,
          minorStep,
          pointerValue: value,
          answer: value,
          unit: '公斤',
          emoji: randomPick(emojis.heavy),
          hint: `這個磅秤用公斤量度。指針指在 ${value} 公斤的位置。`,
        };
        break;
      }

      case 'division': {
        const itemCount = randomPick(config.division.counts);
        const validTotals = config.division.totalWeights.filter(w => w % itemCount === 0);
        const total = randomPick(validTotals.length > 0 ? validTotals : [itemCount * 100]);
        const answer = total / itemCount;
        const emoji = randomPick(emojis.fruits);
        
        question = {
          type: 'division',
          question: `${itemCount} 個 ${emoji} 總共重 ${total} 克，\n請問 1 個 ${emoji} 重多少克？`,
          answer: answer,
          unit: '克',
          emoji: emoji.repeat(Math.min(itemCount, 5)),
          hint: `把總重量除以數量：${total} ÷ ${itemCount} = ${answer} 克`,
        };
        break;
      }

      case 'balance': {
        const weights = [...randomPick(config.balance.weightSets)];
        const answer = calculateWeightSum(weights);
        const emoji = randomPick([...emojis.heavy, ...emojis.veggies]);
        
        question = {
          type: 'balance',
          question: `天平平衡了！\n右邊的砝碼有：${weights.join('、')}\n請問 ${emoji} 重多少克？`,
          weights: weights,
          answer: answer,
          unit: '克',
          emoji: emoji,
          hint: `把所有砝碼加起來！記住 1kg = 1000g。\n${weights.join(' + ')} = ${answer} 克`,
        };
        break;
      }

      case 'compare': {
        const w1 = randomPick(config.compare.weights);
        let w2;
        do {
          w2 = randomPick(config.compare.weights);
        } while (w2 === w1);
        
        const emoji1 = randomPick(emojis.bags);
        const emoji2 = randomPick(emojis.bags.filter(e => e !== emoji1));
        
        const diff = Math.abs(w1 - w2);
        
        question = {
          type: 'compare',
          question: `${emoji1} 重 ${w1} 克，${emoji2} 重 ${w2} 克。\n請問兩個相差多少克？`,
          answer: diff,
          unit: '克',
          emoji1,
          emoji2,
          hint: `用大的減小的：${Math.max(w1, w2)} - ${Math.min(w1, w2)} = ${diff} 克`,
        };
        break;
      }

      case 'combo-scale-balance': {
        const mainWeight = randomPick(config.combo.mainWeights);
        const smallWeight = randomPick(config.combo.smallWeights);
        const smallCount = randomPick(config.combo.smallCounts);
        
        let boxWeight = mainWeight - (smallCount * smallWeight);
        
        if (boxWeight <= 0) {
          boxWeight = randomInt(40, 80);
          const adjustedMainWeight = boxWeight + (smallCount * smallWeight);
          question = {
            type: 'combo-scale-balance',
            mainEmoji: randomPick(emojis.containers),
            boxEmoji: randomPick(emojis.boxes),
            ballEmoji: randomPick(emojis.balls),
            scaleMin: 0,
            scaleMax: 500,
            majorStep: 100,
            minorStep: difficulty === 'easy' ? 50 : 20,
            pointerValue: adjustedMainWeight,
            mainWeight: adjustedMainWeight,
            smallWeight: smallWeight,
            smallCount: smallCount,
            boxWeight: boxWeight,
            answer: boxWeight,
            unit: '克',
            hint: `從磅秤讀出杯子重量是 ${adjustedMainWeight} 克。\n天平平衡，所以：杯子 = 罐子 + ${smallCount}個球\n${adjustedMainWeight} = 罐子 + ${smallCount} × ${smallWeight}\n罐子 = ${adjustedMainWeight} - ${smallCount * smallWeight} = ${boxWeight} 克`,
          };
        } else {
          question = {
            type: 'combo-scale-balance',
            mainEmoji: randomPick(emojis.containers),
            boxEmoji: randomPick(emojis.boxes),
            ballEmoji: randomPick(emojis.balls),
            scaleMin: 0,
            scaleMax: 500,
            majorStep: 100,
            minorStep: difficulty === 'easy' ? 50 : 20,
            pointerValue: mainWeight,
            mainWeight: mainWeight,
            smallWeight: smallWeight,
            smallCount: smallCount,
            boxWeight: boxWeight,
            answer: boxWeight,
            unit: '克',
            hint: `從磅秤讀出杯子重量是 ${mainWeight} 克。\n天平平衡，所以：杯子 = 罐子 + ${smallCount}個球\n${mainWeight} = 罐子 + ${smallCount} × ${smallWeight}\n罐子 = ${mainWeight} - ${smallCount * smallWeight} = ${boxWeight} 克`,
          };
        }
        break;
      }
    }

    if (question) {
      questions.push(question);
    }
  }

  return questions.sort(() => Math.random() - 0.5);
};

// ==================== 磅秤組件 ====================
const RealisticScale = ({ min, max, majorStep, minorStep, value, unit, emoji, size = 'normal' }) => {
  const isSmall = size === 'small';
  const centerX = isSmall ? 70 : 120;
  const centerY = isSmall ? 70 : 120;
  const radius = isSmall ? 50 : 85;
  const fontSize = isSmall ? 8 : 11;
  
  const startAngle = -225;
  const totalAngle = 270;
  
  const valueToAngle = (val) => {
    const ratio = (val - min) / (max - min);
    return startAngle + ratio * totalAngle;
  };
  
  const pointerAngle = valueToAngle(value);
  
  const ticks = [];
  const labels = [];
  
  for (let v = min; v <= max; v += majorStep) {
    const angle = valueToAngle(v) * (Math.PI / 180);
    const innerR = radius - (isSmall ? 12 : 18);
    const outerR = radius - 2;
    const labelR = radius - (isSmall ? 22 : 32);
    
    const x1 = centerX + innerR * Math.cos(angle);
    const y1 = centerY + innerR * Math.sin(angle);
    const x2 = centerX + outerR * Math.cos(angle);
    const y2 = centerY + outerR * Math.sin(angle);
    const labelX = centerX + labelR * Math.cos(angle);
    const labelY = centerY + labelR * Math.sin(angle);
    
    ticks.push(
      <line key={`major-${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#222" strokeWidth={isSmall ? 2 : 3} />
    );
    labels.push(
      <text key={`label-${v}`} x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fontWeight="bold" fill="#333">
        {v}
      </text>
    );
  }
  
  for (let v = min; v <= max; v += minorStep) {
    if (Math.abs(v % majorStep) > 0.001 && Math.abs(v % majorStep - majorStep) > 0.001) {
      const angle = valueToAngle(v) * (Math.PI / 180);
      const innerR = radius - (isSmall ? 7 : 10);
      const outerR = radius - 2;
      
      const x1 = centerX + innerR * Math.cos(angle);
      const y1 = centerY + innerR * Math.sin(angle);
      const x2 = centerX + outerR * Math.cos(angle);
      const y2 = centerY + outerR * Math.sin(angle);
      
      ticks.push(
        <line key={`minor-${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#555" strokeWidth="1.5" />
      );
    }
  }
  
  const pointerRad = pointerAngle * (Math.PI / 180);
  const pointerLength = radius - (isSmall ? 18 : 28);
  const pointerX = centerX + pointerLength * Math.cos(pointerRad);
  const pointerY = centerY + pointerLength * Math.sin(pointerRad);
  
  const svgWidth = isSmall ? 140 : 240;
  const svgHeight = isSmall ? 100 : 165;
  
  return (
    <div className="flex flex-col items-center">
      {emoji && <div className={isSmall ? "text-3xl mb-1" : "text-5xl mb-2"}>{emoji}</div>}
      <div className={`bg-gray-100 rounded-xl ${isSmall ? 'p-2' : 'p-3'} border-4 border-gray-400 shadow-lg`}>
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <circle cx={centerX} cy={centerY} r={radius + 5} fill="#fafafa" stroke="#666" strokeWidth="3" />
          <circle cx={centerX} cy={centerY} r={radius - (isSmall ? 25 : 40)} fill="#fff" stroke="#ddd" strokeWidth="1" />
          
          <text x={centerX} y={centerY + (isSmall ? 5 : 8)} textAnchor="middle" fontSize={isSmall ? 10 : 13} fontWeight="bold" fill="#444">
            {unit === '克' ? 'g' : '公斤'}
          </text>
          
          {ticks}
          {labels}
          
          <line 
            x1={centerX} 
            y1={centerY} 
            x2={pointerX} 
            y2={pointerY} 
            stroke="#dc2626" 
            strokeWidth={isSmall ? 2 : 3}
            strokeLinecap="round"
          />
          
          <circle cx={centerX} cy={centerY} r={isSmall ? 5 : 7} fill="#b91c1c" />
          <circle cx={centerX} cy={centerY} r={isSmall ? 2 : 3} fill="#fef2f2" />
        </svg>
      </div>
    </div>
  );
};

// ==================== 天平組件 ====================
const BalanceScale = ({ weights, emoji, size = 'normal' }) => {
  const isSmall = size === 'small';
  
  return (
    <div className="flex flex-col items-center">
      <svg width={isSmall ? 200 : 320} height={isSmall ? 100 : 160} viewBox={isSmall ? "0 0 200 100" : "0 0 320 160"}>
        {isSmall ? (
          <>
            <rect x="97" y="75" width="6" height="22" fill="#555" />
            <rect x="80" y="93" width="40" height="5" rx="2" fill="#444" />
            <rect x="20" y="72" width="160" height="5" rx="2" fill="#777" />
            <polygon points="100,65 95,74 105,74" fill="#555" />
            
            <ellipse cx="45" cy="78" rx="30" ry="6" fill="#999" />
            <line x1="45" y1="74" x2="45" y2="55" stroke="#666" strokeWidth="1.5" />
            <line x1="20" y1="74" x2="45" y2="55" stroke="#666" strokeWidth="1" />
            <line x1="70" y1="74" x2="45" y2="55" stroke="#666" strokeWidth="1" />
            
            <ellipse cx="155" cy="78" rx="30" ry="6" fill="#999" />
            <line x1="155" y1="74" x2="155" y2="55" stroke="#666" strokeWidth="1.5" />
            <line x1="130" y1="74" x2="155" y2="55" stroke="#666" strokeWidth="1" />
            <line x1="180" y1="74" x2="155" y2="55" stroke="#666" strokeWidth="1" />
            
            <text x="45" y="48" textAnchor="middle" fontSize="24">{emoji}</text>
            <text x="155" y="50" textAnchor="middle" fontSize="8" fill="#333">砝碼</text>
          </>
        ) : (
          <>
            <rect x="155" y="120" width="10" height="35" fill="#555" />
            <rect x="130" y="150" width="60" height="8" rx="3" fill="#444" />
            <rect x="30" y="115" width="260" height="8" rx="2" fill="#777" />
            <polygon points="160,105 153,118 167,118" fill="#555" />
            
            <ellipse cx="65" cy="125" rx="50" ry="10" fill="#999" />
            <line x1="65" y1="118" x2="65" y2="85" stroke="#666" strokeWidth="2" />
            <line x1="25" y1="118" x2="65" y2="85" stroke="#666" strokeWidth="1.5" />
            <line x1="105" y1="118" x2="65" y2="85" stroke="#666" strokeWidth="1.5" />
            
            <ellipse cx="255" cy="125" rx="50" ry="10" fill="#999" />
            <line x1="255" y1="118" x2="255" y2="85" stroke="#666" strokeWidth="2" />
            <line x1="215" y1="118" x2="255" y2="85" stroke="#666" strokeWidth="1.5" />
            <line x1="295" y1="118" x2="255" y2="85" stroke="#666" strokeWidth="1.5" />
            
            <text x="65" y="75" textAnchor="middle" fontSize="40">{emoji}</text>
            <text x="255" y="78" textAnchor="middle" fontSize="11" fill="#333">砝碼</text>
          </>
        )}
      </svg>
      
      {weights && (
        <div className={`flex gap-1 flex-wrap justify-center ${isSmall ? 'max-w-40' : 'max-w-xs'}`}>
          {weights.map((w, i) => (
            <div key={i} className={`bg-gray-700 text-white ${isSmall ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} rounded-lg font-bold shadow`}>
              {w}
            </div>
          ))}
        </div>
      )}
      <div className={`${isSmall ? 'text-xs' : 'text-sm'} text-green-600 mt-1 font-medium`}>✓ 天平平衡</div>
    </div>
  );
};

// ==================== 複合題組件（磅秤+天平）====================
const ComboScaleBalance = ({ question }) => {
  const { mainEmoji, boxEmoji, ballEmoji, scaleMin, scaleMax, majorStep, minorStep, pointerValue, smallCount, smallWeight } = question;
  
  return (
    <div className="flex flex-col items-center my-2">
      <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
        <div className="flex flex-col items-center">
          <RealisticScale 
            min={scaleMin}
            max={scaleMax}
            majorStep={majorStep}
            minorStep={minorStep}
            value={pointerValue}
            unit="克"
            emoji={mainEmoji}
            size="small"
          />
        </div>
        
        <div className="flex flex-col items-center">
          <svg width="220" height="120" viewBox="0 0 220 120">
            <rect x="105" y="90" width="10" height="25" fill="#555" />
            <rect x="85" y="110" width="50" height="6" rx="2" fill="#444" />
            <rect x="20" y="85" width="180" height="6" rx="2" fill="#777" />
            <polygon points="110,78 103,88 117,88" fill="#555" />
            
            <ellipse cx="50" cy="93" rx="35" ry="7" fill="#999" />
            <line x1="50" y1="88" x2="50" y2="60" stroke="#666" strokeWidth="2" />
            <line x1="22" y1="88" x2="50" y2="60" stroke="#666" strokeWidth="1" />
            <line x1="78" y1="88" x2="50" y2="60" stroke="#666" strokeWidth="1" />
            
            <ellipse cx="170" cy="93" rx="35" ry="7" fill="#999" />
            <line x1="170" y1="88" x2="170" y2="60" stroke="#666" strokeWidth="2" />
            <line x1="142" y1="88" x2="170" y2="60" stroke="#666" strokeWidth="1" />
            <line x1="198" y1="88" x2="170" y2="60" stroke="#666" strokeWidth="1" />
            
            <text x="50" y="52" textAnchor="middle" fontSize="28">{mainEmoji}</text>
            <text x="155" y="52" textAnchor="middle" fontSize="22">{boxEmoji}</text>
            <text x="185" y="52" textAnchor="middle" fontSize="16">{ballEmoji.repeat(Math.min(smallCount, 3))}</text>
          </svg>
          <div className="text-sm text-green-600 font-medium">✓ 天平平衡</div>
        </div>
      </div>
      
      <div className="mt-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl px-4 py-2 text-center">
        <p className="text-sm text-gray-700">
          每個 {ballEmoji} 重 <span className="font-bold text-blue-600">{smallWeight} 克</span>
        </p>
        <p className="text-sm text-gray-700">
          天平右邊有 1 個 {boxEmoji} 和 {smallCount} 個 {ballEmoji}
        </p>
      </div>
    </div>
  );
};

// ==================== 主遊戲組件 ====================
function App() {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [questionType, setQuestionType] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [correctCount, setCorrectCount] = useState(0);
  const [step, setStep] = useState('type');
  
  const questionTypes = [
    { id: 'all', name: '🎯 全部混合', desc: '所有題型隨機出現' },
    { id: 'scale', name: '📊 讀取磅秤', desc: '克和公斤磅秤' },
    { id: 'division', name: '➗ 計算平均', desc: '除法計算重量' },
    { id: 'balance', name: '⚖️ 天平秤重', desc: '砝碼加總' },
    { id: 'compare', name: '📏 比較重量', desc: '計算重量差異' },
    { id: 'combo', name: '🧩 複合題', desc: '磅秤 + 天平' },
  ];
  
  const questions = useMemo(() => {
    if (difficulty && questionType) {
      return generateQuestions(totalQuestions, difficulty, questionType);
    }
    return [];
  }, [difficulty, questionType, totalQuestions]);

  const handleSubmit = () => {
    const currentQ = questions[currentQuestion];
    const userNum = parseFloat(userAnswer);
    
    if (isNaN(userNum)) {
      setFeedback({ correct: false, message: '請輸入數字答案喔！', isError: true });
      return;
    }

    if (Math.abs(userNum - currentQ.answer) < 0.01) {
      setScore(score + 10);
      setCorrectCount(correctCount + 1);
      setFeedback({
        correct: true,
        message: `🎉 太棒了！答對了！+10 分！\n答案是 ${currentQ.answer} ${currentQ.unit}！`
      });
    } else {
      setFeedback({
        correct: false,
        message: `😊 差一點點！\n\n💡 ${currentQ.hint}\n\n正確答案是 ${currentQ.answer} ${currentQ.unit}。`
      });
    }
    setShowNext(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setFeedback(null);
      setShowNext(false);
    }
  };

  const selectType = (type) => {
    setQuestionType(type);
    setStep('difficulty');
  };

  const selectDifficulty = (diff) => {
    setDifficulty(diff);
    setGameStarted(true);
    setScore(0);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setUserAnswer('');
    setFeedback(null);
    setShowNext(false);
  };

  const restartGame = () => {
    setGameStarted(false);
    setDifficulty(null);
    setQuestionType(null);
    setStep('type');
  };

  const goBack = () => {
    setStep('type');
    setQuestionType(null);
  };

  if (!gameStarted && step === 'type') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-200 to-indigo-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">⚖️ 重量小達人 ⚖️</h1>
          <p className="text-gray-500 mb-6">請選擇練習題型</p>
          
          <div className="space-y-3">
            {questionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => selectType(type.id)}
                className={`w-full py-3 px-4 rounded-xl text-left transition-all transform hover:scale-102 shadow-md hover:shadow-lg ${
                  type.id === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold text-lg ${type.id === 'all' ? 'text-white' : 'text-gray-800'}`}>
                      {type.name}
                    </p>
                    <p className={`text-sm ${type.id === 'all' ? 'text-purple-100' : 'text-gray-500'}`}>
                      {type.desc}
                    </p>
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">每次遊戲題目都會隨機生成！</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted && step === 'difficulty') {
    const selectedType = questionTypes.find(t => t.id === questionType);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-200 to-indigo-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">⚖️ 重量小達人 ⚖️</h1>
          
          <div className="bg-purple-100 rounded-xl p-3 mb-6">
            <p className="text-purple-700 font-bold">{selectedType?.name}</p>
            <p className="text-purple-600 text-sm">{selectedType?.desc}</p>
          </div>

          <p className="text-lg font-bold text-gray-700 mb-4">請選擇難度：</p>
          
          <div className="space-y-4">
            <button
              onClick={() => selectDifficulty('easy')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🌟 簡單模式
              <p className="text-sm font-normal mt-1">10題</p>
            </button>
            
            <button
              onClick={() => selectDifficulty('hard')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔥 困難模式
              <p className="text-sm font-normal mt-1">10題</p>
            </button>
          </div>
          
          <button
            onClick={goBack}
            className="mt-6 text-gray-500 hover:text-gray-700 underline"
          >
            ← 返回選擇題型
          </button>
        </div>
      </div>
    );
  }

  if (showNext && currentQuestion === questions.length - 1) {
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    let grade, gradeColor, message;
    
    if (percentage >= 90) {
      grade = '🏆 超級厲害！';
      gradeColor = 'text-yellow-500';
      message = '你是重量小天才！';
    } else if (percentage >= 70) {
      grade = '🌟 很棒！';
      gradeColor = 'text-green-500';
      message = '繼續加油，你越來越強了！';
    } else if (percentage >= 50) {
      grade = '👍 不錯！';
      gradeColor = 'text-blue-500';
      message = '多練習就會更好！';
    } else {
      grade = '💪 繼續努力！';
      gradeColor = 'text-purple-500';
      message = '再玩一次會進步的！';
    }

    const selectedType = questionTypes.find(t => t.id === questionType);

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-200 to-indigo-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-blue-600 mb-4">🎮 遊戲結束！</h2>
          
          <div className="bg-gray-100 rounded-lg px-3 py-1 inline-block mb-4">
            <span className="text-sm text-gray-600">{selectedType?.name}</span>
          </div>
          
          <div className={`text-4xl font-bold ${gradeColor} mb-2`}>{grade}</div>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 mb-6">
            <p className="text-lg text-gray-700">最終得分</p>
            <p className="text-5xl font-bold text-orange-500">{score}</p>
            <p className="text-gray-600 mt-2">答對 {correctCount} / {totalQuestions} 題 ({percentage}%)</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setGameStarted(true);
                setScore(0);
                setCurrentQuestion(0);
                setCorrectCount(0);
                setUserAnswer('');
                setFeedback(null);
                setShowNext(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 再玩同類型
            </button>
            
            <button
              onClick={restartGame}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-full text-lg transition-all"
            >
              📋 選擇其他題型
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const selectedType = questionTypes.find(t => t.id === questionType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-200 to-indigo-200 p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex justify-between items-center text-white">
            <div>
              <span className="text-sm opacity-80">得分</span>
              <p className="text-2xl font-bold">{score} 分</p>
            </div>
            <div className="text-center">
              <span className="text-xs opacity-80 block">{selectedType?.name}</span>
              <span className="text-sm opacity-80">{difficulty === 'easy' ? '🌟 簡單' : '🔥 困難'}</span>
              <p className="text-lg font-bold">第 {currentQuestion + 1} / {totalQuestions} 題</p>
            </div>
            <div className="text-right">
              <span className="text-sm opacity-80">答對</span>
              <p className="text-2xl font-bold">{correctCount} 題</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-5 mb-4">
          {(currentQ.type === 'gram-scale' || currentQ.type === 'kg-scale') && (
            <RealisticScale 
              min={currentQ.scaleMin}
              max={currentQ.scaleMax}
              majorStep={currentQ.majorStep}
              minorStep={currentQ.minorStep}
              value={currentQ.pointerValue}
              unit={currentQ.unit}
              emoji={currentQ.emoji}
            />
          )}
          
          {currentQ.type === 'balance' && (
            <BalanceScale weights={currentQ.weights} emoji={currentQ.emoji} />
          )}
          
          {currentQ.type === 'division' && (
            <div className="text-center my-6">
              <div className="text-5xl mb-2">{currentQ.emoji}</div>
              <div className="text-gray-500">計算平均重量</div>
            </div>
          )}
          
          {currentQ.type === 'compare' && (
            <div className="text-center my-6">
              <div className="text-5xl mb-2">{currentQ.emoji1} ⚖️ {currentQ.emoji2}</div>
              <div className="text-gray-500">比較重量</div>
            </div>
          )}
          
          {currentQ.type === 'combo-scale-balance' && (
            <ComboScaleBalance question={currentQ} />
          )}

          <p className="text-lg text-gray-800 my-4 whitespace-pre-line text-center leading-relaxed">
            {currentQ.type === 'combo-scale-balance' 
              ? `請問 ${currentQ.boxEmoji} 重多少克？`
              : currentQ.question
            }
          </p>

          {!showNext && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="border-4 border-blue-400 rounded-xl p-3 text-2xl w-36 text-center focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                  placeholder="?"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
                <span className="text-xl font-bold text-gray-600">{currentQ.unit}</span>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                ✅ 提交答案
              </button>
            </div>
          )}
        </div>

        {feedback && !feedback.isError && (
          <div className={`rounded-2xl p-5 mb-4 shadow-lg ${feedback.correct ? 'bg-green-100 border-4 border-green-400' : 'bg-orange-100 border-4 border-orange-400'}`}>
            <p className="text-lg whitespace-pre-line text-center leading-relaxed">
              {feedback.message}
            </p>
          </div>
        )}
        
        {feedback && feedback.isError && (
          <div className="rounded-2xl p-4 mb-4 bg-red-100 border-2 border-red-300 text-center">
            <p className="text-red-600">{feedback.message}</p>
          </div>
        )}

        {showNext && currentQuestion < questions.length - 1 && (
          <div className="text-center">
            <button
              onClick={nextQuestion}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              ➡️ 下一題
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
