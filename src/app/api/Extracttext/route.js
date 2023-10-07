import fetch from 'node-fetch';
const PDFExtract = require('pdf.js-extract').PDFExtract;
import * as pdfjs from "pdf.js-extract/lib/pdfjs/pdf.js";
const pdfExtract = new PDFExtract();
import * as pdfjsWorker from "pdf.js-extract/lib/pdfjs/pdf.worker.js";
pdfjsWorker
pdfjs.GlobalWorkerOptions.workerSrc = "pdf.js-extract/lib/pdfjs/pdf.worker.js";


export async function POST(req) {

    const { downloadURL } = await req.json();

    const pdfResponse = await fetch(downloadURL);
    const pdfData = await pdfResponse.buffer();


    const options = {
        firstPage: 1,
        lastPage: 2,
    };

    const data = await pdfExtract.extractBuffer(pdfData, options);
    const extractedPages = data.pages;


    let extractedString = '';
    for (const page of extractedPages) {
        for (const item of page.content) {
            extractedString += item.str;
        }
    }

    console.log(extractedString)
    return Response.json({ extractedString })

}