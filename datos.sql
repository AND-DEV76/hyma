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
-- 3. INSERCIÓN DE MEDICAMENTOS CON CATEGORÍA
-- ==========================================================

INSERT INTO medicamento (nombre, presentacion, concentracion, id_categoria_medicamento, id_casa_farmaceutica) VALUES

-- ANALGÉSICOS Y ANTIINFLAMATORIOS
('Acetaminofén 100mg/1ml', 'Gotas 100mg/1ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Acetaminofén', 'Caj x 10 blis x 10 tab', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Acetaminofén', 'Tab 500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Acetaminofén', '80 mg/dropper', '80mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Acetaminofén', 'Supositorio 300mg', '300mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Diclofenaco Sódico', 'Tab. 100mg', '100mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Diclofenaco Sódico', 'Ampolla  75mg', '75mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Diclofenaco Potásico', 'Jarabe 9mg/1ml', '9mg/1ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Diclofenaco Potásico ( DICLOFAR k)', 'Jarabe 9mg/1ml ( 120 ml)', '9mg/1ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Donovan')),
('Diclofenaco Potásico', 'TAB 226.05 20/T18', '20mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Diclofenaco + neurotropas', 'Gel de uso externo x 20G', '20g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Unipharm')),
('Ibuprofeno', 'Tableta 400 mg', '400mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Ibuprofeno', 'Tabletas  800 mg', '800mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Ibuprofeno', 'Tab 200mg', '200mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Ibuprofeno', 'Jarabe 120ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Naproxeno', 'Ampolla', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Nimesulida', 'Tabletas 100mg', '100mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Paracetamol (Tremadol)', 'Solución Inyectable 50 mg/ 1 ml', '50mg/1ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Paracetamol', 'Tab 500 mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), NULL),
('Supositorios de Paracetamol', 'Supositorios', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Baxter')),
('Piroxicam', 'Caj x x100caps caja x 100', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANALGESICOS Y ANTIINFLAMATORIOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),

-- ANTIBIÓTICOS Y ANTIVIRALES
('Aciclovir', 'Tab. 400 mg.  400mg', '400mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Aciclovir', 'Tabletas    200 mg /5ml ( 100 ml)', '200mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Aciclovir', 'Jarabe  200 mg /5ml ( 100 ml)', '200mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Amoxicilina', 'Suspensión 250 mg - 250mg/5ml', '250mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Amoxicilina', 'Tab/Caps 500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Amoxicilina + clavulanato potásico', 'Susp.  250+62.5mg/5ml  (70 ml)', '250+62.5mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Amoxicilina + ácido clavulánico', 'Susp. 200+42.9mg/5ml ( 70 ml)', '200+42.9mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Amoxicilina + ácido clavulanico  (Amoxiclav-AC)', 'Susp. 400+57mg/5ml ( 70 ml)', '400+57mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Azitromicina', 'Tab 500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Azitromicina', 'Suspensión 200mg/5ml (15ml)', '200mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Cefadroxilo', 'Tableta  500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Cefadroxilo', 'Suspensión   250mg/5ml 60ml', '250mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Cefalexina monohidrato', 'Jarabe 250 mg (60 ml)', '250mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Cefalexina monohidrato', 'Capsulas 500 mg ( 100 caps)', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Cefixima', 'Caja de 400 mg x 10 tab', '400mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Ceftriaxona', 'Ampolla 1gr I.M', '1g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Ciprofloxacina', 'Tabletas 500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Claritromicina', 'Tabletas  500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Claritromicina', 'Suspensión 250mg/5ml, 60ml', '250mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Dicloxacilina sodica', 'Tableta 500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Dicloxacilina sodica', 'Jp suspensión 250mg/5ml', '250mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Dofloxacina', 'Jarabe 120 ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Donovan')),
('Eritromicina Estolato', 'Jarabe 125mg/5ml', '125mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Eritromicina Estolato', 'TAB 226', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Eritromicina', 'Jarabe 120 ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Levofloxacina', 'Tabletas 500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Metronidazol', 'Tabletas 500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Metronidazol  jarabe', 'Jarabe  125 mg / 5ml (120ml)', '125mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Nitrofurantoina  Tabletas (NITROGEN)', 'Jatabe', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Nitrofurantoina  jarabe (NITROGEN)', 'Jarabe', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Norfloxacina', 'Tab 400 mg', '400mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Norfloxacina', 'TAB 226.05 20', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Trimetoprim', 'Jarabe  200mg/5mg /  120ml', '200mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Ultraseptil Jarabe', '120ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIBIOTICOS Y ANTIVIRALES'), NULL),

-- ANTIPARASITARIOS Y ANTIFÚNGICOS
('Albendazol', 'Tabletas 400mg', '400mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Albendazol', 'Jarabe 400 mg- 20 ml', '400mg/20ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Albendazol', 'Jarabe 200mg/ 5ml- 60ml', '200mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Fluconazol', 'Tableta  150mg', '150mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Fluconazol', 'Ampolla 200mg', '200mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Ivermectina', 'Crema tópica 1%', '1%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Ivermectina (Ivermectina 6 mg)', 'Tab 6mg', '6mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Ketoconazol', 'Tab 200mg', '200mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Mebendazol', 'Tableta 100 mg', '100mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Mebendazol ( DIFONAL)', 'Ampolla 10mg/2ml', '10mg/2ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), NULL),
('Nistatina (Nifuran/GTS. EN  20,000)', 'Ampolla  2,500 UI', '2500UI', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Nistatina', 'Susp. Oral x 100,000 u/ml 120ml', '100000UI/ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Nitazoxanida', 'Suspensión 100 mg/5 ml ( 30 ml )', '100mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Donovan')),
('Secnidazol', 'Ampolla  500mg', '500mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'ANTIPARASITARIOS Y ANTIFUNGICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),

-- RESPIRATORIOS Y ANTIHISTAMÍNICOS
('Ambroxol  3 mg/ml (Glicitol, SPEDETOL)', 'Jarabe   15mg/ 5ml ( 120ml)', '15mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Ambroxol + Clorfeniramina Cl', 'Jarabe  7.5mg+2mg/5ml', '7.5mg+2mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Ambroxol + Salbutamol (Glicitol S)', 'Jarabe  3 + 0.3mg/ 5ml', '3+0.3mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Broncodilatal', 'Sol. Nebulizar  0.5%', '0.5%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), NULL),
('Clorfeniramina', 'Tab 4mg/4mg', '4mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Clorfeniramina', 'Ampolla 10mg/1ml', '10mg/1ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Clorfeniramina', 'Jarabe 2mg/5ml', '2mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Difenilhidramina ( Jarabe Difen)', 'Crema', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Doxofilina', '400mg', '400mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Donovan')),
('Guayacolato', 'Jarabe 100mg/5ml', '100mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Guayacolato', 'Lotion', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Loratadina', 'Ampolla', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Loratadina', 'Jarabe  5mg/5ml', '5mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Loratadina', 'Tabletas 10mg', '10mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Limpia Moco de Infantes', 'Gotas (0.65%/15ml)', '0.65%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Salbutamol', 'Jarabe 2mg/5ml', '2mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Sorbitocina', 'TAB 226 400 mg expectorantes', '400mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'RESPIRATORIOS Y ANTIHISTAMINICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),

-- GASTROINTESTINALES
('Bromuro de pinitio + clordiazepox (SPASMO CLLOPE)', 'Tabletas 11 mg', '11mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Dimenhidrinato', 'TAB 226.05 20/T18 x 120', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Dimenhidrinato', 'Jarabe', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Enzimas Digestivas', 'TAB 226.024 01 R 100', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Glicerina', 'Supositorio 1g/2g', '1g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Hidróxido de Aluminio + Magnesio', 'Crema de 100 ml.  Topesol', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Hidróxido de Aluminio + Magnesio', 'Jarabe de 360 ml.  Fluimix', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Metoclopramida', 'Jarabe  100 mg/ 5ml', '100mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Metoclopramida  2.4 mg/ml', 'Gotas', '2.4mg/ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Metoclopramida 10mg', 'Lotion', '10mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Omeprazol', 'Capsulas  20mg', '20mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Senal compuestos (no se apercibe el componel)', 'Ampolla 25+100mg/2ml', '25+100mg/2ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sana')),
('Sertal (Butilhioscina y paracetamol)', 'Ampolla 10+500mg/ 1 ml', '10+500mg/1ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Sertal - (Buscapina)', 'Ampolla 20+500mg/2ml', '20+500mg/2ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Simeticona', 'Gotas 100mg/ml(15ml)', '100mg/ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Supositorios de glicerina', 'GTS 20 00.00', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), NULL),
('Silrimarin', 'TAB 226 35 mg caja x 2', '35mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'GASTROINTESTINALES'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Unipharm')),

-- CARDIOVASCULARES Y METABÓLICOS
('Enalapril', 'Tab  20mg', '20mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'CARDIOVASCULARES Y METABOLICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Glibenclamida', 'Tab 5mg 5mg', '5mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'CARDIOVASCULARES Y METABOLICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Losartán', 'Tabletas 50 mg', '50mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'CARDIOVASCULARES Y METABOLICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Metformina', 'Tabletas 850 mg', '850mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'CARDIOVASCULARES Y METABOLICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),

-- VITAMINAS Y SUPLEMENTOS
('Ácido Fólico', 'Tab 5mg. 5mg', '5mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Calcio + Vit. D', 'Tab 500mg/200UI', '500mg/200UI', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Complejo B', 'Tab 10 mg', '10mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bayer')),
('Complejo B  ( B1, B6 y B12 de 10,00/5ml )', 'Jp. O Amp. Bebible con 10 viales', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Unipharm')),
('Hierro + Ácido fólico', 'Tab 200 mg + 0.4mg', '200mg+0.4mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Hierro + Ácido fólico', 'TAB 226 (10 X 10)', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Pedilutina (Ferrosoilron I)', 'Liquido', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Sulfato ferroso', 'Jarabe  125 mg / 5ml', '125mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Sulfato de zinc', 'Tab.  20mg/ 10mg', '20mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), NULL),
('Vitaminas prenatal', 'TAB 226', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), NULL),
('Vitaminas Prenatales', 'Tab caja', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), NULL),
('Zinc', 'Tab  10 mg', '10mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'VITAMINAS Y SUPLEMENTOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),

-- SOLUCIONES Y ELECTROLITOS
('Bicarbonato de Sodio', 'Jarabe  4mg/5ml ( 120ml)', '4mg/5ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SOLUCIONES Y ELECTROLITOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Sol. Hartman', '1,000ml', '1000ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SOLUCIONES Y ELECTROLITOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Baxter')),
('Sol. Hartman', '500 ml', '500ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SOLUCIONES Y ELECTROLITOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Baxter')),
('Sol. Salina  0.9%', '1,000ml', '0.9%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SOLUCIONES Y ELECTROLITOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Baxter')),
('Sol. Salina  0.9%', '500 ml', '0.9%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SOLUCIONES Y ELECTROLITOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Baxter')),
('Suero oral', 'Polvo  20.5 g  x 1 sobl', '20.5g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SOLUCIONES Y ELECTROLITOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Donovan')),
('Suero oral', 'Polvo x 20.5 g - 4 Sobres', '20.5g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SOLUCIONES Y ELECTROLITOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),

-- DERMATOLÓGICOS Y TÓPICOS
('Benzoato de Bencilo', 'Loción 75ml al 25%', '25%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Betametasona (Scleramin)', 'Ampolla 10mg/2ml', '10mg/2ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Calamina', 'Loción Tópica 120ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Clotrimazol 1%', 'Crema Tópica', '1%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Dexametasona  ( Fortecortin / Antianafiláctico)', 'Ampolla 4mg/1ml', '4mg/1ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), NULL),
('Dexametasona sodio', 'Ampolla 4mg/ 1ml', '4mg/1ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Hidrocortisona  loción', 'Lotion 120 ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Hidrocortisona', 'Crema de 15g', '15g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Permetrina (Permetrina)', 'Suspensión  1200.00-Somatico', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Unipharm')),
('Prednisona', 'Tab de  5 mg', '5mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Tríple antibiótico', 'Ungüento', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), NULL),
('Tríple antibiótico (Loticin)', '120 ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), NULL),
('Tríple Crema (Solución Antiinflamatoria)', 'Crema tubo 20g', '20g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Vaselina solida verde', 'Tarro 30 gr', '30g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Medpharma')),
('Vaselina solida verde', 'Tarro 15 gr', '15g', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'DERMATOLOGICOS Y TOPICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Unipharm')),

-- SALUD FEMENINA Y GINECOLOGÍA
('Clotrimazol 2% Vaginal', 'Crema Vaginal 20g', '2%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SALUD FEMENINA Y GINECOLOGIA'), NULL),
('Clotrimazol, Óvulos vaginales', 'Caj x 6 óvulos, 200mg', '200mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SALUD FEMENINA Y GINECOLOGIA'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Metronidazol + Nistatina  (Filtricod 4)', 'Caj.  20 ovulos (500mg + 100,000 UI)', '500mg+100000UI', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SALUD FEMENINA Y GINECOLOGIA'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Píldoras de emergencia o.n.a. 1.5 mg', 'Tab de 1.5 mg', '1.5mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'SALUD FEMENINA Y GINECOLOGIA'), NULL),

-- OTROS Y ÓTICOS/OFTÁLMICOS
('Allercurial', 'Tabletas 100mg', '100mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Arguet')),
('Cloranfenicol + Dexametasona', 'Gotas Oticas 0.5%/0.1% 5ml', '0.5%/0.1%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Cloranfenicol + dexametasona + lidocaina', 'Gotas Oftálmicas', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Cloranfenicol', 'Gotas oftálmicas 0.5%(5ml)', '0.5%', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sonnenschein')),
('Doxorrubicina Clorhidrato inyectable', 'Ampolla  20mg/10ml caja x 20', '20mg/10ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Doxorrubicina inyectable', 'Tab 10mg o 20mg caja x 10', '10mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Ergotamina + cafeína', 'Jp 120 ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Finasterida', 'Tableta 100mg', '100mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Normoxenina', 'Caj x x100 caps x 100', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('O.N.A', 'Suspensión  60ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Sana')),
('Ojo de Águila', 'Gotas  Oftálmicas 10ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Unipharm')),
('Pieroxanida', 'Bolsa 25ml', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Bodepharma')),
('Solución salina', 'Gotas  oticas', NULL, (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), NULL),
('Sorbitocina', 'TAB 226 100 mg / caja x 10', '100mg', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Caplin')),
('Ubral', 'Ampolla   100mg/ 2mg/ ml', '100mg/2ml', (SELECT id_categoria_medicamento FROM categoria_medicamento WHERE nombre = 'OTROS Y OTICOS/OFTALMICOS'), (SELECT id_casa_farmaceutica FROM casa_farmaceutica WHERE nombre = 'Unipharm'));




-- ==========================================================
-- INSERCIÓN AMPLIADA DE ALERGIAS COMUNES Y CLÍNICAS
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