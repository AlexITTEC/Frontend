import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (location.state?.creado) {
      setMensaje('✅ Presupuesto creado con éxito');
      setTimeout(() => setMensaje(''), 4000); // Ocultar el mensaje después de 4 segundos
    }
  }, [location.state]);

  return (
    <div className="home-contenedor">
      <div className="bienvenida">
        <h1>¡Bienvenido, {usuario?.nombres || 'Usuario'}!</h1>
        <p>Administra tus finanzas de manera sencilla y eficiente.</p>

        <button className="boton-navegacion" onClick={() => navigate('/CrearPresupuesto')}>
          Crear nuevo presupuesto
        </button>

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      </div>
    </div>
  );
};

export default Home;
