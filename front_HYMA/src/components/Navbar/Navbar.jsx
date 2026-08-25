import './Navbar.css'
import { useNavigate } from "react-router-dom";

import hymaLogo from '../../assets/images/log3.png'

function Navbar() {

  const navigate = useNavigate();

  return (
    <nav className="navbar">

      <a href="#inicio" className="navbar-brand">

        <img
          src={hymaLogo}
          alt="HYMA - Hombre y Mujer en Acción"
        />

        <div className="brand-text">
          <strong>HYMA</strong>
          <span>Hombre y Mujer en Acción</span>
        </div>

      </a>


      <ul className="navbar-links">

        <li>
          <a href="#inicio">
            Inicio
          </a>
        </li>

        <li>
          <a href="#quienes-somos">
            Quiénes somos
          </a>
        </li>

        <li>
          <a href="#areas">
            Áreas de trabajo
          </a>
        </li>

        <li>
          <a href="#salud">
            Programa de Salud
          </a>
        </li>

      </ul>


      <button
        className="login-btn"
        onClick={() => navigate("/login")}
      >
        Iniciar sesión
        <span>→</span>
      </button>

    </nav>
  );
}

export default Navbar;