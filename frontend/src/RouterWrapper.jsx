import { useEffect, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import Inicio from './components/Inicio/Inicio';
import PaginaPrincipal from "./components/PaginaPrincipal/PaginaPricipal";
import InicioSesion from "./components/InicioSesion/InicioSesion";
import RegUsuario from "./components/RegistroUsuario/RegistroUsuario";
import RouteWrapper from "./RouteWrapper";
import ReestablecerContraseña from "./components/ReestablecerContraseña/ReestablecerContraseña";
import ConfirmacionEnvio from "./components/ConfirmacionEnvio/ConfirmacionEnvio";
import ActualizarContraseña from "./components/ActualizarContrseña/ActualizarContraseña";
import CrearPresupuesto from "./components/presupuesto/CrearPresupuesto";
import CategoriaPanel from './components/categorias/CategoriaPanel';
import TransaccionesPanel from "./components/Transacciones/TransaccionesPanel";
import MetaAhorroPanel from "./components/MetaAhorro/MetaAhorroPanel";
import SaludFinancieraPanel from "./components/saludFinanciera/SaludFinancieraPanel";
import SaludFinancieraAdmin from "./components/saludFinanciera/SaludFinancieraAdmin";
import ConfiguracionPanel from "./components/ConfiguracionPanel/ConfiguracionPanel";
import VerificarCodigo from './components/ReestablecerContraseña/verificarCodigo';
import PantallaBienvenida from "./components/pantallaBienvenida/PantallaBienvenida";

const RouterWrapper = () => {
  const location = useLocation();
  const [rutaAnterior, setRutaAnterior] = useState(null);
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    setRutaAnterior(prevLocationRef.current);
    prevLocationRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RouteWrapper><PaginaPrincipal rutaAnterior={rutaAnterior}/></RouteWrapper>} />
        <Route path="/bienvenida" element={<PantallaBienvenida />} />
        <Route path="/Login" element={<RouteWrapper><InicioSesion rutaAnterior={rutaAnterior}/></RouteWrapper>} />
        <Route path="/SignUp" element={<RouteWrapper><RegUsuario rutaAnterior={rutaAnterior} /></RouteWrapper>} />
        <Route path="/Inicio" element={<RouteWrapper><Inicio /></RouteWrapper>} />
        <Route path="/ResetPassword" element={<RouteWrapper><ReestablecerContraseña rutaAnterior={rutaAnterior} /></RouteWrapper>} />
        <Route path="/ConfirmacionEnvio" element={<RouteWrapper><ConfirmacionEnvio /></RouteWrapper>} />
        <Route path="/ActualizarContraseña" element={<RouteWrapper><ActualizarContraseña /></RouteWrapper>} />
        <Route path="/CrearPresupuesto" element={<RouteWrapper><CrearPresupuesto /></RouteWrapper>} />
        <Route path="/Categorias" element={<RouteWrapper><CategoriaPanel /></RouteWrapper>} />
        <Route path="/Transacciones" element={<RouteWrapper><TransaccionesPanel /></RouteWrapper>} />
        <Route path="/MetasAhorro" element={<RouteWrapper><MetaAhorroPanel /></RouteWrapper>} />
        <Route path="/salud-admin" element={<SaludFinancieraAdmin />} />
        <Route path="/NuevaContraseña" element={<ActualizarContraseña />} />
        <Route path="/VerificarCodigo" element={<VerificarCodigo />} />
        <Route path="/salud-financiera" element={<SaludFinancieraPanel />} />
        <Route path="/Home" element={<RouteWrapper><Inicio rutaAnterior={rutaAnterior} /></RouteWrapper>} />
        <Route path="/configuracion" element={<RouteWrapper><ConfiguracionPanel /></RouteWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

export default RouterWrapper;
