import { names, emailProvider, subjects, predicates, objects, adverbs } from "./randomWords";

export const randomString = () => {
  return Math.random().toString().substring(7);
};

export const randomIndex = (lengthArray: number) => {
  return Math.floor(Math.random() * lengthArray);
};

// * Kalau fungsinya dijalankan lagi namanya bakal random lagi
let currentName: string; // * Makanya pakai ini biar menyimpan hasil randomnya

export const randomName = () => {
  const totalNames = names.length;
  const index = randomIndex(totalNames);

  currentName = `${names[index]}-${randomString()}`;
  return currentName;
};

export const emailFromRandomName = () => {
  const totalEmailProvider = emailProvider.length;
  const index = randomIndex(totalEmailProvider);

  return `${currentName}@${emailProvider[index]}`;
};
