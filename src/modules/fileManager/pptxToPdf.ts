import path from "path";
import { execCmd } from "../shared/execCmd";

async function convertPptxToPdf(pptxPath: string, outputDir: string) {
	try {
		const baseName = path.parse(pptxPath).name;
		const pdfPath = path.join(outputDir, baseName + ".pdf");

		console.log(`converting ${path.basename(pptxPath)} to PDF...`);

		const convertToPdfCmd = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${pptxPath}"`;
		await execCmd(convertToPdfCmd);

		console.log(`pdf generated: ${pdfPath}`);
		return pdfPath;
	} catch (error) {
		throw new Error(`failed to convert ${pptxPath} to pdf: ${error}`);
	}
}

async function convertMultiplePptxToPdf(pptxFiles: string[], inputDir: string, outputDir: string) {
	const pdfPaths = [];

	for (const pptxFile of pptxFiles) {
		try {
			const pptxPath = path.join(inputDir, pptxFile);
			const pdfPath = await convertPptxToPdf(pptxPath, outputDir);
			pdfPaths.push(pdfPath);
		} catch (e) {
			console.error(`failed to convert ${pptxFile}:`, e);
		}
	}

	return pdfPaths;
}