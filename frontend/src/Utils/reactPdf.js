// 3.6.172
import * as PDFJS from "pdfjs-dist";
PDFJS.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.189/pdf.worker.mjs";

export async function countCharactersInPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const pdfData = new Uint8Array(event.target.result);
        const pdf = await PDFJS.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        let totalCharacters = 0;

        for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const { items } = await page.getTextContent();

          const pageText = items.map((item) => item.str).join("");
          totalCharacters += pageText.length;
        }

        resolve(totalCharacters);
      } catch (error) {
        console.log(error);
        resolve(0);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}
