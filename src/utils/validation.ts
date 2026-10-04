export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Ingresa tu correo electrónico.";
  if (!EMAIL_REGEX.test(v))
    return "Ingresa un correo válido. Ejemplo: usuario@gmail.com";
  return undefined;
}
export function validateUsername(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Ingresa un nombre de usuario.";
  if (v.length < 3 || v.length > 20)
    return "Debe tener entre 3 y 20 caracteres.";
  return undefined;
}
export function validatePassword(value: string): string | undefined {
  if (!value) return "Ingresa una contraseña.";
  if (!PASSWORD_REGEX.test(value))
    return "La contraseña no cumple los requisitos.";
  return undefined;
}
export function passwordChecks(p: string) {
  return [
    { label: "Mínimo 6 caracteres", ok: p.length >= 6 },
    { label: "Al menos una letra", ok: /[A-Za-z]/.test(p) },
    { label: "Al menos un número", ok: /\d/.test(p) },
    { label: "Al menos un símbolo (@ $ ! % * ? &)", ok: /[@$!%*?&]/.test(p) },
    {
      label: "Solo letras, números y @ $ ! % * ? &",
      ok: p.length > 0 && /^[A-Za-z\d@$!%*?&]+$/.test(p),
    },
  ];
}