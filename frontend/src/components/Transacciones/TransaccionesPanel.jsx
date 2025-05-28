import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowCircleUp, FaArrowCircleDown, FaEdit, FaTrash, FaTimes, FaInfoCircle } from 'react-icons/fa';
import './TransaccionesPanel.css';
import '../modal.css';
import { Tooltip } from 'react-tooltip'; // Asegúrate de tener instalada la versión 5+

const coloresAvatar = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#E91E63', '#00BCD4'];

const TransaccionesPanel = () => {
    const navigate = useNavigate();


  const [transacciones, setTransacciones] = useState([]);
  const [formulario, setFormulario] = useState({
    titulo: '',
    descripcion: '',
    accion: 'Ingreso',
    metodo_pago: '',
    monto: '',
    estado: 'En proceso',
    fecha: new Date(),
    categoria: ''
  });
  
  const [categorias, setCategorias] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
const [errorPresupuesto, setErrorPresupuesto] = useState('');
  const [mensajeToast, setMensajeToast] = useState('');
  const [editando, setEditando] = useState(null);
  const [detalle, setDetalle] = useState(null);

  const token = localStorage.getItem('token');

  const obtenerTransacciones = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/transacciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTransacciones(data);
      else throw new Error(data.error || data.mensaje);
    } catch (err) {
      console.error('❌ Error al cargar transacciones:', err.message);
    }
  };


  const obtenerCategorias = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/categorias', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCategorias(data);
    } catch (err) {
      console.error('❌ Error al cargar categorías:', err.message);
    }
  };
  const obtenerPresupuestos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/presupuestos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPresupuestos(data);
    } catch (err) {
      console.error('❌ Error al cargar presupuestos:', err.message);
    }
  };
  
  useEffect(() => {
    obtenerTransacciones();
    obtenerCategorias();
    obtenerPresupuestos(); // 👈 agregado
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
  
    if (name === 'metodo_pago' && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      mostrarToast('❌ El método de pago solo debe contener letras.');
      return;
    }
  
    if ((name === 'titulo' || name === 'descripcion') && value.length > 0 && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ]/.test(value)) {
      mostrarToast(`❌ El campo "${name}" debe comenzar con una letra.`);
      return;
    }
  
    if (name === 'monto') {
      const numero = parseFloat(value);
      if (isNaN(numero) || numero <= 0) {
        mostrarToast('❌ El monto debe ser un número mayor a 0.');
        return;
      }
    }
  
    const nuevoFormulario = { ...formulario, [name]: value };
  
    if ((name === 'monto' || name === 'presupuesto') && nuevoFormulario.accion === 'Retiro') {
      const presupuestoSel = presupuestos.find(p => p._id === nuevoFormulario.presupuesto);
      const montoNum = parseFloat(nuevoFormulario.monto);
      if (presupuestoSel && montoNum > (presupuestoSel.monto_limite - presupuestoSel.monto_gastado)) {
        setErrorPresupuesto('⚠️ El monto excede el saldo del presupuesto.');
      } else {
        setErrorPresupuesto('');
      }
    }
  
    setFormulario(nuevoFormulario);
  };
  const handleCambioPresupuesto = (e) => {
  const valor = e.target.value;
  if (valor === "nuevo") {
    navigate("/CrearPresupuesto"); // Ajusta si tu ruta es diferente
  } else {
    manejarCambio(e);
  }
};

  const handleCambioCategoriaTransaccion = (e) => {
  const valor = e.target.value;
  if (valor === "nueva") {
    navigate("/Categorias");
  } else {
    manejarCambio(e);
  }
};

  

  const mostrarToast = (msg) => {
    setMensajeToast(msg);
    setTimeout(() => setMensajeToast(''), 3000);
  };

  const crearTransaccion = async (e) => {
    e.preventDefault();
  
  
  
    const cuerpo = {
      ...formulario,
      monto: parseFloat(formulario.monto),
    };
  
    console.log('📤 POST enviado:', cuerpo);
  
    try {
      const res = await fetch('http://localhost:3000/api/transacciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cuerpo)
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error('❌ Error del servidor:', data);
        mostrarToast(data.error || 'Error al crear transacción');
        return;
      }
  
      setFormulario({
        titulo: '', descripcion: '', accion: 'Ingreso',
        metodo_pago: '', monto: '', estado: 'En proceso',
        fecha: new Date().toISOString().split('T')[0],
        categoria: '', presupuesto: ''
      });
  
      await obtenerTransacciones();
      await obtenerPresupuestos(); // 👈 nuevo
      mostrarToast('✅ Transacción registrada');
      
    } catch (err) {
      console.error('❌ Error de red:', err.message);
      mostrarToast('Error de red al crear transacción');
    }
  };
  
  

  const eliminarTransaccion = async (id) => {
    if (!window.confirm('¿Eliminar esta transacción?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/transacciones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {

        await obtenerTransacciones();
await obtenerPresupuestos(); // 👈 nuevo
mostrarToast('🗑️ Transacción eliminada');

      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error('❌ Error al eliminar transacción:', err.message);
    }
  };

  const abrirModalEditar = (t) => setEditando({ ...t });
  const cerrarModal = () => setEditando(null);

  const abrirModalDetalle = (t) => setDetalle(t);
  const cerrarDetalle = () => setDetalle(null);

  const guardarEdicion = async () => {
    // Validar título y descripción
    if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ]/.test(editando.titulo)) {
      mostrarToast('❌ El título debe comenzar con una letra.');
      return;
    }
  
    if (editando.descripcion && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ]/.test(editando.descripcion)) {
      mostrarToast('❌ La descripción debe comenzar con una letra.');
      return;
    }
  
    // Validar monto positivo
    const montoNum = parseFloat(editando.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      mostrarToast('❌ El monto debe ser un número mayor a 0.');
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:3000/api/transacciones/${editando._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: editando.titulo,
          descripcion: editando.descripcion,
          monto: montoNum,
          estado: editando.estado
        })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        mostrarToast(data.error || '❌ Error al actualizar transacción');
        return;
      }
  
      await obtenerTransacciones();
      await obtenerPresupuestos(); // sincroniza con presupuesto
      cerrarModal();
      mostrarToast('✏️ Transacción actualizada');
    } catch (err) {
      console.error('❌ Error al actualizar transacción:', err.message);
      mostrarToast('Error de red al actualizar');
    }
  };
  

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Completado': return 'badge completado';
      case 'Cancelado': return 'badge cancelado';
      default: return 'badge en-proceso';
    }
  };

  return (
    <div className="transacciones-panel">
<h2>
  <FaArrowCircleDown style={{ marginRight: '10px' }} />
  Gestión de Transacciones{" "}
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Aquí puedes registrar ingresos o egresos, vinculados a una categoría y presupuesto."
    className="icono-info"
  />
</h2>

      {mensajeToast && (
        <div className="toast-presupuesto">{mensajeToast}</div>
      )}

<form className="formulario-transaccion" onSubmit={crearTransaccion}>
  <div className="form-group">
    <input
      name="titulo"
      placeholder="Título"
      value={formulario.titulo}
      onChange={manejarCambio}
      required
    />
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Ejemplo: Sueldo, Pago de servicios, Venta."
      className="icono-info"
    />

    <input
      name="descripcion"
      placeholder="Descripción"
      value={formulario.descripcion}
      onChange={manejarCambio}
    />
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Una nota opcional para describir la transacción."
      className="icono-info"
    />
  </div>

  <div className="form-group">
    <select name="accion" value={formulario.accion} onChange={manejarCambio}>
      <option value="Ingreso">Ingreso</option>
      <option value="Retiro">Egreso</option>
    </select>
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Selecciona si es un ingreso (dinero entra) o egreso (dinero sale)."
      className="icono-info"
    />

    <input
      name="metodo_pago"
      placeholder="Método de Pago"
      value={formulario.metodo_pago}
      onChange={manejarCambio}
    />
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Ejemplo: Efectivo, Tarjeta, Transferencia..."
      className="icono-info"
    />
  </div>

  <div className="form-group">
    <input
      type="number"
      name="monto"
      placeholder="Monto"
      value={formulario.monto}
      onChange={manejarCambio}
      required
    />
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Ingresa un número mayor a 0."
      className="icono-info"
    />

    <select name="estado" value={formulario.estado} onChange={manejarCambio}>
      <option value="En proceso">En proceso</option>
      <option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option>
    </select>
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Define si la transacción ya fue completada, está en proceso o cancelada."
      className="icono-info"
    />
  </div>

  <div className="form-group">
    <select name="categoria" value={formulario.categoria} onChange={handleCambioCategoriaTransaccion}>
      <option value="">Seleccionar Categoría</option>
      {categorias.map((cat) => (
        <option key={cat._id} value={cat._id}>{cat.titulo}</option>
      ))}
      <option value="nueva">➕ Crear nueva categoría</option>
    </select>
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Asocia esta transacción a una categoría registrada."
      className="icono-info"
    />
  </div>

  {formulario.categoria && (() => {
    const categoriaSel = categorias.find(c => c._id === formulario.categoria);
    return categoriaSel?.presupuesto ? (
      <p style={{ fontSize: '0.9rem', color: '#2c3e50', marginBottom: '10px' }}>
        Presupuesto vinculado: <strong>{categoriaSel.presupuesto.titulo}</strong>
      </p>
    ) : null;
  })()}

  <button type="submit" className="btn-guardar">
    Guardar Transacción
  </button>

  <Tooltip id="tooltip" place="right" effect="solid" />
</form>



      <h3 className="titulo-tabla">Historial de Transacciones</h3>
      <table className="tabla-transacciones">
        <thead>
          <tr>
            <th></th>
            <th>Título</th>
            <th>Acción</th>
            <th>Método</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {transacciones.map((t, i) => (
            <tr key={t._id}>
              <td>
                <div className="avatar" style={{ backgroundColor: coloresAvatar[i % coloresAvatar.length] }}>
                  {t.titulo.charAt(0).toUpperCase()}
                </div>
              </td>
              <td>{t.titulo}</td>
              <td>{t.accion === 'Ingreso' ? <span className="accion ingreso"><FaArrowCircleDown /> Ingreso</span> : <span className="accion retiro"><FaArrowCircleUp /> Egreso</span>}</td>
              <td>{t.metodo_pago || '-'}</td>
              <td>${t.monto.toFixed(2)}</td>
              <td><span className={getBadgeClass(t.estado)}>{t.estado}</span></td>
              <td>{new Date(t.fecha).toLocaleString('es-MX', {
  dateStyle: 'short',
  timeStyle: 'short',
  hour12: true
})}</td>

              <td className="acciones">
                <button className="btn-editar" onClick={() => abrirModalEditar(t)}><FaEdit /></button>
                <button className="btn-eliminar" onClick={() => eliminarTransaccion(t._id)}><FaTrash /></button>
                <button className="btn-editar" onClick={() => abrirModalDetalle(t)}><FaInfoCircle /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editando && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-cerrar" onClick={cerrarModal}><FaTimes /></button>
            <h3>Editar Transacción</h3>
            <input type="text" value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} />
<input
  type="text"
  value={editando.descripcion}
  onChange={e => setEditando({ ...editando, descripcion: e.target.value })}
/>

            <input type="number" value={editando.monto} onChange={e => setEditando({ ...editando, monto: e.target.value })} />
            <select value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })}>
              <option value="En proceso">En proceso</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <div className="modal-acciones">
              <button onClick={guardarEdicion}>Guardar</button>
              <button onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
{detalle && (
  <div className="modal-overlay">
    <div className="modal">
      <button className="modal-cerrar" onClick={() => setDetalle(null)}><FaTimes /></button>
      <h3>Detalles de Transacción</h3>
      <p><strong>Título:</strong> {detalle.titulo}</p>
      <p><strong>Descripción:</strong> {detalle.descripcion || 'Sin descripción'}</p>
      <p><strong>Monto:</strong> ${detalle.monto.toFixed(2)}</p>
      <p><strong>Acción:</strong> {detalle.accion}</p>
      <p><strong>Método de pago:</strong> {detalle.metodo_pago || 'No especificado'}</p>
      <p><strong>Estado:</strong> {detalle.estado}</p>
      <p><strong>Fecha:</strong> {new Date(detalle.fecha).toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: true
      })}</p>

      {detalle.categoria && (
        <>
          <p><strong>Categoría:</strong> {detalle.categoria.titulo}</p>
          <p><strong>Descripción Cat.:</strong> {detalle.categoria.descripcion || 'Sin descripción'}</p>
        </>
      )}

      {detalle.presupuesto && (
        <>
          <p><strong>Presupuesto:</strong> {detalle.presupuesto.titulo}</p>
          <p><strong>Disponible:</strong> ${(detalle.presupuesto.monto_limite - detalle.presupuesto.monto_gastado).toFixed(2)}</p>
        </>
      )}
    </div>
  </div>
)}


      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="boton-volver" onClick={() => navigate('/Inicio')}>
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default TransaccionesPanel;
