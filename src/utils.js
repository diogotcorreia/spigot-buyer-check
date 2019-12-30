export const encodeCookies = (cookies) =>
  Object.keys(cookies).reduce((acc, v, i) => `${acc}${i === 0 ? '' : '; '}${v}=${cookies[v]}`, '');

export const getCookiesFromHeader = (header) => {
  const cookies = {};
  if (!header) return cookies;
  header.forEach((v) => {
    const cookie = v.split('; ')[0].split('=');
    cookies[cookie[0]] = cookie[1];
  });
  return cookies;
};
