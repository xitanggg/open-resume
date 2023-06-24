export const getPxPerRem = () => {
  const bodyComputedStyle = getComputedStyle(
    document.querySelector("body")!
  ) as any;
  return parseFloat(bodyComputedStyle["font-size"]) || 16;
};
