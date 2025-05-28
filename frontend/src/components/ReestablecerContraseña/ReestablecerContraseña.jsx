import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaAngleLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import auditoriaLogin from '../../assets/AuditoriaFinancieraLogin.jpg';
import './ReestablecerContraseña.css';

const ReestablecerContraseña = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const manejadorRestablecer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/usuarios/enviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('correoRecuperacion', email);
        navigate('/VerificarCodigo');
      } else {
        alert(data.mensaje || 'Error al enviar el código');
      }
    } catch (error) {
      console.error('Error al enviar código:', error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="container">
      <motion.div className="left-panel" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="illustration">
          <img src={auditoriaLogin} alt="Imagen Recuperar Contraseña" />
        </div>
      </motion.div>

      <motion.div className="right-panel" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="right-panel-titulo">
          <div className="titulo-header">
            <Link to="/Login" className="boton-clase"><FaAngleLeft /></Link>
            <h1>FinTrack</h1>
          </div>
          <span>Recupera tu acceso fácilmente</span>
        </div>

        <form className="form" onSubmit={manejadorRestablecer}>
          <div className="bienvenido">
            <h2>¿Olvidaste tu contraseña?</h2>
            <p>Introduce tu correo electrónico para enviarte instrucciones.</p>
          </div>

          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Enviar instrucciones
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReestablecerContraseña;
