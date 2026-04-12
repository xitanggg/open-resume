// Getting pdfjs to work is tricky. The following 3 lines would make it work
// https://stackoverflow.com/a/63486898/7699841
import * as pdfjs from "pdfjs-dist";
// @ts-ignore
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import type { TextItem as PdfjsTextItem } from "pdfjs-dist/types/src/display/api";
import type { TextItem, TextItems } from "lib/parse-resume-from-pdf/types";

type ReadPdfOptions = {
  signal?: AbortSignal;
};

const createAbortError = () => {
  const error = new Error("PDF parsing aborted.");
  error.name = "AbortError";
  return error;
};

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw createAbortError();
  }
};

/**
 * Step 1: Read pdf and output textItems by concatenating results from each page.
 *
 * To make processing easier, it returns a new TextItem type, which removes unused
 * attributes (dir, transform), adds x and y positions, and replaces loaded font
 * name with original font name.
 *
 * @example
 * const onFileChange = async (e) => {
 *     const fileUrl = URL.createObjectURL(e.target.files[0]);
 *     const textItems = await readPdf(fileUrl);
 * }
 */
export const readPdf = async (
  fileUrl: string,
  { signal }: ReadPdfOptions = {}
): Promise<TextItems> => {
  throwIfAborted(signal);

  const loadingTask = pdfjs.getDocument(fileUrl);
  const onAbort = () => {
    void loadingTask.destroy();
  };
  signal?.addEventListener("abort", onAbort);

  let textItems: TextItems = [];

  const getComparableText = (text: string) =>
    text
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/+$/g, "")
      .toLowerCase();

  const getNearestTextItemIndex = (items: TextItems, target: TextItem) => {
    if (items.length === 0) return 0;

    const targetX = target.x + target.width / 2;
    const targetY = target.y + target.height / 2;
    let nearestIdx = 0;
    let nearestDistance = Infinity;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemX = item.x + item.width / 2;
      const itemY = item.y + item.height / 2;
      // Vertical alignment matters more than horizontal for line-level insertion.
      const distance = Math.abs(itemY - targetY) * 2 + Math.abs(itemX - targetX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIdx = idx;
      }
    }

    return nearestIdx;
  };

  try {
    const pdfFile = await loadingTask.promise;
    throwIfAborted(signal);

    for (let i = 1; i <= pdfFile.numPages; i++) {
      throwIfAborted(signal);
      // Parse each page into text content
      const page = await pdfFile.getPage(i);
      throwIfAborted(signal);
      const textContent = await page.getTextContent();

      // Wait for font data to be loaded
      await page.getOperatorList();
      throwIfAborted(signal);
      const commonObjs = page.commonObjs;

    // Convert Pdfjs TextItem type to new TextItem type
      const pageTextItems = textContent.items.map((item) => {
        const {
          str: text,
          dir, // Remove text direction
          transform,
          fontName: pdfFontName,
          ...otherProps
        } = item as PdfjsTextItem;

        // Extract x, y position of text item from transform.
        // As a side note, origin (0, 0) is bottom left.
        // Reference: https://github.com/mozilla/pdf.js/issues/5643#issuecomment-496648719
        const x = transform[4];
        const y = transform[5];

        // Use commonObjs to convert font name to original name (e.g. "GVDLYI+Arial-BoldMT")
        // since non system font name by default is a loaded name, e.g. "g_d8_f1"
        // Reference: https://github.com/mozilla/pdf.js/pull/15659
        const fontObj = commonObjs.get(pdfFontName);
        const fontName = fontObj?.name ?? pdfFontName;

        // pdfjs reads a "-" as "-­‐" in the resume example. This is to revert it.
        // Note "-­‐" is "-&#x00AD;‐" with a soft hyphen in between. It is not the same as "--"
        const newText = text.replace(/-­‐/g, "-");

        const newItem = {
          ...otherProps,
          fontName,
          text: newText,
          x,
          y,
        };
        return newItem;
      });

      // Some resumes (including OpenResume exports) encode clickable links as annotations.
      // Add annotation URLs as synthetic text items so parser can reliably extract links.
      const annotations = await page.getAnnotations();
      const annotationTextItems: TextItems = annotations
        .map((annotation: any) => {
          const rawUrl =
            annotation?.url || annotation?.unsafeUrl || annotation?.action || "";
          if (!rawUrl) return null;

          const normalizedText = rawUrl
            .replace(/^mailto:/i, "")
            .replace(/^tel:/i, "");
          const rect = annotation?.rect as number[] | undefined;
          const x = rect?.[0] ?? 0;
          const y = rect?.[3] ?? 0;
          const width = rect && rect.length >= 4 ? rect[2] - rect[0] : 0;
          const height = rect && rect.length >= 4 ? rect[3] - rect[1] : 0;

          const newItem: TextItem = {
            text: normalizedText,
            x,
            y,
            width,
            height,
            fontName: "",
            hasEOL: false,
          };
          return newItem;
        })
        .filter((item): item is TextItem => Boolean(item));

      const existingComparableTexts = new Set(
        pageTextItems.map((item) => getComparableText(item.text))
      );
      const annotationTextItemsToInsert = annotationTextItems.filter(
        (item) => !existingComparableTexts.has(getComparableText(item.text))
      );

      const annotationInsertionInfo = annotationTextItemsToInsert
        .map((item) => ({
          item,
          nearestIdx: getNearestTextItemIndex(pageTextItems, item),
        }))
        .sort((a, b) => a.nearestIdx - b.nearestIdx);

      let offset = 0;
      for (const { item, nearestIdx } of annotationInsertionInfo) {
        pageTextItems.splice(nearestIdx + 1 + offset, 0, item);
        offset += 1;
      }

      // Some pdf's text items are not in order. This is most likely a result of creating it
      // from design softwares, e.g. canvas. The commented out method can sort pageTextItems
      // by y position to put them back in order. But it is not used since it might be more
      // helpful to let users know that the pdf is not in order.
      // pageTextItems.sort((a, b) => Math.round(b.y) - Math.round(a.y));

      // Add text items of each page to total
      textItems.push(...pageTextItems);
    }

    // Filter out empty space textItem noise
    const isEmptySpace = (textItem: TextItem) =>
      !textItem.hasEOL && textItem.text.trim() === "";
    textItems = textItems.filter((textItem) => !isEmptySpace(textItem));

    return textItems;
  } catch (error) {
    if (signal?.aborted) {
      throw createAbortError();
    }
    throw error;
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
};
