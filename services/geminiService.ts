
import { GoogleGenAI } from "@google/genai";
import { LifeStage, TriopsState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTriopsThought = async (state: TriopsState): Promise<string> => {
  try {
    const prompt = `You are a Long-tailed Tadpole Shrimp (Triops longicaudatus) in a virtual pet game.
    Your current status:
    - Stage: ${state.stage}
    - Age: ${state.age} cycles
    - Hunger: ${state.hunger}/100
    - Health: ${state.health}/100

    Write a short, quirky, first-person "thought" or status message (max 20 words). 
    If you are an egg, talk about waiting to hatch. If you are an adult, talk about digging or being a living fossil.
    The tone should be slightly primitive but charming. Use Korean as requested by the original prompt's context.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
    });

    return response.text?.trim() || "꼬물꼬물... 물이 시원해요.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "배가 조금 고픈 것 같아요...";
  }
};

export const getTriopsFact = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: "긴꼬리투구새우에 대한 흥미로운 과학적 사실 하나를 알려줘. 1~2문장으로 짧게." }] },
    });
    return response.text?.trim() || "긴꼬리투구새우는 3억 년 전부터 모습이 거의 변하지 않은 '살아있는 화석'입니다.";
  } catch (error) {
    return "긴꼬리투구새우는 논의 해충을 잡아먹는 익충입니다.";
  }
};
