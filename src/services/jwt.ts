// Lectura LOCAL de la fecha de expiración de un JWT (claim "exp").
// Sirve solo para decidir si hay que renovar el token. NO valida la firma:
// la autorización real la sigue haciendo el backend en cada petición.

const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decodeBase64Url(input: string): string {
  const text = input.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  let output = "";
  for (const char of text) {
    const index = BASE64.indexOf(char);
    if (index < 0) throw new Error("Base64 inválido");
    value = (value << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((value >> bits) & 0xff);
      value &= (1 << bits) - 1;
    }
  }
  return output;
}

/** Devuelve la expiración en milisegundos, o null si el token no se puede leer. */
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const data = JSON.parse(decodeBase64Url(payload));
    return typeof data.exp === "number" ? data.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** true si el token ya venció (o vence en menos de `marginMs`). Si no se puede leer, se considera vencido. */
export function isTokenExpired(token: string, marginMs = 30_000): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true;
  return expiry - marginMs <= Date.now();
}
