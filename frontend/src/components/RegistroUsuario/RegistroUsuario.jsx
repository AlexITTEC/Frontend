import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaAngleLeft } from "react-icons/fa";
import RegistroImg from "../../assets/RegistroImagen.avif";
import "../RegistroUsuario/RegistroUsuario.css";

const RegistroUsuario = () => {
  const [nombres, setNombres] = useState("");
  const [apellido_paterno, setApellido_paterno] = useState("");
  const [apellido_materno, setApellido_materno] = useState("");
  const [numero_telefono, setnumero_Telefono] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const validarFormulario = () => {
    const nuevoErrores = {};
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoRegex = /^\d{10}$/;

    if (!correoRegex.test(email)) nuevoErrores.email = "Correo electrónico no válido.";
    if (!telefonoRegex.test(numero_telefono)) nuevoErrores.numero_telefono = "El número debe tener 10 dígitos.";
    if (contraseña.length < 6) nuevoErrores.contraseña = "Debe tener al menos 6 caracteres.";
    if (contraseña !== confirmPassword) nuevoErrores.confirmPassword = "Las contraseñas no coinciden.";
    if (!nombres.trim()) nuevoErrores.nombres = "Este campo es obligatorio.";
    if (!apellido_paterno.trim()) nuevoErrores.apellido_paterno = "Este campo es obligatorio.";

    setErrores(nuevoErrores);
    return Object.keys(nuevoErrores).length === 0;
  };

  const manejadorRegistro = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const userData = {
      nombres,
      apellido_paterno,
      apellido_materno,
      numero_telefono,
      email,
      contraseña,
    };

    try {
      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert("Usuario registrado exitosamente");
        navigate("/Login"); // Redirige al login después del registro
      } else {
        const errorData = await response.json();
        alert("Error en el registro: " + (errorData.mensaje || "Error desconocido"));
      }
    } catch (error) {
      alert("Ocurrió un error al registrar el usuario");
    }
  };

  return (
    <div className="containerReg">
      <div className="right-panelReg">
        <div className="illustrationReg">
          <img src={RegistroImg} alt="RegistroImg" />
        </div>
      </div>

      <div className="left-panelReg">
        <div className="left-panel-tituloReg">
          <div className="titulo-headerReg">
            <Link to="/" className="botonReg-clase"><FaAngleLeft /></Link>
            <h1>FinTrack</h1>
          </div>
          <p>Aprende, ahorra y crece</p>
        </div>

        <form className="formReg" onSubmit={manejadorRegistro}>
          <div className="bienvenidoReg">
            <h2>¡Regístrate Ahora!</h2>
          </div>

          <div className="input-groupReg">
            <FaLock className="iconReg" />
            <input
              type="text"
              placeholder="Nombre(s)"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              style={{ borderBottom: errores.nombres ? "2px solid red" : "" }}
              required
            />
          </div>
          {errores.nombres && <p className="error-mensaje">{errores.nombres}</p>}

          <div className="input-groupReg">
            <FaLock className="iconReg" />
            <input
              type="text"
              placeholder="Apellido Paterno"
              value={apellido_paterno}
              onChange={(e) => setApellido_paterno(e.target.value)}
              style={{ borderBottom: errores.apellido_paterno ? "2px solid red" : "" }}
              required
            />
          </div>
          {errores.apellido_paterno && <p className="error-mensaje">{errores.apellido_paterno}</p>}

          <div className="input-groupReg">
            <FaLock className="iconReg" />
            <input
              type="text"
              placeholder="Apellido Materno"
              value={apellido_materno}
              onChange={(e) => setApellido_materno(e.target.value)}
            />
          </div>

          <div className="input-groupReg">
            <FaLock className="iconReg" />
            <input
              type="tel"
              placeholder="Número de Teléfono"
              value={numero_telefono}
              onChange={(e) => setnumero_Telefono(e.target.value)}
              style={{ borderBottom: errores.numero_telefono ? "2px solid red" : "" }}
              required
            />
          </div>
          {errores.numero_telefono && <p className="error-mensaje">{errores.numero_telefono}</p>}

          <div className="input-groupReg">
            <FaEnvelope className="iconReg" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ borderBottom: errores.email ? "2px solid red" : "" }}
              required
            />
          </div>
          {errores.email && <p className="error-mensaje">{errores.email}</p>}

          <div className="input-groupReg">
            <FaLock className="iconReg" />
            <input
              type="password"
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              style={{ borderBottom: errores.contraseña ? "2px solid red" : "" }}
              required
            />
          </div>
          {errores.contraseña && <p className="error-mensaje">{errores.contraseña}</p>}

          <div className="input-groupReg">
            <FaLock className="iconReg" />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ borderBottom: errores.confirmPassword ? "2px solid red" : "" }}
              required
            />
          </div>
          {errores.confirmPassword && <p className="error-mensaje">{errores.confirmPassword}</p>}

          <button type="submit" className="Register-button">Registrarse</button>
        </form>

        <p className="ya-tienes-cuenta">
          ¿Ya tienes una cuenta?
          <Link to="/Login"> Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegistroUsuario;
