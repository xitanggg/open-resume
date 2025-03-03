import type {
  TextItems,
  TextScores,
  FeatureSet,
} from "lib/parse-resume-from-pdf/types";

const computeFeatureScores = (
  textItems: TextItems,
  featureSets: FeatureSet[],
  cache: Map<string, number>
): TextScores => {
  const textScores = textItems.map((item) => ({
    text: item.text,
    score: 0,
    match: false,
  }));

  for (let i = 0; i < textItems.length; i++) {
    const textItem = textItems[i];

    for (const featureSet of featureSets) {
      const [hasFeature, score, returnMatchingText] = featureSet;
      const cacheKey = `${textItem.text}-${featureSet.toString()}`;
      if (cache.has(cacheKey)) {
        textScores[i].score += cache.get(cacheKey)!;
        continue;
      }
      const result = hasFeature(textItem);
      if (result) {
        let text = textItem.text;
        if (returnMatchingText && typeof result === "object") {
          text = result[0];
        }

        const textScore = textScores[i];
        if (textItem.text === text) {
          textScore.score += score;
          if (returnMatchingText) {
            textScore.match = true;
          }
        } else {
          textScores.push({ text, score, match: true });
        }
        cache.set(cacheKey, score);
      }
    }
  }
  return textScores;
};

/**
 * Core util for the feature scoring system.
 *
 * It runs each text item through all feature sets and sums up the matching feature scores.
 * It then returns the text item with the highest computed feature score.
 */
export const getTextWithHighestFeatureScore = (
  textItems: TextItems,
  featureSets: FeatureSet[],
  returnEmptyStringIfHighestScoreIsNotPositive = true,
  returnConcatenatedStringForTextsWithSameHighestScore = false
) => {
  const cache = new Map<string, number>();
  const textScores = computeFeatureScores(textItems, featureSets, cache);

  let textsWithHighestFeatureScore: string[] = [];
  let highestScore = -Infinity;
  for (const { text, score } of textScores) {
    if (score >= highestScore) {
      if (score > highestScore) {
        textsWithHighestFeatureScore = [];
      }
      textsWithHighestFeatureScore.push(text);
      highestScore = score;
    }
  }

  if (returnEmptyStringIfHighestScoreIsNotPositive && highestScore <= 0)
    return ["", textScores] as const;

  // Note: If textItems is an empty array, textsWithHighestFeatureScore[0] is undefined, so we default it to empty string
  const text = !returnConcatenatedStringForTextsWithSameHighestScore
    ? textsWithHighestFeatureScore[0] ?? ""
    : textsWithHighestFeatureScore.map((s) => s.trim()).join(" ");

  return [text, textScores] as const;
};
