// Downloads sandbox.rbxl from the GitHub repo and saves it locally
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const RAW_URL = "https://raw.githubusercontent.com/evilbocchi/eternal-empire-sandbox/main/sandbox.rbxl";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEST_PATH = path.join(__dirname, "upstream.rbxl");

function downloadFile(url, dest) {
    const file = fs.createWriteStream(dest);
    https
        .get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => {});
                handleDownloadError(new Error(`Failed to download file: ${response.statusCode}`), dest);
                return;
            }
            response.pipe(file);
            file.on("finish", () => {
                file.close();
            });
        })
        .on("error", (err) => {
            file.close();
            fs.unlink(dest, () => {});
            handleDownloadError(err, dest);
        });
}

function handleDownloadError(err, dest) {
    if (fs.existsSync(dest)) {
        // eslint-disable-next-line no-console
        console.warn(`Warning: ${err.message} (using existing ${path.basename(dest)})`);
        process.exit(0);
    } else {
        // eslint-disable-next-line no-console
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

downloadFile(RAW_URL, DEST_PATH);
