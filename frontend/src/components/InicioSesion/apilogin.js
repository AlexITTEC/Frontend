import axios from 'axios';

const API_URL = 'http://localhost:3000/api/usuarios/login'; // ajusta si tu backend usa otro puerto

export const loginUsuario = async (email, contraseña) => {
  try {
    const respuesta = await axios.post(API_URL, { email, contraseña });
    return respuesta.data;
  } catch (error) {
    throw error.response.data;
  }
};
