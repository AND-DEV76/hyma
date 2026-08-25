import './Hero.css'

import hymaLogo from '../../assets/images/log3.png'
import saludLogo from '../../assets/images/log1.png'
import educacionLogo from '../../assets/images/log2.png'

function Hero() {
  return (
    <main>

      {/* HERO */}
      <section className="hero" id="inicio">

        <div className="hero-content">

          <div className="hero-text">

            <span className="hero-tag">
              ORGANIZACIÓN NO GUBERNAMENTAL
            </span>

            <h1>
              Hombre y Mujer
              <br />
              <span>en Acción</span>
            </h1>

            <p className="hero-description">
              Trabajamos por el bienestar y desarrollo de las comunidades,
              impulsando oportunidades en salud, educación y desarrollo social.
            </p>

            <div className="hero-actions">
              <a href="#areas" className="secondary-btn">
                Conoce nuestra labor
              </a>

              <a href="/login" className="primary-btn">
                Acceder al sistema
                <span>→</span>
              </a>
            </div>

            <div className="hero-values">
              <div>
                <strong>3</strong>
                <span>Áreas de trabajo</span>
              </div>

              <div>
                <strong>+</strong>
                <span>Programas sociales</span>
              </div>

              <div>
                <strong>∞</strong>
                <span>Compromiso comunitario</span>
              </div>
            </div>

          </div>


          <div className="hero-visual">

            <div className="hero-circle"></div>

            <div className="hero-logo-card">
              <img src={hymaLogo} alt="Logo Hombre y Mujer en Acción" />
            </div>

            <div className="floating-card health-card">

              <div className="floating-icon">
                <img
                  src={saludLogo}
                  alt="Programa de Salud"
                />
              </div>

              <div>
                <span>Programa de Salud</span>
                <strong>Obras Sociales San Martín</strong>
              </div>

            </div>

<div className="floating-card education-card">

  <div className="floating-icon">

    <img
      src={educacionLogo}
      alt="Programa de Educación"
    />

  </div>

  <div>
    <span>Programa de Educación</span>
    <strong>Becas y Centro de Aprendizaje</strong>
  </div>

</div>

          </div>

        </div>

      </section>


      {/* AREAS */}
      <section className="areas-section" id="areas">

        <div className="section-heading">

          <span>ÁREAS DE TRABAJO</span>

          <h2>
            Una organización,
            <br />
            <strong>tres formas de transformar vidas.</strong>
          </h2>

          <p>
            HYMA desarrolla programas orientados a responder a las
            necesidades de las comunidades, creando oportunidades y
            promoviendo una mejor calidad de vida.
          </p>

        </div>


        <div className="areas-grid">

          {/* SALUD */}
          <article className="area-card area-health">

            <div className="area-logo">
              <img src={saludLogo} alt="Programa de Salud" />
            </div>

            <span className="area-number">01</span>

            <h3>Salud</h3>

            <p>
              Programa de Salud Obras Sociales San Martín,
              enfocado en brindar atención integral a personas,
              especialmente aquellas de escasos recursos.
            </p>

            <div className="services">
              <span>Clínica médica</span>
              <span>Clínica dental</span>
              <span>Psicología</span>
              <span>Farmacia</span>
              <span>Trabajo social</span>
              <span>Jornadas médicas</span>
            </div>

            <a href="/login" className="area-link">
              Acceder al sistema <span>→</span>
            </a>

          </article>


          {/* EDUCACIÓN */}
          <article className="area-card">

            <div className="area-logo">
              <img src={educacionLogo} alt="Programa de Educación" />
            </div>

            <span className="area-number">02</span>

            <h3>Educación</h3>

            <p>
              Generamos oportunidades educativas mediante programas
              que apoyan a jóvenes de escasos recursos para alcanzar
              sus objetivos académicos.
            </p>

            <div className="services">
              <span>Becas</span>
              <span>Centro de aprendizaje</span>
              <span>Nivel básico</span>
              <span>Diversificado</span>
              <span>Universidad</span>
            </div>

            <a href="#educacion" className="area-link">
              Conocer programa <span>→</span>
            </a>

          </article>


          {/* DESARROLLO */}
          <article className="area-card">

            <div className="area-logo development-logo">
              <img src={hymaLogo} alt="Programa de Desarrollo" />
            </div>

            <span className="area-number">03</span>

            <h3>Desarrollo</h3>

            <p>
              Impulsamos proyectos que contribuyen al bienestar
              de las comunidades y mejoran sus condiciones de vida.
            </p>

            <div className="services">
              <span>Laboratorios de computación</span>
              <span>Filtros de agua</span>
              <span>Puestos de salud</span>
              <span>Estufas ecológicas</span>
            </div>

            <a href="#desarrollo" className="area-link">
              Conocer programa <span>→</span>
            </a>

          </article>

        </div>

      </section>


      {/* SALUD DESTACADO */}
      <section className="health-feature" id="salud">

        <div className="health-feature-inner">

          <div className="health-feature-logo">
            <img
              src={saludLogo}
              alt="Programa de Salud Obras Sociales San Martín"
            />
          </div>

          <div className="health-feature-text">

            <span>PROGRAMA DE SALUD</span>

            <h2>
              Obras Sociales
              <br />
              <strong>San Martín</strong>
            </h2>

            <p>
              Un programa integral que brinda servicios de salud para
              todas las personas, especialmente para quienes se encuentran
              en situación de escasos recursos.
            </p>

            <div className="health-services">

              <div>
                <strong>01</strong>
                Clínica médica
              </div>

              <div>
                <strong>02</strong>
                Clínica dental
              </div>

              <div>
                <strong>03</strong>
                Clínica psicológica
              </div>

              <div>
                <strong>04</strong>
                Trabajo social
              </div>

              <div>
                <strong>05</strong>
                Farmacia
              </div>

              <div>
                <strong>06</strong>
                Jornadas médicas
              </div>

            </div>

            <a href="/login" className="health-button">
              Ingresar al sistema
              <span>→</span>
            </a>

          </div>

        </div>

      </section>

    </main>
  )
}

export default Hero