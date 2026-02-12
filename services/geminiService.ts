
import { LifeStage, TriopsState } from "../types";

// Static fallback facts and thoughts since we're removing AI dependency
const FALLBACK_FACTS = [
  "긴꼬리투구새우는 3억 년 전 고생대부터 모습이 거의 변하지 않은 '살아있는 화석'입니다.",
  "이들은 논의 유해 생물을 잡아먹으며 잡초 성장을 억제하는 고마운 생물입니다.",
  "내구란(Dormant Eggs)은 수년간 건조된 상태에서도 견디다가 물만 있으면 부화할 수 있습니다.",
  "긴꼬리투구새우는 눈이 3개인 것처럼 보이지만, 가운데 있는 것은 빛을 감지하는 기관입니다.",
  "이들은 하루에 자기 몸무게의 40%에 달하는 먹이를 먹을 수 있는 대식가입니다."
];

export const getTriopsThought = async (state: TriopsState): Promise<string> => {
  if (state.stage === LifeStage.EGG) return "언제쯤 따뜻한 물 밖으로 나갈 수 있을까요? 꼬물꼬물...";
  if (state.health < 30) return "몸이 조금 무겁고 힘이 없어요. 수질이 나쁜 걸까요?";
  if (state.hunger < 30) return "배가 너무 고파요. 무언가 먹을 게 없을까요?";
  if (state.stage === LifeStage.ADULT) return "모래 속을 파헤치는 건 정말 즐거운 일이에요! 3억 년 전에도 이랬을까요?";
  return "꼬물꼬물... 물속을 헤엄치는 건 정말 즐거워요.";
};

export const getTriopsFact = async (): Promise<string> => {
  // Return a random fact from the list
  const randomIndex = Math.floor(Math.random() * FALLBACK_FACTS.length);
  return FALLBACK_FACTS[randomIndex];
};
