import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoFintrack from "../../assets/FintrackBlanco.png";
import { FaSignOutAlt, FaTools } from "react-icons/fa";
import "./Inicio.css";
import DashboardFinanciero from "../DashboardFinanciero/DashboardFinanciero";

const Inicio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rutaActual = location.pathname;

  const [nombreUsuario, setNombreUsuario] = useState("Cargando...");
  const [rolUsuario, setRolUsuario] = useState("");
  const [avatarUsuario, setAvatarUsuario] = useState("/default-avatar.png");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNombreUsuario("No autenticado");
      return;
    }

    const obtenerPerfil = async () => {
      try {
        const res = await fetch("/api/usuarios/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setNombreUsuario(data.nombres || "Usuario");
          setRolUsuario(data.rol || "usuario");
          setAvatarUsuario(data.avatar || "/default-avatar.png");
        } else {
          console.warn("No se pudo cargar el perfil");
        }
      } catch (err) {
        console.error("Error al cargar perfil desde backend:", err);
      }
    };

    obtenerPerfil();
  }, []);

  useEffect(() => {
    const cerrarMenuSiClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", cerrarMenuSiClickFuera);
    return () => document.removeEventListener("mousedown", cerrarMenuSiClickFuera);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    navigate("/login");
  };

  const esActivo = (ruta) => (rutaActual === ruta ? "activo" : "");

  return (
    <div className="contenedor-inicio">
      <nav className="barra-navegacion">
        <div className="barra-navegacion-contenido">
          <div className="logo-y-lista">
            <div className="logo">
              <img className="logo-fintrack" src={logoFintrack} alt="Logo Fintrack" />
            </div>
            <ul className="barra-navegacion-lista">
              <li onClick={() => navigate("/CrearPresupuesto")} className={esActivo("/CrearPresupuesto")}>Presupuestos</li>
              <li onClick={() => navigate("/Categorias")} className={esActivo("/Categorias")}>Categorías</li>
              <li onClick={() => navigate("/Transacciones")} className={esActivo("/Transacciones")}>Transacciones</li>
              <li onClick={() => navigate("/MetasAhorro")} className={esActivo("/MetasAhorro")}>Metas y Ahorros</li>
              <li onClick={() => navigate("/salud-financiera")} className={esActivo("/salud-financiera")}>Salud Financiera</li>
              {rolUsuario === "admin" && (
                <li onClick={() => navigate("/salud-admin")} className={esActivo("/salud-admin")}>
                  <FaTools className="icono-admin" /> Admin Salud
                </li>
              )}
            </ul>
          </div>

          <div className="barra-navegacion-derecha" ref={menuRef}>
            <div className="usuario-bloque" onClick={() => setMenuAbierto(!menuAbierto)}>
              <img src={avatarUsuario} alt="avatar" className="avatar-mini" />
              <span className="nombre-usuario">{nombreUsuario}</span>
            </div>

            {menuAbierto && (
              <div className="menu-desplegable-usuario">
                <button onClick={() => { setMenuAbierto(false); navigate("/configuracion"); }}>
                  ⚙ Configuración
                </button>
                <button onClick={cerrarSesion}>
                  <FaSignOutAlt className="icono-salida" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <DashboardFinanciero />
    </div>
  );
};

export default Inicio;
