import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { format, startOfWeek } from "date-fns";
import "./DashboardFinanciero.css";

const DashboardFinanciero = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [metas, setMetas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [modoAgrupacion, setModoAgrupacion] = useState("dia");
  const [resumen, setResumen] = useState({
    ingresos: 0,
    retiros: 0,
    totalAhorro: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/transacciones", { headers }).then(res => res.json()),
      fetch("/api/metas", { headers }).then(res => res.json()),
      fetch("/api/presupuestos", { headers }).then(res => res.json())
    ])
      .then(([dataTrans, dataMetas, dataPresupuestos]) => {
        if (Array.isArray(dataTrans)) setTransacciones(dataTrans);

        if (Array.isArray(dataMetas)) {
          (async () => {
            const completadas = dataMetas.filter(meta =>
              meta.progreso >= meta.montoObjetivo && !meta.fechaFinalizacion
            );

            await Promise.all(completadas.map(meta =>
              fetch(`/api/metas/${meta._id}/finalizar`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fechaFinalizacion: new Date().toISOString() })
              })
            ));

            const metasActualizadas = await fetch("/api/metas", { headers }).then(res => res.json());
            setMetas(metasActualizadas);
          })();
        }

        if (Array.isArray(dataPresupuestos)) setPresupuestos(dataPresupuestos);
        calcularResumen(dataTrans, dataMetas);
      })
      .catch(err => console.error("Error al cargar datos:", err));
  }, []);

  const calcularResumen = (trans, metas) => {
    const mesActual = new Date().getMonth();
    let ingresos = 0, retiros = 0;

    trans.forEach(t => {
      const fecha = new Date(t.fecha);
      if (fecha.getMonth() === mesActual) {
        if (t.accion === "Ingreso") ingresos += t.monto;
        else if (t.accion === "Retiro") retiros += t.monto;
      }
    });

    const totalAhorro = metas.reduce((acc, meta) => acc + (meta.progreso || 0), 0);
    setResumen({ ingresos, retiros, totalAhorro });
  };

 const generarDatosAgrupados = (modo) => {
  const mapa = {};

  transacciones.forEach(t => {
    const fecha = new Date(t.fecha);
    let clave = "";

    switch (modo) {
      case "dia":
        clave = format(fecha, "dd/MM/yyyy"); // barra por día exacto
        break;
      case "semana":
        const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 });
        clave = format(inicioSemana, "'Semana del' dd/MM"); // agrupa por semana
        break;
      case "mes":
        clave = format(fecha, "MMMM yyyy"); // agrupa por mes y año
        break;
      default:
        return;
    }

    if (!mapa[clave]) {
      mapa[clave] = { grupo: clave, Ingreso: 0, Retiro: 0 };
    }

    if (t.accion === "Ingreso") mapa[clave].Ingreso += t.monto;
    else if (t.accion === "Retiro") mapa[clave].Retiro += t.monto;
  });

  return Object.values(mapa);
};


  return (
    <div className="dashboard-financiero">
      <h2 className="titulo-dashboard">Resumen Financiero</h2>

      <div className="tarjetas-resumen">
        <div className="tarjeta ingreso">💰 Ingresos: ${resumen.ingresos}</div>
        <div className="tarjeta retiro">💸 Retiros: ${resumen.retiros}</div>
        <div className="tarjeta ahorro">🏦 Ahorro: ${resumen.totalAhorro}</div>
      </div>

      <div className="graficas-dashboard">
        {/* Gráfico por agrupación */}
        <div className="grafica grafica-barra">
          <h4>Movimientos por {modoAgrupacion}</h4>
          <div className="modo-selector">
            <button onClick={() => setModoAgrupacion("dia")} className={modoAgrupacion === "dia" ? "activo" : ""}>Día</button>
            <button onClick={() => setModoAgrupacion("semana")} className={modoAgrupacion === "semana" ? "activo" : ""}>Semana</button>
            <button onClick={() => setModoAgrupacion("mes")} className={modoAgrupacion === "mes" ? "activo" : ""}>Mes</button>
          </div>

          {transacciones.length > 0 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={generarDatosAgrupados(modoAgrupacion)}>
                  <XAxis dataKey="grupo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Ingreso" stackId="a" fill="#38a169" />
                  <Bar dataKey="Retiro" stackId="a" fill="#e53e3e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mensaje-vacio">No hay transacciones registradas.</p>
          )}
        </div>

        {/* Presupuestos */}
        <div className="grafica grafica-presupuestos">
          <h4>Presupuestos y Saldo Disponible</h4>
          {presupuestos.length > 0 ? (
            <div className="presupuestos-lista">
              {presupuestos.map(p => {
                const limite = p.monto_limite;
                const gastado = p.monto_gastado;
                const restante = Math.max(0, limite - gastado);
                const porcentaje = Math.min(100, Math.round((gastado / limite) * 100));

                return (
                  <motion.div key={p._id} className="card-presupuesto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <strong>{p.titulo}</strong>
                    <p>Asignado: ${limite} | Gastado: ${gastado} | Disponible: ${restante}</p>
                    <div className="barra-externa">
                      <motion.div
                        className="barra-interna"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${porcentaje}%`,
                          backgroundColor: porcentaje >= 100 ? "#e53e3e" : "#3182ce"
                        }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="mensaje-vacio">No tienes presupuestos registrados.</p>
          )}
        </div>

        {/* Metas de Ahorro */}
        <div className="grafica grafica-metas">
          <h4>Metas de Ahorro</h4>
          {metas.length > 0 ? (
            <div className="metas-lista">
              {metas
                .slice()
                .sort((a, b) => (b.progreso / b.montoObjetivo) - (a.progreso / a.montoObjetivo))
                .filter(meta => meta.progreso < meta.montoObjetivo)
                .map(meta => {
                  const { titulo, montoObjetivo, progreso } = meta;
                  const porcentaje = Math.min(100, Math.round((progreso / montoObjetivo) * 100));
                  const vencida = new Date(meta.fechaLimite) < new Date();
                  const diasRestantes = Math.ceil((new Date(meta.fechaLimite) - new Date()) / (1000 * 60 * 60 * 24));

                  let mensaje = porcentaje >= 100
                    ? "🎉 ¡Meta alcanzada, felicidades!"
                    : vencida
                      ? "⏰ ¡Meta vencida, revisa tu plan!"
                      : diasRestantes <= 3
                        ? `📅 ¡Quedan ${diasRestantes} día(s), tú puedes!`
                        : porcentaje >= 75
                          ? "🏆 ¡Estás muy cerca, no te rindas!"
                          : porcentaje >= 40
                            ? "🔥 ¡Buen ritmo, sigue así!"
                            : "💡 ¡Vamos, estás comenzando!";

                  return (
                    <motion.div key={meta._id} className="card-meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                      <strong>{titulo}</strong>
                      <p>Meta: ${montoObjetivo} | Ahorro actual: ${progreso}</p>
                      <p className="mensaje-meta">{mensaje}</p>
                      <div className="barra-externa">
                        <motion.div
                          className="barra-interna"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${porcentaje}%`,
                            backgroundColor: porcentaje >= 100 ? "#38a169" : (vencida ? "#e53e3e" : "#805ad5")
                          }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <p className="mensaje-vacio">No tienes metas registradas.</p>
          )}
        </div>

        {/* Metas Completadas */}
        <div className="grafica grafica-metas-completadas">
          <h4>🎖 Metas Completadas</h4>
          {metas.filter(meta => meta.fechaFinalizacion).length > 0 ? (
            <div className="metas-lista">
              {metas
                .filter(meta => meta.fechaFinalizacion)
                .map(meta => (
                  <motion.div key={meta._id} className="card-meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <strong>{meta.titulo}</strong>
                    <p>Meta: ${meta.montoObjetivo} | Ahorro: ${meta.progreso}</p>
                    <p className="mensaje-meta">🎉 Completada el {new Date(meta.fechaFinalizacion).toLocaleDateString()}</p>
                    <div className="barra-externa">
                      <motion.div
                        className="barra-interna"
                        initial={{ width: 0 }}
                        animate={{ width: "100%", backgroundColor: "#38a169" }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <p className="mensaje-vacio">Aún no has completado ninguna meta.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanciero;
