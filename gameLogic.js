/**
 * 「10 만들기 탐험대」 미니게임 및 보스 대결 로직 엔진
 */

export class MathEngine {
  /**
   * 10의 보수 쌍 생성 (a + b = 10)
   */
  static getRandomPair() {
    const a = Math.floor(Math.random() * 9) + 1; // 1~9
    const b = 10 - a;
    return { a, b };
  }

  /**
   * 보스전 10문제 생성
   */
  static generateBossQuestions() {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const { a, b } = this.getRandomPair();
      const type = Math.floor(Math.random() * 3);
      
      if (type === 0) {
        // 유형 1: a + ? = 10
        questions.push({
          questionText: `${a} +  ❓  = 10`,
          answer: b,
          options: this.generateOptions(b)
        });
      } else if (type === 2) {
        // 유형 2: ? + b = 10
        questions.push({
          questionText: `❓  + ${b} = 10`,
          answer: a,
          options: this.generateOptions(a)
        });
      } else {
        // 유형 3: 10 - a = ?
        questions.push({
          questionText: `10 - ${a} =  ❓`,
          answer: b,
          options: this.generateOptions(b)
        });
      }
    }
    return questions;
  }

  /**
   * 4지선다 보기 생성
   */
  static generateOptions(correctAnswer) {
    const optionsSet = new Set([correctAnswer]);
    while (optionsSet.size < 4) {
      const rand = Math.floor(Math.random() * 10);
      optionsSet.add(rand);
    }
    return Array.from(optionsSet).sort(() => Math.random() - 0.5);
  }
}
