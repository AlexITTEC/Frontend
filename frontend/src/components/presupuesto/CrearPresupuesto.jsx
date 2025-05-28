import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListaPresupuestos from './ListaPresupuestos';
import './CrearPresupuesto.css';
import { FaPlus, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
const CrearPresupuesto = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto_limite, setMontoLimite] = useState('');
  const [refrescarLista, setRefrescarLista] = useState(false);
  const [toast, setToast] = useState({ mensaje: '', tipo: '' });

  const navigate = useNavigate();

  const mostrarToast = (mensaje, tipo = 'info') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast({ mensaje: '', tipo: '' }), 3000);
  };

  const manejadorEnvio = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      mostrarToast('Sesión no activa. Inicia sesión.', 'error');
      navigate('/Login');
      return;
    }

    const cuerpo = {
      titulo,
      descripcion,
      monto_limite: parseFloat(monto_limite)
    };

    console.log('📤 Enviando al backend:', cuerpo);

    try {
      const respuesta = await fetch('http://localhost:3000/api/presupuestos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cuerpo)
      });

      const datos = await respuesta.json();
      console.log('🧾 Respuesta backend:', datos);

      if (respuesta.ok) {
        setTitulo('');
        setDescripcion('');
        setMontoLimite('');
        setRefrescarLista(!refrescarLista);
        mostrarToast('✅ Presupuesto creado correctamente', 'success');
      } else {
        mostrarToast(datos.error || 'Error al crear presupuesto', 'error');
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      mostrarToast('Error de conexión con el servidor', 'error');
    }
  };

  return (
    <div className="contenedor-crear-presupuesto">
<h2>
  Crear Presupuesto{" "}
 <FaInfoCircle
  data-tooltip-id="tooltip"
  data-tooltip-content="Un presupuesto te ayuda a planificar tus gastos mensuales o por categoría"
  className="icono-info"
/>

</h2>
<Tooltip id="tooltip" place="right" effect="solid" />

      {toast.mensaje && (
        <div className={`toast-presupuesto ${toast.tipo}`}>
          {toast.tipo === 'success' && '✅ '}
          {toast.tipo === 'error' && '❌ '}
          {toast.tipo === 'info' && 'ℹ️ '}
          {toast.mensaje}
        </div>
      )}


<form onSubmit={manejadorEnvio} className="formulario-presupuesto">
  <label>
    Título{" "}
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Nombre breve del presupuesto, como 'Vacaciones 2025'"
      className="icono-info"
    />
  </label>
  <input
    type="text"
    value={titulo}
    onChange={(e) => setTitulo(e.target.value)}
    required
  />

  <label>
    Descripción{" "}
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Explicación opcional, por ejemplo: incluye transporte, comida y hotel"
      className="icono-info"
    />
  </label>
  <input
    type="text"
    value={descripcion}
    onChange={(e) => setDescripcion(e.target.value)}
  />

  <label>
    Monto Límite{" "}
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Cantidad máxima que planeas gastar dentro de este presupuesto"
      className="icono-info"
    />
  </label>
  <input
    type="number"
    value={monto_limite}
    onChange={(e) => setMontoLimite(e.target.value)}
    required
  />

  <button type="submit"><FaPlus /> Guardar Presupuesto</button>

  <Tooltip id="tooltip" place="right" effect="solid" />
</form>



      <div style={{ marginTop: '30px' }}>
        <hr />
        <ListaPresupuestos key={refrescarLista} />
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button className="btn-volver" onClick={() => navigate('/Inicio')}>
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearPresupuesto;
