export function stringToUUID(input?: string) {
  let str = input || '' + Math.random() * new Date().getTime(); //generate random string

  let c = 0;
  for (let i = 0; i < str.length; i++)
    c = (c + (str.charCodeAt(i) * (i + 1) - 1)) & 0xfffffffffffff; //calculate checksum'ish

  str = c.toString(16) + str;
  let p = str.length;
  return 'xxxxxxxx-xxxx-mxxx-nxxx-xxxxxxxxxxxx'.replace(/[xmn]/g, (c, i, s) => {
    s = p = str[(i ** i + p + 1) % str.length].charCodeAt(0) + p + i;
    if (c === 'x') s %= 16;
    //0-F
    else if (c === 'm') s = (s % 4) + 1;
    //1-5
    else s = (s % 4) + 8; //8-B

    return s.toString(16);
  });
}

/**
 * Set a cookie with the specified name, value, and expiry date.`
 * @param name The cookie name`
 * @param value The cookie value
 * @param expires The number of days after which the cookie expires
 */
export function setCookie(name: string, value: string, expires: number) {
  const date = new Date();
  date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
  const expiresStr = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expiresStr}; path=/`;
}

/**
 * Get the value of the cookie with the specified name
 * @param name The name of the cookie
 * @return The cookie value, or the empty string if it does not exist
 */
export function getCookie(name: string) {
  name = name + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
