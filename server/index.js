var express = require("express");
var bodyParser = require("body-parser");
var vision = require("@google-cloud/vision");
var { createCanvas, loadImage } = require("canvas");
var fs = require("fs");
const shortid = require("shortid");
var sizeOf = require("image-size");

var app = express();

const client = new vision.ImageAnnotatorClient({
    keyFilename: "apikey.json",
});

const jsonParser = bodyParser.json({ limit: "15mb" });

app.post("/upload", jsonParser, async function (req, res) {
    console.log("upload istegi geldi");
    const base64 = req.body.img;

    const fileName = shortid.generate();
    const imgBuffer = Buffer.from(base64, "base64");

    const request = {
        image: {
            content: imgBuffer,
        },
    };

    const [result] = await client.objectLocalization(request);

    console.log(result);

    fs.writeFileSync("./images/" + fileName + ".jpg", imgBuffer);

    const margin = 24;

    const dimensions = sizeOf(imgBuffer);
    const canvas = createCanvas(dimensions.width + margin * 2, dimensions.height + margin * 2);
    const context = canvas.getContext("2d");

    // TODO: better random colors

    loadImage("./images/" + fileName + ".jpg").then((image) => {
        context.drawImage(image, margin, margin, dimensions.width, dimensions.height);

        context.fillStyle = "#ff0000";
        context.font = "bold 16pt Arial";

        result.localizedObjectAnnotations.forEach((element, index) => {
            context.beginPath();

            let r = Math.floor(Math.random() * 256);
            let g = Math.floor(Math.random() * 256);
            let b = Math.floor(Math.random() * 256);

            context.fillStyle = "rgb(" + r + ", " + g + "," + b + ")";

            let vertices = element.boundingPoly.normalizedVertices;

            vertices = vertices.map((vertex) => ({
                x: vertex.x * dimensions.width,
                y: vertex.y * dimensions.height,
            }));

            for (let i = 0; i < vertices.length; i++) {
                const nextIndex = (i + 1) % vertices.length;

                context.moveTo(vertices[i].x + margin, vertices[i].y + margin);
                context.lineTo(vertices[nextIndex].x + margin, vertices[nextIndex].y + margin);
            }

            context.strokeStyle = "rgb(" + r + ", " + g + "," + b + ")";
            context.lineWidth = 3;
            context.stroke();

            context.lineWidth = 1;
            context.strokeStyle = "black";
            context.fillText(element.name, vertices[0].x + margin, vertices[0].y - 4 + margin);
            context.strokeText(element.name, vertices[0].x + margin, vertices[0].y - 4 + margin);
        });

        const canvasBuffer = canvas.toBuffer("image/png");
        fs.writeFileSync("./images/" + fileName + "_out.jpg", canvasBuffer);
        console.log("cevap donduruluyor");
        res.send(
            JSON.stringify({
                url: "/images/" + fileName + "_out.jpg",
                width: dimensions.width,
                height: dimensions.height,
            })
        );
    });
});

console.log("server basliyor");

app.use("/images", express.static("images"));
app.listen(3000);
