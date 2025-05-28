import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import './ConfirmacionEnvio.css';

const ConfirmacionEnvio = () => {
  return (
    <div className="container">
      <motion.div 
        className="confirmation-panel"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FaCheckCircle className="check-icon" />
        <h2>¡Instrucciones enviadas!</h2>
        <p>Revisa tu correo electrónico para seguir el proceso de recuperación de contraseña.</p>
        <Link to="/Login" className="login-button">
          Volver a iniciar sesión
        </Link>
      </motion.div>
    </div>
  );
};

export default ConfirmacionEnvio;
