import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16_384, r: 8, p: 1 } as const;
type ScryptOptions = { N: number; r: number; p: number };

function deriveKey(password: string, salt: string, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await deriveKey(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, nValue, rValue, pValue, salt, hashHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || !nValue || !rValue || !pValue || !salt || !hashHex) return false;

  try {
    const expected = Buffer.from(hashHex, "hex");
    const derivedKey = await deriveKey(password, salt, expected.length, {
      N: Number(nValue),
      r: Number(rValue),
      p: Number(pValue),
    });
    return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
  } catch {
    return false;
  }
}
