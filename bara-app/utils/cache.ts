export default function cache(key: string, fetcher: () => Promise<any>) {
  const cached = localStorage.getItem(key);
  if (cached) return Promise.resolve(JSON.parse(cached));

  return fetcher().then((data) => {
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  });
}
