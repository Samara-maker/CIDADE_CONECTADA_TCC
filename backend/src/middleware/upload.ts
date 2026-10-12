import multer from "multer";
import path from "path";
import fs from "fs";

const diretorio = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(diretorio)) {
  fs.mkdirSync(diretorio, { recursive: true });
}

const armazenamento = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, diretorio);
  },
  filename: (_req, file, callback) => {
    const sufixo = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extensao = path.extname(file.originalname);
    callback(null, `ocorrencia-${sufixo}${extensao}`);
  },
});

const tiposPermitidos = ["image/jpeg", "image/png", "video/mp4"];

export const upload = multer({
  storage: armazenamento,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (tiposPermitidos.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Formato de arquivo não permitido. Envie JPEG, PNG ou MP4."));
    }
  },
});
