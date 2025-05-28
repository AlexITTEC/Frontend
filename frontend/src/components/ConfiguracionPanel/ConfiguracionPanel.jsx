import React, { useEffect, useState } from "react";
import AvatarUploader from "../AvatarUploader";
import "./configuracionPanel.css";

const ConfiguracionPanel = () => {
  const token = localStorage.getItem("token");
  const [usuario, setUsuario] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [clave, setClave] = useState({ actual: "", nueva: "" });
  const [confirmarEliminacion, setConfirmarEliminacion] = useState("");

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const res = await fetch("/api/usuarios/perfil", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setUsuario(data);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };
    obtenerPerfil();
  }, []);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 1000);
  };

  const guardarDatos = async () => {
    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(usuario)
      });
      const data = await res.json();
      mostrarMensaje(res.ok ? "✅ Datos actualizados" : "❌ " + data.mensaje, res.ok ? "success" : "error");
    } catch (err) {
      console.error(err);
      mostrarMensaje("❌ Error al actualizar", "error");
    }
  };

  const cambiarContraseña = async () => {
    try {
      const res = await fetch("/api/perfil/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(clave)
      });
      const data = await res.json();
      mostrarMensaje(res.ok ? "✅ Contraseña actualizada" : "❌ " + data.mensaje, res.ok ? "success" : "error");
      setClave({ actual: "", nueva: "" });
    } catch (err) {
      console.error(err);
      mostrarMensaje("❌ Error al cambiar contraseña", "error");
    }
  };

  const eliminarCuenta = async () => {
    try {
      const res = await fetch("/api/perfil", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ confirmar: confirmarEliminacion })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Cuenta eliminada. Cerrando sesión...");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        mostrarMensaje("❌ " + data.mensaje, "error");
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje("❌ Error al eliminar cuenta", "error");
    }
  };

  if (!usuario) return <p>Cargando perfil...</p>;

  return (
    <div className="salud-panel-contenedor">
      <h2 className="salud-panel-titulo">Configuración de cuenta</h2>

      <button className="btn-volver" onClick={() => window.location.href = "/Inicio"}>
        Volver al inicio
      </button>

      {mensaje.texto && (
        <div className={`toast-merge ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <AvatarUploader
        token={token}
        avatarActual={usuario.avatar}
        onAvatarActualizado={(nuevo) => {
          setUsuario({ ...usuario, avatar: nuevo });
          localStorage.setItem("avatar", nuevo);
          localStorage.setItem("avatarUpdated", Date.now());
        }}
      />

      <div className="salud-panel-contenido">
        <h3>Información personal</h3>

        <label>Email</label>
        <input type="email" name="email" value={usuario.email || ""} onChange={handleChange} disabled />

        <label>Nombres</label>
        <input type="text" name="nombres" value={usuario.nombres} onChange={handleChange} />

        <label>Apellido paterno</label>
        <input type="text" name="apellido_paterno" value={usuario.apellido_paterno || ""} onChange={handleChange} />

        <label>Apellido materno</label>
        <input type="text" name="apellido_materno" value={usuario.apellido_materno || ""} onChange={handleChange} />

        <label>Teléfono</label>
        <input type="text" name="numero_telefono" value={usuario.numero_telefono || ""} onChange={handleChange} />

        <button onClick={guardarDatos}>Guardar cambios</button>

        <hr />

        <h3>Cambiar contraseña</h3>

        <label>Contraseña actual</label>
        <input type="password" value={clave.actual} onChange={(e) => setClave({ ...clave, actual: e.target.value })} />

        <label>Nueva contraseña</label>
        <input type="password" value={clave.nueva} onChange={(e) => setClave({ ...clave, nueva: e.target.value })} />

        <button onClick={cambiarContraseña}>Actualizar contraseña</button>

        <hr />

        <h3>Eliminar cuenta</h3>
        <p style={{ color: "#b00" }}>⚠️ Esta acción no se puede deshacer.</p>
        <input
          placeholder='Escribe "ELIMINAR" para confirmar'
          value={confirmarEliminacion}
          onChange={(e) => setConfirmarEliminacion(e.target.value)}
        />
        <button onClick={eliminarCuenta} style={{ backgroundColor: "#b22222", color: "#fff" }}>
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionPanel;
