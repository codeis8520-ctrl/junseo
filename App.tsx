
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LifeStage, TriopsState, TankState, GameLog, Position } from './types';
import TriopsSprite from './components/TriopsSprite';
import * as gemini from './services/geminiService';
import { 
  Droplets, 
  Sun, 
  Wind, 
  Utensils, 
  History, 
  Info, 
  RefreshCcw,
  Skull,
  Dna,
  Binary,
  Thermometer,
  Layers
} from 'lucide-react';

const INITIAL_TRIOPS: TriopsState = {
  name: "투구돌이",
  age: 0,
  hunger: 50,
  health: 100,
  size: 5,
  stage: LifeStage.EGG,
  isAlive: true,
  position: { x: 50, y: 50, rotation: 0 }
};

const INITIAL_TANK: TankState = {
  waterQuality: 100,
  temperature: 25,
  oxygen: 100,
  isLightOn: true,
  eggsInSand: 0,
};

const EGG_LAYING_THRESHOLD = 33; // Approx 1 minute with 1800ms ticks

const App: React.FC = () => {
  const [triops, setTriops] = useState<TriopsState>(INITIAL_TRIOPS);
  const [tank, setTank] = useState<TankState>(INITIAL_TANK);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [fact, setFact] = useState<string>("");
  const [showFact, setShowFact] = useState(false);
  const [hasEggsLeft, setHasEggsLeft] = useState(false);
  const [lastMoltAge, setLastMoltAge] = useState(0);
  const [isMolting, setIsMolting] = useState(false);
  const [adultCycles, setAdultCycles] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const movementRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tankContainerRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: GameLog['type'] = 'info') => {
    const newLog: GameLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date(),
      type,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 15));
  }, []);

  useEffect(() => {
    if (!triops.isAlive || triops.stage === LifeStage.EGG || isMolting) {
      if (movementRef.current) clearInterval(movementRef.current);
      return;
    }

    movementRef.current = setInterval(() => {
      setTriops(prev => {
        if (!prev.isAlive) return prev;
        const isResting = Math.random() < 0.15;
        if (isResting) return prev;

        const margin = 12 + (prev.size / 100) * 15; 
        const moveScale = prev.stage === LifeStage.NAUPLIUS ? 18 : 12;
        const dx = (Math.random() - 0.5) * moveScale;
        const dy = (Math.random() - 0.5) * moveScale;
        
        let newX = Math.min(Math.max(margin, prev.position.x + dx), 100 - margin);
        let newY = Math.min(Math.max(margin, prev.position.y + dy), 100 - margin);
        
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        return { ...prev, position: { x: newX, y: newY, rotation: angle } };
      });
    }, 1200);

    return () => {
      if (movementRef.current) clearInterval(movementRef.current);
    };
  }, [triops.isAlive, triops.stage, isMolting]);

  const handleTankClick = (e: React.MouseEvent) => {
    if (!triops.isAlive || triops.stage === LifeStage.EGG || isMolting) return;
    setTriops(prev => {
      const margin = 15 + (prev.size / 100) * 15;
      const dx = (Math.random() - 0.5) * 50;
      const dy = (Math.random() - 0.5) * 50;
      return {
        ...prev,
        position: {
          x: Math.min(Math.max(margin, prev.position.x + dx), 100 - margin),
          y: Math.min(Math.max(margin, prev.position.y + dy), 100 - margin),
          rotation: prev.position.rotation + 180 
        }
      };
    });
    addLog("진동 포착: 표본의 급격한 회피 반응 관찰됨.");
  };

  useEffect(() => {
    if (!triops.isAlive) return;

    timerRef.current = setInterval(() => {
      setTriops(prev => {
        const newAge = prev.age + 1;
        let newStage = prev.stage;
        let newHealth = prev.health;
        
        const tempMultiplier = tank.temperature / 25;
        let newHunger = Math.max(0, prev.hunger - (0.9 * tempMultiplier));

        const ageSinceLastMolt = newAge - lastMoltAge;
        const moltThreshold = prev.stage === LifeStage.NAUPLIUS ? 20 : prev.stage === LifeStage.JUVENILE ? 50 : 120;
        
        if (ageSinceLastMolt >= moltThreshold && prev.hunger > 40 && prev.health > 60) {
           setIsMolting(true);
           setTimeout(() => {
             setIsMolting(false);
             setLastMoltAge(newAge);
             setTriops(t => ({ ...t, size: t.size + 12 }));
             addLog("생태 보고: 탈피(Ecdysis) 성공. 신갑각 경화 과정 진행 중.", "success");
           }, 2500);
           return prev;
        }

        if (prev.stage === LifeStage.EGG && newAge > 18) {
          newStage = LifeStage.NAUPLIUS;
          addLog("관찰: 내구란 부화 확인. 노플리우스(Nauplius) 유생 단계 진입.", "success");
        } else if (prev.stage === LifeStage.NAUPLIUS && newAge > 70) {
          newStage = LifeStage.JUVENILE;
          addLog("관찰: 성기(Juvenile) 단계 진입. 갑각 발달 가속화.", "success");
        } else if (prev.stage === LifeStage.JUVENILE && newAge > 180) {
          newStage = LifeStage.ADULT;
          addLog("관찰: 성체(Adult) 완성. 생식 기능 및 대사량 정점.", "success");
        } else if (prev.stage === LifeStage.ADULT && newAge > 450) {
          newStage = LifeStage.ELDER;
          addLog("기록: 고령화 단계 진입. 생물학적 활성 저하 관찰.");
        } else if (newAge > 700) {
          handleDeath(prev, "수명 한계 도달.");
          return { ...prev, isAlive: false, stage: LifeStage.DECEASED };
        }

        // Egg laying logic
        if (newStage === LifeStage.ADULT || newStage === LifeStage.ELDER) {
          setAdultCycles(c => {
            const nextC = c + 1;
            if (nextC === EGG_LAYING_THRESHOLD) {
              setTank(t => ({ ...t, eggsInSand: t.eggsInSand + 12 }));
              setHasEggsLeft(true);
              addLog("생물학적 현상: 성체 표본이 모래 속에 내구란을 산란하였습니다.", "success");
            }
            return nextC;
          });
        }

        if (newHunger < 15) newHealth -= 2.5;
        if (tank.waterQuality < 35) newHealth -= 4;
        if (tank.oxygen < 25) newHealth -= 6;
        if (tank.temperature > 32 || tank.temperature < 12) newHealth -= 1.5;

        if (newHealth <= 0) {
          handleDeath(prev, "환경 변수로 인한 생명 활동 중단.");
          return { ...prev, health: 0, isAlive: false, stage: LifeStage.DECEASED };
        }

        return {
          ...prev,
          age: newAge,
          stage: newStage,
          hunger: newHunger,
          health: Math.min(100, newHealth),
        };
      });

      setTank(prev => ({
        ...prev,
        waterQuality: Math.max(0, prev.waterQuality - 0.2),
        oxygen: Math.max(0, prev.oxygen - 0.15),
      }));
    }, 1800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [triops.isAlive, tank.waterQuality, tank.oxygen, tank.temperature, lastMoltAge, addLog]);

  const handleDeath = (currentTriops: TriopsState, reason: string) => {
    addLog(`최종 보고: 표본 ${reason}`, "error");
    if (currentTriops.stage === LifeStage.ADULT || currentTriops.stage === LifeStage.ELDER) {
      setHasEggsLeft(true);
      addLog("유산: 퇴적층 내 수백 개의 내구란이 보존되었습니다.", "success");
    }
  };

  const feed = () => {
    if (!triops.isAlive || triops.stage === LifeStage.EGG || isMolting) return;
    setTriops(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + 50) }));
    setTank(prev => ({ ...prev, waterQuality: Math.max(0, prev.waterQuality - 15) }));
    addLog("연구 조치: 영양 공급원 투입 완료.");
  };

  const cleanTank = () => {
    setTank(prev => ({ ...prev, waterQuality: 100 }));
    addLog("연구 조치: 수조 필터링 및 수질 정밀 정화.", "success");
  };

  const addOxygen = () => {
    setTank(prev => ({ ...prev, oxygen: 100 }));
    addLog("연구 조치: 에어레이션 시스템 가동. 산소 포화도 복구.");
  };

  const toggleLight = () => {
    setTank(prev => {
      const nextStatus = !prev.isLightOn;
      addLog(nextStatus ? "시스템: 조도 환경 최적화(On)." : "시스템: 야간 관찰 모드(Off).");
      return { ...prev, isLightOn: nextStatus };
    });
  };

  const adjustTemp = (delta: number) => {
    setTank(prev => ({ ...prev, temperature: Math.min(Math.max(10, prev.temperature + delta), 40) }));
  };

  const restartGame = () => {
    setTriops(INITIAL_TRIOPS);
    setTank(INITIAL_TANK);
    setLogs([]);
    setHasEggsLeft(false);
    setLastMoltAge(0);
    setIsMolting(false);
    setAdultCycles(0);
    addLog(hasEggsLeft ? "로그: 보존된 내구란의 휴면 타파 및 재수화 개시." : "로그: 신규 시뮬레이션 개체 01호 생성.");
  };

  const getFact = async () => {
    const data = await gemini.getTriopsFact();
    setFact(data);
    setShowFact(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto selection:bg-blue-100 text-slate-800 bg-[#f8fafc]">
      <header className="w-full flex justify-between items-center mb-10 border-b-2 border-slate-100 pb-8">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 rounded-3xl shadow-xl transform hover:rotate-12 transition-transform cursor-pointer">
            <Binary size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter text-slate-900 uppercase">
              TRIOPS <span className="text-blue-600">EVO</span>
            </h1>
            <p className="text-slate-400 font-mono text-[11px] uppercase tracking-[0.4em] font-black">Branchiopoda Research Interface</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={getFact} className="flex items-center gap-2 px-8 py-3 bg-white rounded-full hover:bg-slate-50 transition-all border-2 border-slate-200 text-xs font-black text-slate-700 shadow-lg active:scale-95">
            <Info size={18} className="text-blue-500" /> FACT_ARCHIVE
          </button>
          <button onClick={restartGame} className="p-4 bg-white rounded-full hover:bg-red-50 transition-all border-2 border-slate-200 text-slate-400 hover:text-red-500 shadow-lg active:rotate-180">
            <RefreshCcw size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
        <div className="lg:col-span-3 flex flex-col gap-8">
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h2 className="text-[12px] font-mono font-black mb-8 flex items-center gap-3 text-slate-400 uppercase tracking-widest">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              Biometric Data
            </h2>
            <div className="space-y-10">
              <div>
                <div className="flex justify-between text-[11px] mb-4 font-mono font-black text-slate-500 uppercase">
                  <span>Structural Integrity</span>
                  <span className={triops.health < 30 ? "text-red-500" : "text-blue-600"}>{Math.round(triops.health)}%</span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-4 overflow-hidden shadow-inner p-1">
                  <div className={`h-full rounded-full transition-all duration-1000 ${triops.health < 30 ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${triops.health}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-4 font-mono font-black text-slate-500 uppercase">
                  <span>Metabolic Energy</span>
                  <span className="text-orange-500">{Math.round(triops.hunger)}%</span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-4 overflow-hidden shadow-inner p-1">
                  <div className="h-full rounded-full transition-all duration-1000 bg-orange-400" style={{ width: `${triops.hunger}%` }}></div>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="flex flex-col bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-black mb-2">Cycle Stage</span>
                  <span className="text-xs font-black text-slate-800">{triops.stage}</span>
                </div>
                <div className="flex flex-col bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-black mb-2">Age (Cy)</span>
                  <span className="text-xs font-black text-slate-800">{triops.age}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
            <h2 className="text-[12px] font-mono font-black mb-8 text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <Thermometer size={18} className="text-cyan-500"/> Environment
            </h2>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="flex items-center gap-3"><Droplets size={18} className="text-blue-500" /><span className="text-[11px] font-black text-slate-500">PURITY</span></div>
                <span className={`text-sm font-mono font-black ${tank.waterQuality < 40 ? 'text-red-500' : 'text-slate-700'}`}>{Math.round(tank.waterQuality)}%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="flex items-center gap-3"><Wind size={18} className="text-cyan-500" /><span className="text-[11px] font-black text-slate-500">O2_SAT</span></div>
                <span className="text-sm font-mono font-black text-slate-700">{Math.round(tank.oxygen)}%</span>
              </div>
              <div className="flex flex-col p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3"><Thermometer size={18} className="text-red-500" /><span className="text-[11px] font-black text-slate-500">TEMP</span></div>
                  <span className="text-sm font-mono font-black text-slate-700">{tank.temperature.toFixed(1)}°C</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => adjustTemp(-0.5)} className="flex-1 py-2 bg-white border-2 border-slate-200 rounded-2xl text-xs font-black hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm">-</button>
                  <button onClick={() => adjustTemp(0.5)} className="flex-1 py-2 bg-white border-2 border-slate-200 rounded-2xl text-xs font-black hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">+</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-8">
          <div 
            ref={tankContainerRef}
            onClick={handleTankClick}
            className={`relative w-full aspect-square bg-white rounded-[5rem] overflow-hidden border-[16px] border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-1000 cursor-crosshair
              ${tank.isLightOn ? 'brightness-100' : 'brightness-[0.25] grayscale-[0.3]'}`}
          >
            <div className={`absolute inset-0 transition-colors duration-[3000ms] ${tank.waterQuality < 40 ? 'bg-[#78350f]/15' : 'bg-blue-600/5'}`}></div>
            <div className="absolute inset-0 water-surface opacity-50"></div>
            
            {/* Sediment / Sand at bottom */}
            <div className="absolute bottom-0 w-full h-[15%] bg-[#d4a373]/20 blur-xl pointer-events-none"></div>

            {/* Laid Eggs in Sand */}
            <div className="absolute bottom-[5%] left-0 w-full h-[10%] pointer-events-none">
              {[...Array(tank.eggsInSand)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-1.5 h-1.5 bg-[#a98467] rounded-full shadow-sm"
                  style={{ 
                    left: `${(i * 137.5) % 90 + 5}%`, 
                    bottom: `${(i * 22) % 100}%`,
                    opacity: 0.8
                  }}
                />
              ))}
            </div>
            
            <div className="absolute inset-0 pointer-events-none z-0">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-slate-400 rounded-full opacity-10 blur-[1px]" 
                  style={{
                    width: Math.random() * 4 + 1,
                    height: Math.random() * 4 + 1,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
            </div>

            <div className="absolute transition-all duration-[1200ms] ease-in-out" style={{ left: `${triops.position.x}%`, top: `${triops.position.y}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <TriopsSprite stage={triops.stage} size={triops.size} isAlive={triops.isAlive} rotation={triops.position.rotation} />
            </div>

            <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/[0.02]"></div>
            <div className="absolute top-12 left-12 flex flex-col gap-3">
              <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-mono text-white font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-white/10 shadow-2xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div> LIVE SCAN: TR-301
              </div>
              <div className="text-[11px] font-mono font-black text-slate-400 px-2 flex items-center gap-2">
                <Layers size={14}/> Z_DEPTH: {Math.round(triops.size)}μm
              </div>
              {tank.eggsInSand > 0 && (
                <div className="bg-green-600/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-mono text-white font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-white/10 shadow-2xl">
                   <Dna size={14} /> DORMANT_EGGS: {tank.eggsInSand}
                </div>
              )}
            </div>

            {isMolting && (
              <div className="absolute inset-0 z-20 bg-blue-500/10 backdrop-blur-[2px] animate-pulse pointer-events-none flex flex-col items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-[2rem] shadow-2xl border-2 border-blue-200 flex flex-col items-center">
                   <div className="text-[12px] font-mono font-black text-blue-600 uppercase tracking-widest mb-1">Moulting Cycle</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Critical Phase</div>
                </div>
              </div>
            )}

            {!triops.isAlive && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12 z-50">
                <div className="bg-white p-16 rounded-[6rem] border-4 border-slate-50 shadow-[0_50px_100px_rgba(0,0,0,0.1)] flex flex-col items-center max-w-md transform animate-float">
                  <div className="bg-slate-100 p-8 rounded-full mb-10 shadow-inner">
                    <Skull size={64} className="text-slate-300" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-slate-800 mb-6 uppercase tracking-tight italic">Biostasis Active</h3>
                  {hasEggsLeft ? (
                    <>
                      <p className="text-blue-600 font-mono text-xs mb-10 uppercase leading-loose font-black px-6">
                        표본의 생애 주기가 종료되었으나, 다량의 고내구성 휴면란(Dormant Eggs)이 저질층에서 발견되었습니다.
                      </p>
                      <button onClick={restartGame} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl hover:-translate-y-2 active:translate-y-0">
                        <Dna size={22} /> NEXT GENERATION HATCH
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 font-mono text-xs mb-10 uppercase leading-loose font-black px-6">사전에 자손 증식 데이터를 확보하지 못했습니다. 실험 초기화가 필요합니다.</p>
                      <button onClick={restartGame} className="w-full py-6 bg-slate-800 text-white rounded-[2.5rem] font-black text-sm hover:bg-slate-900 transition-all shadow-2xl">
                        REBOOT SIMULATION
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-8 p-10 bg-white rounded-[4rem] border border-slate-100 shadow-2xl ring-12 ring-slate-50/50">
            {[
              { icon: Utensils, label: "NUTRIENTS", action: feed, disabled: !triops.isAlive || triops.stage === LifeStage.EGG || isMolting, color: "orange" },
              { icon: Droplets, label: "PURIFY", action: cleanTank, disabled: !triops.isAlive, color: "blue" },
              { icon: Wind, label: "OXYGEN", action: addOxygen, disabled: !triops.isAlive, color: "cyan" },
              { icon: Sun, label: "OPTICS", action: toggleLight, disabled: !triops.isAlive, active: tank.isLightOn, color: "yellow" }
            ].map((btn, i) => (
              <button 
                key={i} 
                onClick={btn.action} 
                disabled={btn.disabled} 
                className={`flex flex-col items-center justify-center gap-5 p-8 rounded-[3rem] transition-all active:scale-90 disabled:opacity-5 border-2 shadow-sm
                  ${btn.active === false ? 'bg-slate-100 text-slate-400 border-slate-200' : 
                    btn.active === true ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                    'bg-white text-slate-600 border-slate-100 hover:border-blue-400 hover:text-blue-600 hover:shadow-2xl hover:-translate-y-2'}`}
              >
                <btn.icon size={32} />
                <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-8">
          <section className="flex-1 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            <h2 className="text-[12px] font-mono font-black mb-10 flex items-center gap-3 text-slate-400 uppercase tracking-widest">
              <History size={20} className="text-blue-500" /> Archive Log
            </h2>
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="mt-32 text-center opacity-10 flex flex-col items-center gap-4">
                  <History size={64} />
                  <p className="text-[12px] font-black uppercase tracking-widest">Waiting for Data</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="text-[12px] leading-relaxed border-l-4 border-slate-50 pl-5 py-2 group hover:border-blue-200 transition-all hover:bg-slate-50/50 rounded-r-2xl">
                    <span className="text-slate-300 mr-2 text-[10px] font-mono font-black">[{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                    <span className={`font-bold tracking-tight ${
                      log.type === 'success' ? 'text-green-600' : 
                      log.type === 'error' ? 'text-red-500' : 
                      log.type === 'warning' ? 'text-orange-500' : 'text-slate-700'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-slate-900 p-10 rounded-[4rem] shadow-2xl transform hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3 mb-6 text-blue-400 font-mono text-[11px] font-black uppercase tracking-widest">
              <Info size={20} /> Field Data
            </div>
            <p className="text-[13px] text-slate-300 leading-relaxed italic font-medium selection:bg-blue-500/30">
              {showFact ? fact : "준비: DATA_ARCHIVE 스캔 버튼을 활성화하여 중앙 데이터베이스에 접속하십시오."}
            </p>
          </section>
        </div>
      </div>

      <footer className="mt-24 mb-16 text-slate-300 font-mono text-[10px] uppercase tracking-[0.6em] flex flex-col items-center gap-8 border-t-2 border-slate-100 pt-16 w-full">
        <div className="flex gap-16 font-black">
          <span className="flex items-center gap-3"><div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> SYSTEM_ONLINE</span>
          <span className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div> BIO_LINK_STABLE</span>
        </div>
        <div className="opacity-50 text-center max-w-4xl leading-[2] font-black italic normal-case text-slate-400 text-[12px] px-10">
          "긴꼬리투구새우의 해부학적 구조는 3억 년이라는 시간의 시련을 견뎌냈습니다. 
          그들의 관절과 갑각, 그리고 내구란의 생존 본능은 지구 생명 역사상 가장 완벽한 설계 중 하나로 평가받습니다."
        </div>
        <div className="text-[8px] font-mono text-slate-200 uppercase tracking-widest mt-4">Simulation Protocol // TR-301-ALPHA</div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; border: 1px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -20px) rotate(5deg); }
          66% { transform: translate(-5px, -10px) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
