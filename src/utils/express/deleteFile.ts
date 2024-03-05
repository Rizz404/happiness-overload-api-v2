import fs from "fs/promises"; // * yang asli ada promisenya
import path from "path";

const deleteFile = async (pathFolder: string, filename: string) => {
  try {
    const filePath = path.join(__dirname, `../public/assets/${pathFolder}/${filename}`);

    await fs.unlink(filePath);
    console.log(`File ${filename} deleted successfully.`);
  } catch (error) {
    throw new Error(`Error deleting file: ${error}`);
  }
};

export default deleteFile;
