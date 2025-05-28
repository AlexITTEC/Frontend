import React, { useState, useEffect } from "react";

const AvatarUploader = ({ token, avatarActual, onAvatarActualizado }) => {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => {
        setPreview(lector.result);
      };
      lector.readAsDataURL(archivo);
    } else {
      setPreview(null);
    }
  }, [archivo]);

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
    setMensaje("");
  };

  const handleUpload = async () => {
    if (!archivo) return;

    const formData = new FormData();
    formData.append("avatar", archivo);

    try {
      const res = await fetch("/api/perfil/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("✅ Avatar actualizado correctamente");
        onAvatarActualizado(data.avatar); // Notificar cambio al padre
        setArchivo(null);
      } else {
        setMensaje("❌ " + (data.mensaje || "Error al subir"));
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error en la subida");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h3>Avatar de perfil</h3>
      <img
        src={preview || avatarActual || "/default-avatar.png"}
        alt="avatar"
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          border: "3px solid #ccc"
        }}
      />
      <div style={{ marginTop: "1rem" }}>
        <input type="file" accept="image/*" onChange={handleArchivoChange} />
        <br />
        <button onClick={handleUpload} disabled={!archivo}>
          Subir avatar
        </button>
      </div>
      {mensaje && <p style={{ marginTop: "1rem", color: "#006400" }}>{mensaje}</p>}
    </div>
  );
};

export default AvatarUploader;
