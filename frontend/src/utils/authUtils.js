import { jwtDecode } from "jwt-decode"; // ✅ Correcto

export const obtenerUsuarioActual = () => {
  const token = localStorage.getItem("token"); // o sessionStorage
  if (!token) return null;

  try {
    const usuarioDecodificado = jwtDecode(token);
    return usuarioDecodificado;
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
};
