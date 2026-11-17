// Validación de contraseñas de una aplicación.
// Reglas de negocio:
//   1. Entre 12 y 64 caracteres (ambos incluidos).
//   2. Al menos una mayúscula, una minúscula, un dígito y un símbolo (lo que no es letra ni dígito).
//   3. Sin espacios.
//   4. No puede contener el nombre de usuario, ni en mayúsculas ni en minúsculas.
//   5. Si la contraseña no es un texto, es un error de programación: lanza TypeError.
// Devuelve { valida, errores }, con un código por cada regla que no se cumple.
export function validarContrasena(clave, { usuario = '' } = {}) {
  if (typeof clave !== 'string') {
    throw new TypeError('La contraseña tiene que ser un texto');
  }
  const errores = [];
  if (clave.length < 12 || clave.length > 64) errores.push('longitud');
  if (!/[A-ZÁÉÍÓÚÑ]/.test(clave)) errores.push('mayuscula');
  if (!/[a-záéíóúñ]/.test(clave)) errores.push('minuscula');
  if (!/[0-9]/.test(clave)) errores.push('digito');
  if (!/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/.test(clave)) errores.push('simbolo');
  if (/\s/.test(clave)) errores.push('espacios');
  if (usuario && clave.toLowerCase().includes(usuario.toLowerCase())) errores.push('usuario');
  return { valida: errores.length === 0, errores };
}
