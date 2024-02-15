import { names, emailProvider, subjects, predicates, objects, adverbs } from "./randomWords";

export const randomString = () => {
  return Math.random().toString().substring(7);
};

export const randomIndex = (lengthArray: number) => {
  return Math.floor(Math.random() * lengthArray);
};

export const randomName = () => {
  const totalNames = names.length;
  const index = randomIndex(totalNames);

  return `${names[index]}-${randomString()}`;
};

export const emailFromRandomName = () => {
  const name = randomName();
  const totalEmailProvider = emailProvider.length;
  const index = randomIndex(totalEmailProvider);

  return `${name}@${emailProvider[index]}`;
};
