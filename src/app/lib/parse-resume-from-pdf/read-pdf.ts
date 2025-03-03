import * as pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import type { TextItem as PdfjsTextItem } from "pdfjs-dist/types/src/display/api";
import type { TextItem, TextItems } from "lib/parse-resume-from-pdf/types";

export const readPdf = async (fileUrl: string): Promise<TextItems> => {
  const pdfFile = await pdfjs.getDocument(fileUrl).promise;
  let textItems: TextItems = [];

  for (let i = 1; i <= pdfFile.numPages; i++) {
    const page = await pdfFile.getPage(i);
    const textContent = await page.getTextContent();

    await page.getOperatorList();
    const commonObjs = page.commonObjs;

    const pageTextItems = textContent.items
      .map((item) => {
        const {
          str: text,
          dir,
          transform,
          fontName: pdfFontName,
          ...otherProps
        } = item as PdfjsTextItem;

        const x = transform[4];
        const y = transform[5];

        const fontObj = commonObjs.get(pdfFontName);
        const fontName = fontObj.name;

        const newText = text.replace(/-­‐/g, "-");

        const newItem = {
          ...otherProps,
          fontName,
          text: newText,
          x,
          y,
        };
        return newItem;
      })
      .filter((textItem) => textItem.text.trim() !== "");

    textItems.push(...pageTextItems);
  }

  return textItems;
};
