import { bucket } from "../../config/firebaseConfig";
import getErrorMessage from "./getErrorMessage";

const deleteFileFirebase = async (fileUrl: string) => {
  try {
    // * Ini regex pelajari lagi
    const matches = fileUrl.match(
      /https:\/\/firebasestorage.googleapis.com\/v0\/b\/[^\/]+\/o\/([^?]+)/
    );

    if (!matches) throw new Error("Invalid file URL");

    // * Biasanya path file itu biasanya emcode makanya di decode dulu
    const filePath = decodeURIComponent(matches[1]);

    await bucket.file(filePath).delete();
  } catch (error) {
    getErrorMessage(error);
  }
};

export default deleteFileFirebase;
