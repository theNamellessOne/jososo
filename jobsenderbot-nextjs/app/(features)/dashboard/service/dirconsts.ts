import "server-only";

if (!process.env.DATA_DIR_PATH) {
  process.exit("DATA_DIR_PATH not set in .env");
}

if (!process.env.RESUME_DIR_PATH) {
  process.exit("RESUME_DIR_PATH not set in.env");
}

export const relativeDirPath = process.env.DATA_DIR_PATH;

export const relativeResumeDirPath = process.env.RESUME_DIR_PATH;
