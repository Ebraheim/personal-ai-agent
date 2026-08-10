import { knowledgeChunks } from "./knowledge";

export function retrieveRelevantKnowledge(question: string) {
  const normalizedQuestion = question.toLowerCase();

  const scoredChunks = knowledgeChunks.map((chunk) => {
    let score = 0;

    for (const keyword of chunk.keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    return {
      ...chunk,
      score,
    };
  });

  const relevantChunks = scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (relevantChunks.length === 0) {
    return knowledgeChunks
      .filter((chunk) => chunk.id === "profile")
      .map((chunk) => chunk.content)
      .join("\n");
  }

  return relevantChunks
    .map((chunk) => chunk.content)
    .join("\n");
}