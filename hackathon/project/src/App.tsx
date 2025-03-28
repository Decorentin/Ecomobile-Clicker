import React, { useState, useEffect } from 'react';
import { Bike, AlertCircle, Leaf, Trophy, X, Timer, Zap } from 'lucide-react';

interface Bonus {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  owned: number;
  description: string;
}

interface EcoTip {
  title: string;
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ScorePopup {
  id: number;
  value: number;
  x: number;
  y: number;
}

interface TemporaryBonus {
  id: string;
  multiplier: number;
  duration: number;
  endTime: number;
}

function App() {
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState<EcoTip>({ title: '', content: '' });
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [temporaryBonuses, setTemporaryBonuses] = useState<TemporaryBonus[]>([]);
  const [autoClickInterval, setAutoClickInterval] = useState<number | null>(null);

  // CO2 calculation: 1km in car = ~130g of CO2
  const co2Saved = score * 0.13; // en kg

  const [bonuses, setBonuses] = useState<Bonus[]>([
    {
      id: 'helmet',
      name: 'Casque Aérodynamique',
      cost: 10,
      multiplier: 1.1,
      owned: 0,
      description: 'Réduit la résistance au vent, augmentant la vitesse de 10%'
    },
    {
      id: 'bike-lane',
      name: 'Piste Cyclable',
      cost: 25,
      multiplier: 1.25,
      owned: 0,
      description: 'Augmente la vitesse des vélos de 25%'
    },
    {
      id: 'carbon-bike',
      name: 'Vélo Carbone',
      cost: 150,
      multiplier: 1.5,
      owned: 0,
      description: 'Vélo plus léger et performant, augmentant la vitesse de 50%'
    },
    {
      id: 'sport-nutrition',
      name: 'Alimentation Sportive',
      cost: 500,
      multiplier: 1.6,
      owned: 0,
      description: 'Meilleure endurance et récupération, augmentant la vitesse de 60%'
    },
    {
      id: 'lubrication',
      name: 'Super Lubrification',
      cost: 1000,
      multiplier: 2.0,
      owned: 0,
      description: 'Réduction des frictions sur la chaîne, augmentant la vitesse de 100%'
    },
    {
      id: 'training',
      name: 'Entraînement Intensif',
      cost: 2000,
      multiplier: 2.5,
      owned: 0,
      description: 'Améliore la puissance des jambes, augmentant la vitesse de 150%'
    },
    {
      id: 'aero',
      name: 'Aérodynamisme Parfait',
      cost: 4000,
      multiplier: 3.5,
      owned: 0,
      description: 'Position et équipement optimisés, augmentant la vitesse de 250%'
    },
    {
      id: 'exoskeleton',
      name: 'Exosquelette Assisté',
      cost: 7000,
      multiplier: 5.0,
      owned: 0,
      description: 'Technologie pour booster le pédalage, augmentant la vitesse de 400%'
    },
    {
      id: 'gravity-bike',
      name: 'Vélo à Assistance Gravitique',
      cost: 12000,
      multiplier: 7.0,
      owned: 0,
      description: 'Technologie futuriste sans frottements, augmentant la vitesse de 600%'
    }
  ]);

  const temporaryBonusTypes = [
    {
      id: 'sprint',
      name: 'Sprint',
      multiplier: 3,
      duration: 30,
      cost: 50,
      description: 'Triple la vitesse pendant 30 secondes'
    },
    {
      id: 'peloton',
      name: 'Effet Peloton',
      multiplier: 5,
      duration: 15,
      cost: 100,
      description: 'Quintuple la vitesse pendant 15 secondes'
    },
    {
      id: 'auto-pedal',
      name: 'Pédalage Automatique',
      duration: 60,
      cost: 200,
      description: 'Pédale automatiquement pendant 60 secondes'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Clean up expired bonuses
      const now = Date.now();
      setTemporaryBonuses(prev => {
        const active = prev.filter(bonus => bonus.endTime > now);
        if (active.length !== prev.length) {
          // Recalculate multiplier when bonuses expire
          updateTotalMultiplier();
        }
        return active;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateTotalMultiplier = () => {
    const now = Date.now();
    const activeMultipliers = temporaryBonuses
      .filter(bonus => bonus.endTime > now)
      .reduce((total, bonus) => total * (bonus.multiplier || 1), 1);
    
    const permanentMultiplier = bonuses.reduce((total, bonus) => 
      total * Math.pow(bonus.multiplier, bonus.owned), 1);

    setMultiplier(permanentMultiplier * activeMultipliers);
  };

  const activateTemporaryBonus = (bonusType: typeof temporaryBonusTypes[0]) => {
    if (score >= bonusType.cost) {
      setScore(prev => prev - bonusType.cost);

      if (bonusType.id === 'auto-pedal') {
        if (autoClickInterval) {
          clearInterval(autoClickInterval);
        }
        const interval = window.setInterval(() => {
          setScore(prev => prev + multiplier);
        }, 1000);
        setAutoClickInterval(interval);
        setTimeout(() => {
          clearInterval(interval);
          setAutoClickInterval(null);
        }, bonusType.duration * 1000);
      } else {
        const newBonus: TemporaryBonus = {
          id: bonusType.id,
          multiplier: bonusType.multiplier,
          duration: bonusType.duration,
          endTime: Date.now() + (bonusType.duration * 1000)
        };
        setTemporaryBonuses(prev => [...prev, newBonus]);
        updateTotalMultiplier();
      }
    }
  };

  const ecoTips: EcoTip[] = [
    {
      title: 'Le Saviez-vous ?',
      content: 'Un trajet à vélo de 5km émet 0g de CO2, contre environ 1.3kg en voiture.'
    },
    {
      title: 'Impact Écologique',
      content: 'Les transports représentent 30% des émissions de gaz à effet de serre en France.'
    },
    {
      title: 'Santé',
      content: '30 minutes de vélo par jour réduit de 30% les risques de maladies cardiovasculaires.'
    }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: "Quelle est la part des transports dans les émissions de CO2 en France ?",
      options: ["15%", "30%"],
      correctAnswer: 1
    },
    {
      question: "Combien de CO2 économisé pour 1km à vélo plutôt qu'en voiture ?",
      options: ["100g", "150g"],
      correctAnswer: 0
    },
    {
      question: "Quelle distance moyenne peut-on parcourir à vélo en 15 minutes en ville ?",
      options: ["1km", "2km"],
      correctAnswer: 1
    }
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      const randomTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];
      setCurrentTip(randomTip);
      setShowTip(true);
      setTimeout(() => setShowTip(false), 8000);
    }, 15000);

    const quizInterval = setInterval(() => {
      const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
      setCurrentQuestion(randomQuestion);
      setShowQuiz(true);
    }, Math.floor(Math.random() * (300000 - 180000) + 180000));

    return () => {
      clearInterval(tipInterval);
      clearInterval(quizInterval);
    };
  }, []);

  const handleClick = (event: React.MouseEvent) => {
    const gain = multiplier;
    setScore(prev => prev + gain);
    
    const popup: ScorePopup = {
      id: Date.now(),
      value: gain,
      x: event.clientX,
      y: event.clientY
    };
    
    setScorePopups(prev => [...prev, popup]);
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popup.id));
    }, 1000);
  };

  const buyBonus = (bonus: Bonus) => {
    if (score >= bonus.cost) {
      setScore(prev => prev - bonus.cost);
      setBonuses(prev =>
        prev.map(b =>
          b.id === bonus.id
            ? { ...b, owned: b.owned + 1, cost: Math.floor(b.cost * 1.5) }
            : b
        )
      );
      updateTotalMultiplier();
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (currentQuestion) {
      if (answerIndex === currentQuestion.correctAnswer) {
        setMultiplier(prev => prev * 2);
        setCurrentTip({ title: 'Bravo !', content: 'Votre multiplicateur a doublé !' });
      } else {
        setMultiplier(prev => prev / 2);
        setCurrentTip({ title: 'Dommage !', content: 'Votre multiplicateur a été divisé par 2.' });
      }
      setShowTip(true);
      setTimeout(() => setShowTip(false), 3000);
      setShowQuiz(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
      style={{
        backgroundImage: "url('/img/image_cookie.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white bg-clip-text mb-4">
            EcoMobile Clicker
          </h1>
          <div className="flex items-center justify-center gap-2 text-3xl">
            <Leaf className="text-green-500 animate-float" />
            <span className="font-bold text-gray-800">{Math.floor(score)}</span>
            <span className="font-bold text-gray-800">km</span>
          </div>

          <div className="font-bold text-gray-800">
            Multiplicateur: x<span className="font-bold text-gray-800">{multiplier.toFixed(1)}</span>
          </div>

          <div className="mt-2 text-lg font-bold text-gray-800">
            CO222 économisé: {co2Saved.toFixed(1)} kg
          </div>

          {/* Bonus temporaires */}
          <div className="flex justify-center gap-4 mt-4">
            {temporaryBonusTypes.map(bonus => (
              <button
                key={bonus.id}
                onClick={() => activateTemporaryBonus(bonus)}
                disabled={score < bonus.cost}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  score >= bonus.cost
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {bonus.id === 'auto-pedal' ? <Zap size={20} /> : <Timer size={20} />}
                {bonus.name} ({bonus.cost} km)
              </button>
            ))}
          </div>

          {/* Bonus actifs */}
          <div className="flex justify-center gap-2 mt-2">
            {temporaryBonuses.map(bonus => {
              const timeLeft = Math.max(0, Math.ceil((bonus.endTime - Date.now()) / 1000));
              return (
                <div key={bonus.id + bonus.endTime} className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {bonus.id === 'sprint' ? 'Sprint' : 'Peloton'}: {timeLeft}s
                </div>
              );
            })}
            {autoClickInterval && (
              <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Auto-pédalage actif
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={handleClick}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                      text-white rounded-full p-8 transition-all duration-200 transform hover:scale-105
                      shadow-lg hover:shadow-xl active:scale-95"
          >
            <Bike size={48} className="animate-float" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {bonuses.map(bonus => (
            <div
              key={bonus.id}
              className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow duration-200
                       border border-gray-100 max-w-xs"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm text-gray-800">{bonus.name}</h3>
                <span className="text-xs font-medium px-1 py-0.5 bg-green-100 text-green-800 rounded-full">
                  {bonus.owned}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{bonus.description}</p>
              <button
                onClick={() => buyBonus(bonus)}
                disabled={score < bonus.cost}
                className={`w-full py-1 px-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                  score >= bonus.cost
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Acheter ({Math.floor(bonus.cost)} km)
              </button>
            </div>
          ))}
        </div>

        {showTip && (
          <div className="fixed top-4 right-4 bg-white p-4 rounded-xl shadow-xl max-w-sm animate-fade-in
                       border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-green-500" />
              <h4 className="font-bold text-gray-800">{currentTip.title}</h4>
            </div>
            <p className="text-sm text-gray-600">{currentTip.content}</p>
          </div>
        )}

        {showQuiz && currentQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  Quiz Écologique
                </h3>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    className="w-full p-3 text-left rounded-lg hover:bg-green-50 transition-colors
                             border border-gray-200 hover:border-green-500"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {scorePopups.map(popup => (
          <div
            key={popup.id}
            className="score-popup text-green-600 font-bold"
            style={{
              left: popup.x,
              top: popup.y
            }}
          >
            +{popup.value.toFixed(1)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;