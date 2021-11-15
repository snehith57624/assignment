export function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function getRandom (array)  {
  return array[Math.floor(Math.random() * array.length)];
};

