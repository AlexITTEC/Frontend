import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './verificarCodigo.css'; // crea este CSS si quieres
import { FaKey } from 'react-icons/fa';

const VerificarCodigo = () => {
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const email = localStorage.getItem('correoRecuperacion');

  const manejarVerificacion = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/usuarios/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje('✅ Código verificado correctamente');
        setTimeout(() => navigate('/NuevaContraseña'), 1500);
      } else {
        setMensaje(`❌ ${data.mensaje}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setMensaje('❌ Error al conectar con el servidor');
    }
  };

  return (
    <div className="verificacion-container">
      <h2>Verificación de código</h2>
      <p>Introduce el código que te enviamos a tu correo: <strong>{email}</strong></p>
      <form onSubmit={manejarVerificacion}>
        <div className="input-group">
          <FaKey className="icon" />
          <input
            type="text"
            placeholder="Código de 6 dígitos"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="verificar-btn">Verificar</button>
      </form>
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default VerificarCodigo;
