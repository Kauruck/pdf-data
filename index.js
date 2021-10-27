const express = require('express');
const port = 3000
const app = express();
const PDFParser = require("pdf2json");
const fs = require('fs');

const pdfParser = new PDFParser();

const keys = ["This is A", "This is B"];

let values = [];

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    keys.forEach(k => {
        values[k] = [];
    })
    let lastKey = "";
    pdfData.Pages.forEach(e => {
        e.Texts.forEach(t => {
            if (t.R != null && t.R[0] != null) {
                let val = t.R[0].T.replace(/%20/gi, " ");
                console.log(val);
                if (lastKey != "") {
                    console.log(values[lastKey].includes(val));
                    if (values[lastKey][val] != null)
                        values[lastKey][val] += 1;
                    else
                        values[lastKey][val] = 1;
                    lastKey = ""
                }
                else if (keys.includes(val)) {
                    lastKey = val;
                }
            }
        })
    })
    // console.log(values);
});

const chart = {
    pages: values.length,
    data: values
};

function flattenArray(array) {
    let out = [];
    for (let key in array) {
        console.log(key);
        out.push(key);
        if (Array.isArray(array[key]))
            out.push(flattenArray(array[key]));
        else
            out.push(array[key]);
    }
    return out;
}

pdfParser.loadPDF("./Test.pdf")


app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    console.log(values);
    console.log(JSON.stringify(flattenArray(values)));
    res.render('index', {
        chart: {
            length: 2,
            data: JSON.stringify(flattenArray(values))
        }
    });
})

app.listen(port, () => {
    console.log("Example app listening at http://localhost:${port}")
})