const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const PNG = require("pngjs").PNG;

// Importación dinámica de pixelmatch
let pixelmatch;

async function loadPixelmatch() {
  if (!pixelmatch) {
    try {
      const module = await import("pixelmatch");
      pixelmatch = module.default || module;
    } catch (error) {
      // Si la importación ES6 falla, intentar CommonJS
      try {
        pixelmatch = require("pixelmatch");
      } catch (err) {
        throw new Error(
          "No se pudo cargar pixelmatch. Asegúrate de que esté instalado: npm install pixelmatch"
        );
      }
    }
  }
  return pixelmatch;
}

const baseDir = path.resolve(__dirname);
const presentationsDir = path.join(baseDir, "presentation");
const pdfDir = path.join(baseDir, "pdf");
const slidesDir = path.join(baseDir, "slides");

// Archivo compare.png que usarás para buscar coincidencia (ponlo en baseDir)
const compareImagePath = path.join(baseDir, "compare.png");

// Crear carpetas base si no existen
for (const d of [pdfDir, slidesDir]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d);
}

const pptxFiles = fs
  .readdirSync(presentationsDir)
  .filter((f) => f.endsWith(".pptx"));
if (pptxFiles.length === 0) {
  console.log("No hay archivos .pptx en carpeta 'presentation'");
  process.exit(0);
}

async function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject({ err, stderr });
      else resolve({ stdout, stderr });
    });
  });
}

function readPNG(filepath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) {
      reject(new Error(`Archivo no encontrado: ${filepath}`));
      return;
    }

    fs.createReadStream(filepath)
      .pipe(new PNG())
      .on("parsed", function () {
        resolve(this);
      })
      .on("error", reject);
  });
}

async function getDifferencePercentage(imgPath1, imgPath2, threshold = 0.1) {
  try {
    const pixelmatchFn = await loadPixelmatch();

    const img1 = await readPNG(imgPath1);
    const img2 = await readPNG(imgPath2);

    if (img1.width !== img2.width || img1.height !== img2.height) {
      console.log(
        `Dimensiones no coinciden: compare.png (${img1.width}x${img1.height}), slide (${img2.width}x${img2.height})`
      );
      return 100; // Diferencia total si no tienen igual tamaño
    }

    const diffPixels = pixelmatchFn(
      img1.data,
      img2.data,
      null,
      img1.width,
      img1.height,
      { threshold }
    );

    const totalPixels = img1.width * img1.height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    return diffPercentage;
  } catch (e) {
    console.error("Error leyendo imágenes para comparación:", e.message);
    return 100; // Diferencia total en caso de error
  }
}

(async () => {
  // Verificar que existe compare.png
  if (!fs.existsSync(compareImagePath)) {
    console.error(
      `❌ Error: No se encontró el archivo compare.png en: ${compareImagePath}`
    );
    console.log(
      "Por favor, coloca el archivo compare.png en la carpeta raíz del proyecto."
    );
    process.exit(1);
  }

  for (const pptxFile of pptxFiles) {
    try {
      const baseName = path.parse(pptxFile).name;

      const pptxPath = path.join(presentationsDir, pptxFile);
      const pdfPath = path.join(pdfDir, baseName + ".pdf");
      const outputSlidesDir = path.join(slidesDir, baseName);

      if (!fs.existsSync(outputSlidesDir))
        fs.mkdirSync(outputSlidesDir, { recursive: true });

      // Paso 1: Convertir PPTX a PDF
      console.log(`Convirtiendo ${pptxFile} a PDF...`);
      const convertToPdfCmd = `soffice --headless --convert-to pdf --outdir "${pdfDir}" "${pptxPath}"`;
      await execCmd(convertToPdfCmd);
      console.log(`✅ PDF generado: ${pdfPath}`);

      // Paso 2: Convertir PDF a PNG (todas)
      console.log(`Convirtiendo ${baseName}.pdf a PNG...`);
      const pdfToPngCmd = `pdftoppm -png "${pdfPath}" "${path.join(
        outputSlidesDir,
        "slide"
      )}"`;
      await execCmd(pdfToPngCmd);
      console.log(`✅ Imágenes exportadas en: ${outputSlidesDir}`);

      // Paso 3: Buscar imagen "compare.png" y borrar anteriores
      const slideImages = fs
        .readdirSync(outputSlidesDir)
        .filter((f) => f.endsWith(".png"))
        .sort(); // ordenar para asegurar orden

      let compareIndex = -1;

      for (let i = 0; i < slideImages.length; i++) {
        const slideImgPath = path.join(outputSlidesDir, slideImages[i]);
        const diffPercent = await getDifferencePercentage(
          compareImagePath,
          slideImgPath
        );
        const isMatch = diffPercent < 1; // Aquí defines qué tanto diferencia permites, ej 1%

        console.log(
          `Comparando ${
            slideImages[i]
          } con compare.png => Diferencia: ${diffPercent.toFixed(
            2
          )}% - Match: ${isMatch}`
        );

        if (isMatch) {
          compareIndex = i;
          break;
        }
      }

      if (compareIndex === -1) {
        console.log(`⚠️ No se encontró la imagen 'compare.png' en ${baseName}`);
      } else {
        console.log(
          `🧹 Imagen 'compare.png' encontrada en posición ${compareIndex}. Borrando imágenes anteriores...`
        );

        // Borra compare.png y todas anteriores
        for (let j = 0; j <= compareIndex; j++) {
          const fileToDelete = path.join(outputSlidesDir, slideImages[j]);
          fs.unlinkSync(fileToDelete);
          console.log(`🗑️ Borrada imagen: ${slideImages[j]}`);
        }
      }
    } catch (e) {
      console.error(
        `❌ Error procesando ${pptxFile}:`,
        e.err?.message || e.message || e
      );
      if (e.stderr) console.error("Stderr:", e.stderr);
    }
  }
  console.log("✅ Procesamiento completado para todos los archivos.");
})();
