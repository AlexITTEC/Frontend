import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPiggyBank, FaChartLine, FaWallet } from "react-icons/fa";
import "./bienvenida.css";

export default function PantallaBienvenida() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="contenedor-bienvenida"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.h1
        className="titulo-bienvenida"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      >
        Bienvenido a <span className="marca">FinTrack 💸</span>
      </motion.h1>

      <p className="descripcion">
        Administra tus finanzas con facilidad y alcanza tus metas sin perder el control.
      </p>

      <div className="lista-beneficios">
        <div className="item-beneficio">
          <FaWallet className="icono-beneficio" />
          <span>Controla tus ingresos y gastos</span>
        </div>
        <div className="item-beneficio">
          <FaPiggyBank className="icono-beneficio" />
          <span>Crea presupuestos y metas de ahorro</span>
        </div>
        <div className="item-beneficio">
          <FaChartLine className="icono-beneficio" />
          <span>Visualiza tu salud financiera</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="boton-comenzar"
        onClick={() => navigate("/")}
      >
        Empezar ahora
      </motion.button>
    </motion.div>
  );
}
