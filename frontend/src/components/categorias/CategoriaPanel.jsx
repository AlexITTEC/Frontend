import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './CategoriaPanel.css';
import { FaPlus, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const CategoriaPanel = () => {
  const [categorias, setCategorias] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensajeToast, setMensajeToast] = useState({ mensaje: '', tipo: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
// 👇 NUEVO: estados para presupuestos
const [presupuestos, setPresupuestos] = useState([]);
const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState('');

  const navigate = useNavigate();

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/categorias', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCategorias(data);
      else console.error('Error:', data.error || data.mensaje);
    } catch (err) {
      console.error('❌ Error al obtener categorías:', err);
    }
  };

// 👇 Agrega esta función para obtener presupuestos
const cargarPresupuestos = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/presupuestos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setPresupuestos(data);
    else console.error('Error al cargar presupuestos:', data.error || data.mensaje);
  } catch (err) {
    console.error('❌ Error al obtener presupuestos:', err);
  }
};

  useEffect(() => {
    cargarCategorias();
      cargarPresupuestos();
  }, []);

  const mostrarToast = (mensaje, tipo = 'info') => {
    setMensajeToast({ mensaje, tipo });
    setTimeout(() => setMensajeToast({ mensaje: '', tipo: '' }), 3000);
  };
const crearCategoria = async (e) => {
  e.preventDefault();
  if (!titulo.trim()) return alert('El título es obligatorio');
  if (!presupuestoSeleccionado) return alert('Debes seleccionar un presupuesto');

  const token = localStorage.getItem('token');
  const nueva = {
    titulo: titulo.trim(),
    descripcion: descripcion,
    presupuesto: presupuestoSeleccionado
  };

  try {
    const res = await fetch('http://localhost:3000/api/categorias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(nueva)
    });

    const data = await res.json();
    if (res.ok) {
      setTitulo('');
      setDescripcion('');
      setPresupuestoSeleccionado('');
      cargarCategorias();
      mostrarToast('Categoría creada con éxito', 'success');
    } else {
      alert(data.error || 'Error al crear categoría');
    }
  } catch (err) {
    console.error('❌ Error de red:', err);
    mostrarToast('Error al crear categoría', 'error');
  }
};


  const abrirModalEditar = (cat) => {
    setCategoriaEditando(cat);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setCategoriaEditando(null);
  };

  const guardarEdicion = async () => {
  const token = localStorage.getItem('token');

  // Validaciones básicas
  if (!categoriaEditando.titulo || !categoriaEditando.titulo.trim()) {
    mostrarToast('❌ El título es obligatorio.', 'error');
    return;
  }

  if (!categoriaEditando.presupuesto) {
    mostrarToast('❌ Debes seleccionar un presupuesto.', 'error');
    return;
  }

  const actualizada = {
    titulo: categoriaEditando.titulo.trim(),
    descripcion: categoriaEditando.descripcion?.trim() || '',
    presupuesto: categoriaEditando.presupuesto
  };

  try {
    const res = await fetch(`http://localhost:3000/api/categorias/${categoriaEditando._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(actualizada)
    });

    const data = await res.json();

    if (res.ok) {
      cargarCategorias();
      cerrarModal();
      mostrarToast('✅ Categoría actualizada', 'success');
    } else {
      alert(data.error || 'Error al actualizar');
    }
  } catch (err) {
    console.error('❌ Error al actualizar categoría:', err);
    mostrarToast('Error al actualizar categoría', 'error');
  }
};

  const eliminarCategoria = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta categoría?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        cargarCategorias();
        mostrarToast('Categoría eliminada', 'delete');
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error('❌ Error al eliminar categoría:', err);
      mostrarToast('Error al eliminar categoría', 'error');
    }
  };

  return (
    <div className="panel-categorias">
      <h2>
  Categorías{" "}
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Aquí puedes agrupar tus gastos por tipo, como alimentación, transporte o entretenimiento."
    className="icono-info"
  />
</h2>


      {mensajeToast.mensaje && (
        <div className={`toast-categoria ${mensajeToast.tipo}`}>
          {mensajeToast.tipo === 'success' && '✅ '}
          {mensajeToast.tipo === 'error' && '❌ '}
          {mensajeToast.tipo === 'info' && 'ℹ️ '}
          {mensajeToast.tipo === 'delete' && '🗑️ '}
          {mensajeToast.mensaje}
        </div>
      )}

<form className="form-categoria" onSubmit={crearCategoria}>
  <label>
    Título{" "}
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Nombre de la categoría, como 'Comida', 'Transporte', etc."
      className="icono-info"
    />
  </label>
  <input
    type="text"
    placeholder="Título de la categoría"
    value={titulo}
    onChange={(e) => setTitulo(e.target.value)}
    required
  />

  <label>
    Descripción{" "}
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Una breve descripción opcional para esta categoría."
      className="icono-info"
    />
  </label>
  <input
    type="text"
    placeholder="Descripción (opcional)"
    value={descripcion}
    onChange={(e) => setDescripcion(e.target.value)}
  />

  <label>
    Presupuesto{" "}
    <FaInfoCircle
      data-tooltip-id="tooltip"
      data-tooltip-content="Selecciona a qué presupuesto pertenece esta categoría."
      className="icono-info"
    />
  </label>
  <select
    className="select-estandar"
    value={presupuestoSeleccionado}
    onChange={(e) => {
      if (e.target.value === "nuevo") {
        navigate("/CrearPresupuesto");
      } else {
        setPresupuestoSeleccionado(e.target.value);
      }
    }}
    required
  >
    <option value="">Selecciona un presupuesto</option>
    {presupuestos.map((p) => (
      <option key={p._id} value={p._id}>{p.titulo}</option>
    ))}
    <option value="nuevo">➕ Crear nuevo presupuesto</option>
  </select>

  <button type="submit"><FaPlus /> Crear Categoría</button>

  <Tooltip id="tooltip" place="right" effect="solid" />
</form>



      <div className="grid-categorias">
        {categorias.map((cat) => (
          <div key={cat._id} className="tarjeta-categoria">
            <h4>{cat.titulo}</h4>
            <p>{cat.descripcion || 'Sin descripción'}</p>
            {cat.presupuesto && (
  <p><strong>Presupuesto:</strong> {cat.presupuesto.titulo}</p>
)}

            <div className="acciones">
              <button className="btn-editar" onClick={() => abrirModalEditar(cat)}><FaEdit /> Editar</button>
              <button className="btn-eliminar" onClick={() => eliminarCategoria(cat._id)}><FaTrash /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>
{modalVisible && (
  <div className="modal-overlay">
    <div className="modal">
      <button className="modal-cerrar" onClick={cerrarModal} aria-label="Cerrar modal">✖</button>
      <h3>Editar Categoría</h3>

      <input
        type="text"
        placeholder="Título"
        value={categoriaEditando.titulo}
        onChange={(e) => setCategoriaEditando({ ...categoriaEditando, titulo: e.target.value })}
      />

      <input
        type="text"
        placeholder="Descripción"
        value={categoriaEditando.descripcion}
        onChange={(e) => setCategoriaEditando({ ...categoriaEditando, descripcion: e.target.value })}
      />
<select
  className="select-estandar"
  value={categoriaEditando.presupuesto}
  onChange={(e) => {
    if (e.target.value === "nuevo") {
      navigate("/CrearPresupuesto");
    } else {
      setCategoriaEditando({ ...categoriaEditando, presupuesto: e.target.value });
    }
  }}
  required
>
  <option value="">Seleccionar presupuesto</option>
  {presupuestos.map((p) => (
    <option key={p._id} value={p._id}>
      {p.titulo}
    </option>
  ))}
  <option value="nuevo">➕ Crear nuevo presupuesto</option>
</select>


      <div className="modal-acciones">
        <button onClick={guardarEdicion} className="btn-editar"><FaEdit /> Guardar</button>
        <button onClick={cerrarModal} className="btn-eliminar"><FaTrash /> Cancelar</button>
      </div>
    </div>
  </div>
)}

      

      <div className="volver-inicio">
        <button onClick={() => navigate('/Inicio')}>Volver al Inicio</button>
      </div>
    </div>
  );
};

export default CategoriaPanel;
