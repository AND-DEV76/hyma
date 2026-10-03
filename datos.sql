INSERT INTO rol (nombre) VALUES
('ADMIN'),
('MEDICO'),
('ENFERMERA'),
('FARMACIA'),
('SOCIAL');


-- ==========================================================
-- 1. INSERCIÓN DE CATEGORÍAS DE DIAGNÓSTICO
-- ==========================================================

INSERT INTO categoria_diagnostico (nombre, descripcion) VALUES
('INFECCIOSOS', 'Enfermedades por agentes patógenos infecciosos'),
('CRONICOS', 'Padecimientos de larga duración continuada'),
('GINECOLOGICO', 'Salud del sistema reproductor femenino'),
('NUTRICIONAL', 'Trastornos del estado nutricional infantil'),
('OTROS', 'Diagnósticos y evaluaciones generales diversas')
ON CONFLICT (nombre) DO NOTHING;


-- ==========================================================
-- 2. INSERCIÓN DEL CATÁLOGO VINCULADO A SU CATEGORÍA
-- ==========================================================

-- INFECCIOSOS
INSERT INTO catalogo_cie10 (codigo, descripcion, id_categoria) VALUES
('INF-01', 'Infección respiratoria', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-02', 'Asma', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-03', 'Infección intestinal', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-04', 'Infección en la piel', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-05', 'Infección de vías urinarias', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-06', 'Infección en el oído', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-07', 'Bronquitis', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-08', 'Hepatitis', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-09', 'Neumonía', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-10', 'Septicemia', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS')),
('INF-11', 'Apendicitis aguda', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'INFECCIOSOS'))
ON CONFLICT (codigo) DO NOTHING;

-- CRONICOS
INSERT INTO catalogo_cie10 (codigo, descripcion, id_categoria) VALUES
('CRO-01', 'Diabetes Mellitus', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'CRONICOS')),
('CRO-02', 'Enfermedades pépticas', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'CRONICOS')),
('CRO-03', 'Hipertensión arterial', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'CRONICOS')),
('CRO-04', 'Síndrome del intestino irritable', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'CRONICOS')),
('CRO-05', 'Artritis Reumatoide', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'CRONICOS')),
('CRO-06', 'Enfermedad pulmonar obstructiva crónica', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'CRONICOS'))
ON CONFLICT (codigo) DO NOTHING;

-- GINECOLOGICO
INSERT INTO catalogo_cie10 (codigo, descripcion, id_categoria) VALUES
('GIN-01', 'Cuidado prenatal', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'GINECOLOGICO')),
('GIN-02', 'Ginecología', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'GINECOLOGICO')),
('GIN-03', 'Planificación familiar', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'GINECOLOGICO')),
('GIN-04', 'Papanicolau', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'GINECOLOGICO'))
ON CONFLICT (codigo) DO NOTHING;

-- NUTRICIONAL
INSERT INTO catalogo_cie10 (codigo, descripcion, id_categoria) VALUES
('NUT-01', 'Anemia', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-02', 'Niño sano', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-03', 'Bajo peso edad menor 5', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-04', 'Retardo crecimiento menor 5 años', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-05', 'Desnutrición aguda moderada menor 5', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-06', 'Desnutrición aguda severa menor 5', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-07', 'Sobre peso', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-08', 'Obesidad', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL')),
('NUT-09', 'Deficiencia de vitaminas', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'NUTRICIONAL'))
ON CONFLICT (codigo) DO NOTHING;

-- OTROS
INSERT INTO catalogo_cie10 (codigo, descripcion, id_categoria) VALUES
('OTR-01', 'Examen de salud infantil', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-02', 'Cuidado y examen de lactante', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-03', 'Mialgia', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-04', 'Dolor de cabeza o migraña', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-05', 'Patología y dolor articulaciones', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-06', 'Problemas de la piel', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-07', 'Otro', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-08', 'Dolor abdominal', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-09', 'Depresores del apetito anoréticos', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-10', 'Alergia', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-11', 'Neuralgia y neuritis', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-12', 'Examen ojos y visión patologías', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-13', 'Examen general', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-14', 'Trastornos emocionales', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-15', 'Fatiga', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-16', 'Ácido úrico y la hipercolesterolemia', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-17', 'Problemas dentales', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-18', 'Polineuropatía diabética', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-19', 'Hernia', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-20', 'Litiasis', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS')),
('OTR-21', 'Dengue', (SELECT id_categoria FROM categoria_diagnostico WHERE nombre = 'OTROS'))
ON CONFLICT (codigo) DO NOTHING;



-- ==========================================================
-- 1. INSERCIÓN DE CATEGORÍAS DE MEDICAMENTOS (FAMILIAS)
-- ==========================================================

INSERT INTO categoria_medicamento (nombre) VALUES
('ANALGESICOS Y ANTIINFLAMATORIOS'),
('ANTIBIOTICOS Y ANTIVIRALES'),
('ANTIPARASITARIOS Y ANTIFUNGICOS'),
('RESPIRATORIOS Y ANTIHISTAMINICOS'),
('GASTROINTESTINALES'),
('CARDIOVASCULARES Y METABOLICOS'),
('VITAMINAS Y SUPLEMENTOS'),
('SOLUCIONES Y ELECTROLITOS'),
('DERMATOLOGICOS Y TOPICOS'),
('SALUD FEMENINA Y GINECOLOGIA'),
('OTROS Y OTICOS/OFTALMICOS')
ON CONFLICT (nombre) DO NOTHING;


-- ==========================================================
-- 2. INSERCIÓN DE CASAS FARMACÉUTICAS (ÚNICAS)
-- ==========================================================

INSERT INTO casa_farmaceutica (nombre) VALUES
('Sonnenschein'),
('Caplin'),
('Arguet'),
('Bodepharma'),
('Donovan'),
('Unipharm'),
('Bayer'),
('Sana'),
('Medpharma'),
('Baxter')
ON CONFLICT (nombre) DO NOTHING;

-- ==========================================================

INSERT INTO alergia (nombre) VALUES
-- Medicamentos (Antibióticos, Analgésicos, Anestésicos y Otros)
('Penicilina y derivados'),
('Amoxicilina'),
('Ampicilina'),
('Sulfas / Sulfametoxazol'),
('AINEs (Aspirina, Ibuprofeno, Naproxeno)'),
('Diclofenaco'),
('Dipirona / Metamizol'),
('Paracetamol / Acetaminofén'),
('Cefalosporinas (Cefalexina, Ceftriaxona)'),
('Eritromicina / Azitromicina (Macrólidos)'),
('Ciprofloxacina / Levofloxacina (Quinolonas)'),
('Anestésicos locales (Lidocaína, Bupivacaína)'),
('Medios de contraste yodados'),
('Anticonvulsivos (Carbamazepina, Fenitoína)'),
('Insulina (proteínas/conservantes)'),
('Vacunas (gelatina/proteína de huevo)'),
('Morfina / Opiáceos'),
('Corticoides tópicos o sistémicos'),

-- Alimentos y Aditivos
('Proteína de la leche de vaca'),
('Lactosa'),
('Huevo (Clara o Yema)'),
('Maní / Cacahuate'),
('Nueces y frutos secos (Almendras, Nueces, Marañón)'),
('Mariscos, moluscos y crustáceos'),
('Pescado (Atún, Salmón, Merluza)'),
('Soya y derivados'),
('Trigo / Gluten (Enfermedad celíaca)'),
('Ajonjolí / Sésamo'),
('Mostaza'),
('Apio'),
('Lupino / Altramuz'),
('Frutas rosáceas (Durazno, Manzana, Fresa, Pera)'),
('Frutas tropicales (Piña, Kiwi, Banano, Mango)'),
('Aguacate'),
('Tomate / Solanáceas'),
('Chocolate / Cacao'),
('Sulfitos y conservantes alimentarios (E220-E228)'),
('Colorantes artificiales (Tartrazina / Amarillo 5)'),
('Monosodio glutamato (MSG)'),

-- Ambientales, Polen y Hongos
('Ácaros del polvo doméstico'),
('Polen de gramíneas / Pastos'),
('Polen de árboles (Olivo, Ciprés, Encino, Abedul)'),
('Polen de malezas (Ambrosía, Artemisa)'),
('Hongos ambientales / Esporas de moho (Alternaria, Cladosporium)'),
('Humedad ambiental'),

-- Animales e Insectos
('Pelo / Epitelio de gato'),
('Pelo / Epitelio de perro'),
('Plumas y caspa de aves'),
('Epitelio de roedores (Hámster, Cobaya)'),
('Picadura de abeja'),
('Picadura de avispa'),
('Picadura de hormiga de fuego / Zompopo'),
('Picadura de pulga'),
('Picadura de mosquito / Zancudo'),

-- Contacto, Materiales y Sustancias Químicas
('Látex / Caucho natural'),
('Níquel / Bisutería y metales'),
('Cobalto'),
('Cromo / Cuero curtido'),
('Fragancias, perfumes y aceites esenciales'),
('Conservantes cosméticos (Parabenos, Formaldehído)'),
('Tintes de cabello (Parafenilendiamina - PPD)'),
('Detergentes, suavizantes y jabones enzimáticos'),
('Plantas (Hiedra venenosa, Ortiga, Lirio)')
ON CONFLICT (nombre) DO NOTHING;





INSERT INTO especialidad_referencia (nombre, descripcion, activo) VALUES
('Medicina General / Familiar', 'Atención médica primaria, integral y continua para todas las edades.', TRUE),
('Medicina Interna', 'Diagnóstico y tratamiento no quirúrgico de enfermedades complejas en adultos.', TRUE),
('Pediatría', 'Cuidado médico, preventivo y desarrollo integral de niños y adolescentes.', TRUE),
('Ginecología y Obstetricia', 'Salud del sistema reproductor femenino, control del embarazo y parto.', TRUE),
('Cardiología', 'Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio.', TRUE),
('Dermatología', 'Prevención, diagnóstico y tratamiento de afecciones en piel, cabello y uñas.', TRUE),
('Endocrinología', 'Trastornos hormonales, metabólicos, diabetes y tiroides.', TRUE),
('Gastroenterología', 'Enfermedades del tubo digestivo, estómago, intestinos, hígado y páncreas.', TRUE),
('Neumología', 'Enfermedades de las vías respiratorias y pulmones.', TRUE),
('Neurología', 'Trastornos del sistema nervioso central, periférico y cerebrovascular.', TRUE),
('Nefrología', 'Prevención y tratamiento de patologías renales e hipertensión arterial.', TRUE),
('Infectología', 'Diagnóstico y manejo de infecciones por virus, bacterias o parásitos.', TRUE),
('Reumatología', 'Enfermedades inflamatorias y autoinmunes que afectan articulaciones y músculos.', TRUE),
('Oncología Médica', 'Diagnóstico y tratamiento del cáncer mediante quimioterapia y terapias sistémicas.', TRUE),
('Psiquiatría', 'Diagnóstico y tratamiento médico/farmacológico de trastornos de la salud mental.', TRUE),
('Geriatría', 'Atención médica especializada e integral en la salud del adulto mayor.', TRUE),
('Hematología', 'Estudio y tratamiento de enfermedades de la sangre y órganos hematopoyéticos.', TRUE),
('Alergología e Inmunología', 'Manejo de alergias, asma y trastornos del sistema inmunológico.', TRUE),
('Fisiatría / Medicina Física', 'Rehabilitación e integración funcional de pacientes con discapacidades físicas.', TRUE),
('Medicina del Trabajo', 'Salud preventiva y gestión de riesgos en entornos laborales.', TRUE),
('Cirugía General', 'Intervenciones quirúrgicas del abdomen, aparato digestivo y tejidos blandos.', TRUE),
('Traumatología y Ortopedia', 'Tratamiento quirúrgico y médico de lesiones en huesos y articulaciones.', TRUE),
('Cirugía Pediátrica', 'Corrección e intervenciones quirúrgicas exclusivas para niños y recién nacidos.', TRUE),
('Cirugía Cardiovascular', 'Operaciones en el corazón y grandes vasos sanguíneos.', TRUE),
('Cirugía Vascular Periférica', 'Diagnóstico y tratamiento quirúrgico de venas y arterias periféricas.', TRUE),
('Neurocirugía', 'Intervenciones en cerebro, médula espinal y columna vertebral.', TRUE),
('Cirugía Plástica y Reconstructiva', 'Reparación, reconstrucción de tejidos dañados y estética.', TRUE),
('Urología', 'Tratamiento quirúrgico del sistema urinario e infertilidad/salud masculina.', TRUE),
('Oftalmología', 'Tratamiento médico y quirúrgico de los ojos y corrección visual.', TRUE),
('Otorrinolaringología', 'Diagnóstico y cirugía de enfermedades de oído, nariz y garganta.', TRUE),
('Cirugía Maxilofacial', 'Intervenciones en estructura facial, mandíbula, cavidad oral y cuello.', TRUE),
('Cirugía Oncológica', 'Resección y tratamiento quirúrgico de tumores malignos y benignos.', TRUE),
('Cirugía Bariátrica', 'Procedimientos quirúrgicos para el tratamiento de la obesidad mórbida.', TRUE),
('Cirugía Torácica', 'Operaciones en órganos dentro del tórax, exceptuando el corazón.', TRUE),
('Coloproctología', 'Diagnóstico y tratamiento quirúrgico de enfermedades del colon, recto y ano.', TRUE),
('Medicina de Urgencias', 'Atención médica inmediata e intensiva a pacientes en estado crítico.', TRUE),
('Anestesiología', 'Manejo del dolor, sedación y soporte vital durante y después de cirugías.', TRUE),
('Medicina Intensiva (UCI)', 'Cuidado y monitoreo de pacientes graves o en fallo multiorgánico.', TRUE),
('Radiología e Imagenología', 'Diagnóstico por imágenes (Rayos X, Ultrasonido, TAC, Resonancia).', TRUE),
('Radiología Intervencionista', 'Procedimientos mínimamente invasivos guiados por imágenes médicas.', TRUE),
('Anatomía Patológica', 'Análisis de biopsias, citologías y muestras de tejidos para diagnósticos.', TRUE),
('Patología Clínica', 'Análisis e interpretación de exámenes de laboratorio clínico.', TRUE),
('Medicina Nuclear', 'Diagnóstico y tratamiento mediante el uso de radiofármacos.', TRUE),
('Genética Médica', 'Diagnóstico y asesoramiento de enfermedades hereditarias y genéticas.', TRUE),
('Cuidados Paliativos', 'Alivio del sufrimiento y dolor en pacientes con enfermedades avanzadas.', TRUE),
('Neonatología', 'Cuidado intensivo de recién nacidos prematuros o con complicaciones.', TRUE),
('Toxicología Médica', 'Diagnóstico y tratamiento de envenenamientos, intoxicaciones y sobredosis.', TRUE),
('Medicina Preventiva', 'Promoción de la salud, control de epidemias y prevención de enfermedades.', TRUE),
('Nutriología Clínica', 'Tratamiento nutricional y dietético en pacientes con condiciones médicas.', TRUE),
('Medicina del Deporte', 'Prevención, diagnóstico y tratamiento de lesiones por actividad física.', TRUE);