import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MetaAhorroPanel.css';
import { FaPiggyBank, FaCalendarAlt, FaMoneyBillWave, FaTrash, FaEdit, FaTag, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip'; // react-tooltip v5 o superior

const MetaAhorroPanel = () => {
  const [metas, setMetas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevaMeta, setNuevaMeta] = useState({
    titulo: '', descripcion: '', montoObjetivo: '', fechaLimite: '', progreso: '', categoria: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [metaEditando, setMetaEditando] = useState(null);
  const [errores, setErrores] = useState({});
  const [erroresEdit, setErroresEdit] = useState({});
  const [modalAbonoVisible, setModalAbonoVisible] = useState(false);
  const [metaSeleccionadaParaAbono, setMetaSeleccionadaParaAbono] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    obtenerMetas();
    obtenerCategorias();
  }, []);

  const obtenerMetas = async () => {
    const res = await fetch('http://localhost:3000/api/metas', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setMetas(data);
  };

  const obtenerCategorias = async () => {
    const res = await fetch('http://localhost:3000/api/categorias', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setCategorias(data);
  };

  const soloTexto = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]/;
  const validar = (campo, valor) => {
    switch (campo) {
      case 'titulo': return soloTexto.test(valor.trim()) ? '' : 'El título debe comenzar con letra.';
      case 'descripcion': return valor && !soloTexto.test(valor.trim()) ? 'La descripción debe comenzar con letra.' : '';
      case 'montoObjetivo': return isNaN(valor) || Number(valor) <= 0 ? 'Monto debe ser positivo.' : '';
      case 'progreso': return valor && (isNaN(valor) || Number(valor) < 0) ? 'Ahorro inicial debe ser positivo o vacío.' : '';
      default: return '';
    }
  };

  const manejarCambio = (e, edit = false) => {
    const { name, value } = e.target;
    const actualizador = edit ? setMetaEditando : setNuevaMeta;
    const validador = edit ? setErroresEdit : setErrores;
    const objeto = edit ? metaEditando : nuevaMeta;

    actualizador({ ...objeto, [name]: value });
    validador(prev => ({ ...prev, [name]: validar(name, value) }));
  };

  const validarTodo = (meta, isEdit = false) => {
    const nuevosErrores = {};
    ['titulo', 'descripcion', 'montoObjetivo', 'progreso'].forEach(campo => {
      const error = validar(campo, meta[campo]);
      if (error) nuevosErrores[campo] = error;
    });
    if (isEdit) setErroresEdit(nuevosErrores);
    else setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarMeta = async (e) => {
    e.preventDefault();
    if (!validarTodo(nuevaMeta)) return;

    const res = await fetch('http://localhost:3000/api/metas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...nuevaMeta,
        montoObjetivo: parseFloat(nuevaMeta.montoObjetivo),
        progreso: nuevaMeta.progreso ? parseFloat(nuevaMeta.progreso) : 0
      })
    });

    if (res.ok) {
      setNuevaMeta({ titulo: '', descripcion: '', montoObjetivo: '', fechaLimite: '', progreso: '', categoria: '' });
      obtenerMetas();
    } else {
      const data = await res.json();
      alert(data.error || 'Error al guardar');
    }
  };
  const guardarEdicion = async () => {
    if (!validarTodo(metaEditando, true)) return;
    const res = await fetch(`http://localhost:3000/api/metas/${metaEditando._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(metaEditando)
    });
    if (res.ok) {
      obtenerMetas();
      setModalVisible(false);
    }
  };

  const eliminarMeta = async (id) => {
    if (!window.confirm('¿Eliminar esta meta?')) return;
    const res = await fetch(`http://localhost:3000/api/metas/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) obtenerMetas();
  };

const handleCambioCategoria = (e) => {
  const valor = e.target.value;

  if (valor === "nueva") {
    navigate("/Categorias");
  } else {
    manejarCambio(e); // reutiliza tu función actual
  }
};
const restante =
  metaSeleccionadaParaAbono?.montoObjetivo - metaSeleccionadaParaAbono?.progreso;
const montoAbono = parseFloat(metaSeleccionadaParaAbono?.nuevoAbono || 0);
const metaCompletada = restante <= 0;
const abonoExcede = montoAbono > restante;

  return (
    <div className="contenedor-meta">
<h2>
  <FaPiggyBank /> Metas de Ahorro{" "}
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Aquí puedes registrar objetivos de ahorro, asociarlos a una categoría y monitorear tu progreso."
    className="icono-info"
  />
</h2>


<form className="form-meta" onSubmit={guardarMeta}>
  {['titulo', 'descripcion', 'montoObjetivo', 'progreso'].map(campo =>
    errores[campo] && <div className="toast-presupuesto error" style={{ gridColumn: 'span 2' }} key={campo}>{errores[campo]}</div>
  )}

  <input
    name="titulo"
    placeholder="Título"
    value={nuevaMeta.titulo}
    onChange={manejarCambio}
    required
  />
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Nombre de tu meta de ahorro. Ejemplo: Vacaciones, Computadora."
    className="icono-info"
  />

  <input
    type="text"
    name="descripcion"
    placeholder="Descripción"
    value={nuevaMeta.descripcion}
    onChange={manejarCambio}
  />
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Breve descripción opcional de la meta."
    className="icono-info"
  />

  <input
    type="number"
    name="montoObjetivo"
    min="1"
    placeholder="Monto objetivo"
    value={nuevaMeta.montoObjetivo}
    onChange={manejarCambio}
    required
  />
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Cantidad total que deseas ahorrar."
    className="icono-info"
  />

  <input
    type="date"
    name="fechaLimite"
    value={nuevaMeta.fechaLimite}
    onChange={manejarCambio}
    required
  />
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Fecha límite que te propones alcanzar la meta."
    className="icono-info"
  />

  <select name="categoria" value={nuevaMeta.categoria} onChange={handleCambioCategoria}>
    <option value="">Seleccionar Categoría</option>
    {categorias.map(cat => (
      <option key={cat._id} value={cat._id}>{cat.titulo}</option>
    ))}
    <option value="nueva">➕ Crear nueva categoría</option>
  </select>
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Asocia la meta con una categoría registrada."
    className="icono-info"
  />

  <input
    type="number"
    name="progreso"
    min="0"
    placeholder="Ahorro inicial"
    value={nuevaMeta.progreso}
    onChange={manejarCambio}
  />
  <FaInfoCircle
    data-tooltip-id="tooltip"
    data-tooltip-content="Monto que ya tienes ahorrado. Déjalo vacío si estás comenzando."
    className="icono-info"
  />

  <button type="submit">Guardar Meta</button>

  <Tooltip id="tooltip" place="right" effect="solid" />
</form>


      <div className="lista-metas">
        {metas.map(meta => {
          const porcentaje = ((meta.progreso / meta.montoObjetivo) * 100).toFixed(1);
          return (
            <div key={meta._id} className="tarjeta-meta">
              <h4>{meta.titulo}</h4>
              <p>{meta.descripcion}</p>
              {meta.categoria && (
                <p><FaTag /> Categoría: <strong>{meta.categoria.titulo}</strong></p>
              )}
              <p><FaMoneyBillWave /> Objetivo: ${meta.montoObjetivo.toFixed(2)}</p>
              <p className="fecha-limite-info">
                <FaCalendarAlt /> {new Date(meta.fechaLimite).toLocaleDateString('es-MX', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <div className="barra-progreso"><div className="relleno" style={{ width: `${porcentaje}%` }} /></div>
              <p>{porcentaje}% completado</p>
              <div className="acciones-meta">
                <button className="btn-editar" onClick={() => {
                  setMetaSeleccionadaParaAbono(meta);
                  setModalAbonoVisible(true);
                }}><FaPiggyBank /> Abonar</button>
                <button className="btn-editar" onClick={() => { setMetaEditando(meta); setModalVisible(true); }}><FaEdit /> Editar</button>
                <button className="btn-eliminar" onClick={() => eliminarMeta(meta._id)}><FaTrash /> Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-cerrar" onClick={() => setModalVisible(false)}>✖</button>
            <h3>Editar Meta</h3>
            {['titulo', 'descripcion', 'montoObjetivo', 'progreso'].map(campo =>
              erroresEdit[campo] && <div className="toast-presupuesto error" key={campo}>{erroresEdit[campo]}</div>
            )}
            <input name="titulo" value={metaEditando.titulo} onChange={(e) => manejarCambio(e, true)} />
<input type="text" name="descripcion" value={metaEditando.descripcion} onChange={(e) => manejarCambio(e, true)} />
            <input type="number" name="montoObjetivo" min="1" value={metaEditando.montoObjetivo} onChange={(e) => manejarCambio(e, true)} />
            <input type="date" name="fechaLimite" value={metaEditando.fechaLimite?.substring(0, 10)} onChange={(e) => manejarCambio(e, true)} />
            <select name="categoria" value={metaEditando.categoria || ''} onChange={(e) => manejarCambio(e, true)}>
              <option value="">Seleccionar Categoría</option>
              {categorias.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.titulo}</option>
              ))}
            </select>
            <input type="number" name="progreso" min="0" value={metaEditando.progreso} onChange={(e) => manejarCambio(e, true)} />
            <div className="modal-acciones">
              <button onClick={guardarEdicion}>Guardar</button>
              <button onClick={() => setModalVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

{modalAbonoVisible && (() => {
  const restante = metaSeleccionadaParaAbono.montoObjetivo - metaSeleccionadaParaAbono.progreso;
  const montoAbono = parseFloat(metaSeleccionadaParaAbono.nuevoAbono || 0);
  const metaCompletada = restante <= 0;
  const abonoExcede = montoAbono > restante;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-cerrar" onClick={() => setModalAbonoVisible(false)}>✖</button>
        <h3 style={{ marginBottom: '0.5rem' }}>
          Abonar a <span style={{ color: '#0e5cad' }}>"{metaSeleccionadaParaAbono.titulo}"</span>
        </h3>

        {metaCompletada ? (
          <p style={{ fontWeight: 'bold', color: 'green', marginBottom: '1rem' }}>
            🎉 ¡Meta completada!
          </p>
        ) : (
          <p style={{ fontWeight: 'bold', color: '#1e3c72', marginBottom: '1rem' }}>
            Restante: ${restante.toFixed(2)}
          </p>
        )}

        {!metaCompletada && (
          <>
            <input
              type="number"
              placeholder="Monto del abono"
              min="1"
              value={metaSeleccionadaParaAbono.nuevoAbono || ''}
              onChange={(e) =>
                setMetaSeleccionadaParaAbono({
                  ...metaSeleccionadaParaAbono,
                  nuevoAbono: e.target.value,
                })
              }
            />
            {abonoExcede && (
              <p style={{ color: 'red', fontWeight: 'bold', marginTop: '-10px' }}>
                ⚠️ El monto excede el restante.
              </p>
            )}
            <input
              type="text"
              placeholder="Nota (opcional)"
              value={metaSeleccionadaParaAbono.nota || ''}
              onChange={(e) =>
                setMetaSeleccionadaParaAbono({
                  ...metaSeleccionadaParaAbono,
                  nota: e.target.value,
                })
              }
            />
          </>
        )}

        <div className="modal-acciones">
          <button
            disabled={metaCompletada || abonoExcede}
            style={{
              backgroundColor: metaCompletada || abonoExcede ? '#ccc' : '',
              cursor: metaCompletada || abonoExcede ? 'not-allowed' : '',
            }}
            onClick={async () => {
              const monto = parseFloat(metaSeleccionadaParaAbono.nuevoAbono);
              if (isNaN(monto) || monto <= 0) {
                alert('El monto debe ser positivo');
                return;
              }

              try {
                const res = await fetch(
                  `http://localhost:3000/api/metas/${metaSeleccionadaParaAbono._id}/abonar`,
                  {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      monto,
                      nota: metaSeleccionadaParaAbono.nota || '',
                    }),
                  }
                );

                const data = await res.json();
                if (res.ok) {
                  obtenerMetas();
                  setModalAbonoVisible(false);
                  alert('✅ Abono registrado correctamente');
                } else {
                  alert(data.error || 'Error al registrar abono');
                }
              } catch (err) {
                console.error('❌ Error al abonar:', err.message);
              }
            }}
          >
            Confirmar Abono
          </button>
          <button onClick={() => setModalAbonoVisible(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
})()}


      <div className="volver-inicio">
        <button onClick={() => navigate('/Inicio')}>Volver al Inicio</button>
      </div>
    </div>
  );
};

export default MetaAhorroPanel;
