export function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = padLeft(date.getHours());
  const minutes = padLeft(date.getMinutes());
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

export function padLeft(thing, padding='00') {
  const padded = padding + thing.toString();
  const length = padded.length;
  return padded.slice(length - 2, length);
}