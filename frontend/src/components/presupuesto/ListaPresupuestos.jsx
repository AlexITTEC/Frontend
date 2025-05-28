import React, { useEffect, useState } from 'react';
import { FaTrash, FaEdit, FaCalendarAlt, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import './ListaPresupuestos.css';

const ListaPresupuestos = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [presupuestoEditando, setPresupuestoEditando] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeToast, setMensajeToast] = useState('');

  const token = localStorage.getItem('token');

  const obtenerPresupuestos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/presupuestos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setPresupuestos(data);
      else console.error('❌ Error al obtener presupuestos:', data.error || data.mensaje);
    } catch (error) {
      console.error('❌ Error de conexión:', error);
    }
  };

  useEffect(() => {
    obtenerPresupuestos();
  }, []);

  const mostrarToast = (mensaje) => {
    setMensajeToast(mensaje);
    setTimeout(() => setMensajeToast(''), 3000);
  };

  const abrirModalEditar = (p) => {
    setPresupuestoEditando({ ...p });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setPresupuestoEditando(null);
    setModalVisible(false);
  };

  const guardarEdicion = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/presupuestos/${presupuestoEditando._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: presupuestoEditando.titulo,
          descripcion: presupuestoEditando.descripcion,
          monto_limite: parseFloat(presupuestoEditando.monto_limite)
        })
      });
      const data = await res.json();
      if (res.ok) {
        obtenerPresupuestos();
        cerrarModal();
        mostrarToast('✅ Presupuesto actualizado');
      } else {
        throw new Error(data.error || 'Error al actualizar presupuesto');
      }
    } catch (err) {
      console.error('❌ Error al actualizar:', err.message);
      mostrarToast('❌ No se pudo actualizar');
    }
  };

  const eliminarPresupuesto = async (id) => {
    if (!window.confirm('¿Eliminar este presupuesto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/presupuestos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        obtenerPresupuestos();
        mostrarToast('🗑️ Presupuesto eliminado');
      } else {
        throw new Error(data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error('❌ Error al eliminar:', err.message);
      mostrarToast('❌ No se pudo eliminar');
    }
  };

  return (
    <div className="contenedor-lista-presupuestos">
      <h3><FaClipboardList /> Presupuestos existentes</h3>

      {mensajeToast && <div className="toast-categoria">{mensajeToast}</div>}

      <div className="grid-presupuestos">
        {presupuestos.map((p) => (
          <div className="tarjeta-presupuesto" key={p._id}>
            <h4>{p.titulo}</h4>
            <p className="descripcion">{p.descripcion || 'Sin descripción'}</p>
            <p><FaMoneyBillWave /> Límite: ${p.monto_limite.toFixed(2)}</p>
            <p><strong>Gastado:</strong> ${p.monto_gastado?.toFixed(2) || 0}</p>
            <p className="fecha"><FaCalendarAlt /> {new Date(p.fecha_creacion).toLocaleDateString()}</p>
            <div className="acciones">
              <button className="btn-editar" onClick={() => abrirModalEditar(p)}><FaEdit /> Editar</button>
              <button className="btn-eliminar" onClick={() => eliminarPresupuesto(p._id)}><FaTrash /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-cerrar" onClick={cerrarModal}>✖</button>
            <h3>Editar Presupuesto</h3>
            <input
              type="text"
              value={presupuestoEditando.titulo}
              onChange={(e) => setPresupuestoEditando({ ...presupuestoEditando, titulo: e.target.value })}
            />
           <input
  type="text"
  value={presupuestoEditando.descripcion}
  onChange={(e) => setPresupuestoEditando({ ...presupuestoEditando, descripcion: e.target.value })}
/>

            <input
              type="number"
              value={presupuestoEditando.monto_limite}
              onChange={(e) => setPresupuestoEditando({ ...presupuestoEditando, monto_limite: e.target.value })}
            />
            <div className="modal-acciones">
              <button onClick={guardarEdicion}>Guardar</button>
              <button onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaPresupuestos;
