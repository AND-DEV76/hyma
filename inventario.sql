-- ============================================================================
-- HYMA - SCRIPT DE CARGA DE INVENTARIO FARMACÉUTICO (OCTUBRE 2026)
-- Carga automática de medicamentos, lotes, precios (+25% margen de venta),
-- auditoría de entrada de stock y cierre mensual para control de farmacia.
-- ============================================================================

BEGIN;

-- 1. CASAS FARMACÉUTICAS ADICIONALES (SI NO EXISTEN)
INSERT INTO casa_farmaceutica (nombre) VALUES
('Ancalmo'),
('Argus'),
('Bonin'),
('Brobesa'),
('Caplin'),
('Conamep'),
('Disfavil'),
('GENERICO'),
('Infasa'),
('Lafco'),
('Lasana'),
('Mylan'),
('Nunz'),
('Operson'),
('Optima Cast'),
('Pharmavisión'),
('Pheniel'),
('Piersan'),
('Sanofi'),
('Selectpharma'),
('Shekinah'),
('Therfan'),
('Vesa'),
('Viamed'),
('Washington'),
('Winzer')
ON CONFLICT (nombre) DO NOTHING;

-- 2. CATEGORÍAS DE MEDICAMENTOS Y MATERIALES (SI NO EXISTEN)
INSERT INTO categoria_medicamento (nombre) VALUES
('ANALGESICOS Y ANTIINFLAMATORIOS'),
('ANTIBIOTICOS Y ANTIVIRALES'),
('ANTIPARASITARIOS Y ANTIFUNGICOS'),
('CARDIOVASCULARES Y METABOLICOS'),
('DERMATOLOGICOS Y TOPICOS'),
('GASTROINTESTINALES'),
('MATERIAL Y EQUIPO MEDICO'),
('OTROS Y OTICOS/OFTALMICOS'),
('RESPIRATORIOS Y ANTIHISTAMINICOS'),
('SALUD FEMENINA Y GINECOLOGIA'),
('SOLUCIONES Y ELECTROLITOS'),
('VITAMINAS Y SUPLEMENTOS')
ON CONFLICT (nombre) DO NOTHING;

-- 3. CREACIÓN DE TABLA TEMPORAL DE STAGING
CREATE TEMP TABLE tmp_carga_inventario (
    id_temp INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    presentacion VARCHAR(100),
    concentracion VARCHAR(100),
    casa_farmaceutica VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    lote VARCHAR(100) NOT NULL,
    fecha_expiracion DATE NOT NULL,
    stock_anterior INT DEFAULT 0,
    pedidos INT DEFAULT 0,
    bonificaciones INT DEFAULT 0,
    stock_actual INT DEFAULT 0,
    precio_unitario DECIMAL(12,2) DEFAULT 0.00,
    precio_venta DECIMAL(12,2) DEFAULT 0.00
) ON COMMIT DROP;

-- Inserción de datos procesados del Excel en staging
INSERT INTO tmp_carga_inventario (nombre, presentacion, concentracion, casa_farmaceutica, categoria, lote, fecha_expiracion, stock_anterior, pedidos, bonificaciones, stock_actual, precio_unitario, precio_venta) VALUES
('Acetaminofen 100mg/1ml', 'Gotero 100mg/1ml', '100mg/1ml', 'Selectpharma', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'FY211', '2028-07-01', 12, 0, 0, 12, 12.00, 15.00),
('Acetaminofen', 'Jbe 120/5ml (120ml)', '5ml', 'Selectpharma', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'GL293', '2029-01-01', 34, 0, 0, 34, 12.00, 15.00),
('Acetaminofen', 'Tab 500 mg', '500 mg', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', '241102', '2027-10-01', 120, 100, 0, 220, 0.40, 0.50),
('Acetaminofen', '80 m gTabletas', '', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'T060L24', '2027-11-01', 80, 0, 0, 80, 0.20, 0.25),
('Acetaminofen', 'Supositorio 300mg', '300mg', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'S/L', '2030-12-31', 0, 0, 0, 0, 1.30, 1.62),
('Aciclovir', '400 mg Tabletas', '400 mg', 'Argus', 'ANTIBIOTICOS Y ANTIVIRALES', 'T021E24', '2027-04-01', 180, 0, 0, 180, 0.40, 0.50),
('Aciclovir', 'Jarabe .200mg/5ml (120ml)', '200mg/5ml', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 32.00, 40.00),
('Aciclovir', 'Jarabe 400mg/5ml (100ml)', '400mg/5ml', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'L013B26', '2027-01-01', 11, 0, 0, 11, 28.00, 35.00),
('Aciclovir', 'Crema 5%', '5%', 'Caplin', 'DERMATOLOGICOS Y TOPICOS', '25E29A', '2027-05-01', 15, 0, 0, 15, 8.00, 10.00),
('Acido Fólico', 'Tabletas 5mg', '5mg', 'Selectpharma', 'VITAMINAS Y SUPLEMENTOS', 'GM019', '2029-11-01', 300, 0, 0, 300, 0.40, 0.50),
('Albendasol', 'tabletas 400mg', '400mg', 'Caplin', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'T075E24', '2027-04-01', 116, 0, 0, 116, 0.80, 1.00),
('Albendasol', 'jarabe 200mg/5ml', '200mg/5ml', 'Selectpharma', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'GE123', '2028-02-01', 5, 0, 0, 5, 8.00, 10.00),
('Albendazol', 'jarabe 400mg/10ml', '400mg/10ml', 'Caplin', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'BA25003', '2027-12-01', 7, 0, 0, 7, 8.00, 10.00),
('Alopurinol', 'tableta 300mg', '300mg', 'Argus', 'CARDIOVASCULARES Y METABOLICOS', 'T033J25', '2027-03-01', 110, 0, 0, 110, 0.80, 1.00),
('Ambroxol Simple (BRODETOS)', 'jarabe. 15mg/5ml (120ml)', '15mg/5ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', '6196', '2027-05-01', 13, 10, 0, 23, 12.00, 15.00),
('Ambroxol + Clenbuterol(Glicitos C)', 'Jarabe. 7.5mg+5mcg/5ml', '7.5mg', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GK081', '2028-10-01', 41, 0, 0, 41, 16.00, 20.00),
('Ambroxol + salbutamol(glicitos S)', 'Jarabe. 2+7.5mg/5ml', '7.5mg/5ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'S/L', '2027-06-01', 0, 0, 0, 0, 16.00, 20.00),
('Amoxicilina', 'JARABA 250mg/5ml', '250mg/5ml', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'G0136', '2028-07-01', 18, 5, 0, 23, 12.00, 15.00),
('Amoxicilina', 'capsulas 500mg', '500mg', 'Argus', 'ANTIBIOTICOS Y ANTIVIRALES', '707250828', '2028-05-01', 310, 100, 0, 410, 0.80, 1.00),
('Amoxicilina + clavulanato potasico', 'tabletas 625mg', '625mg', 'Argus', 'ANTIBIOTICOS Y ANTIVIRALES', '253132240', '2028-08-01', 280, 140, 0, 420, 2.00, 2.50),
('Amoxicil + acido clavulani', 'Susp. 250+62.5mg/5ml (60ml)', '62.5mg/5ml', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'XSU504', '2027-01-01', 27, 0, 0, 27, 28.00, 35.00),
('Amoxicil + acido clavulani (Levecilin AC)', 'Susp. 250+62.5mg/5ml (120ml)', '62.5mg/5ml', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'S/L', '2026-06-01', 0, 0, 0, 0, 34.15, 42.69),
('Azitromizina', 'tabletas 500mg', '500mg', 'Caplin', 'OTROS Y OTICOS/OFTALMICOS', '483260202', '2028-05-01', 90, 0, 0, 90, 4.00, 5.00),
('Azitromizina', 'SUSPENCION 200mg/5ml (30ml)', '200mg/5ml', 'Caplin', 'OTROS Y OTICOS/OFTALMICOS', 'DS01A25', '2027-12-01', 11, 0, 0, 11, 16.00, 20.00),
('Benzoato de Bencilo', 'Locion Topica25%', '25%', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'GS933', '2029-05-01', 8, 2, 0, 10, 12.00, 15.00),
('Bonadiona (vitamina k)', 'Ampolla 10mg/1ml', '10mg/1ml', 'Selectpharma', 'VITAMINAS Y SUPLEMENTOS', 'GN776', '2027-02-01', 14, 0, 0, 14, 8.00, 10.00),
('Bromhexina', 'jarabe 4mg/5ml (120ml)', '4mg/5ml', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'GL293', '2028-11-01', 34, 10, 0, 44, 12.00, 15.00),
('Bromuro de otilino + clordiazepo ( SPASMOCLOR)', 'tabletas 7.5 mg', '7.5 mg', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'GS484', '2028-01-01', 120, 0, 0, 120, 1.00, 1.25),
('Broncomat', 'Sol. Nebulizar 0.5%', '0.5%', 'GENERICO', 'OTROS Y OTICOS/OFTALMICOS', 'GK603', '2027-07-01', 1, 0, 0, 1, 24.00, 30.00),
('Calamina', 'Locion topica 120ml', '120ml', 'Caplin', 'DERMATOLOGICOS Y TOPICOS', 'CE02I25', '2028-06-01', 12, 3, 0, 15, 12.00, 15.00),
('Calamina antialergico', 'Locion topica 120ml', '120ml', 'Ancalmo', 'DERMATOLOGICOS Y TOPICOS', '355F.F10/25', '2030-12-31', 0, 3, 0, 3, 20.00, 25.00),
('Calcio + Vit. D', 'Tabletas 600mg+200UI', '600mg', 'Selectpharma', 'VITAMINAS Y SUPLEMENTOS', 'GF116', '2029-08-01', 280, 0, 0, 280, 0.80, 1.00),
('Cefadroxilo', 'tabletas 500mg', '500mg', 'Argus', 'ANTIBIOTICOS Y ANTIVIRALES', 'CC09J24', '2030-12-31', 200, 0, 0, 200, 1.20, 1.50),
('Cefadroxilo', 'Suspencion 250mg/5ml (60ml)', '250mg/5ml', 'Infasa', 'ANTIBIOTICOS Y ANTIVIRALES', 'E0775', '2028-01-01', 4, 0, 0, 4, 16.00, 20.00),
('Cefixima suspencion', 'jarabe 100 MG /5ml', '100 MG', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'S/L', '2027-12-01', 0, 0, 0, 0, 20.55, 25.69),
('Cefixima suspencion', 'jarabe 100 MG /5ml sabor naranja', '100 MG', 'Caplin', 'OTROS Y OTICOS/OFTALMICOS', 'CC11F25', '2027-03-01', 20, 0, 0, 20, 20.00, 25.00),
('Cefixima', 'Capsula 400 mg caja x 5', '400 mg', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'GM939', '2029-02-01', 55, 25, 0, 80, 7.20, 9.00),
('Ceftriaxona', 'Ampolla 1g/3.5ml', '1g/3.5ml', 'Argus', 'ANTIBIOTICOS Y ANTIVIRALES', '658250903', '2028-04-01', 10, 10, 0, 20, 16.00, 20.00),
('Ciprofloxacina', 'tabletas 500mg', '500mg', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'E2512012', '2028-05-01', 100, 100, 0, 200, 1.20, 1.50),
('Claritromicina', 'Capsula 500mg', '500mg', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'T029I24', '2027-08-01', 50, 0, 0, 50, 2.50, 3.12),
('Claritromicina', 'Suspención 250mg/5ml 60ml', '250mg/5ml', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 32.50, 40.62),
('Cloranfenicol+dexametazona', 'Gotas oftalmicas 0.5%15ml', '0.5%', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'GM0496', '2027-07-01', 8, 0, 0, 8, 20.00, 25.00),
('Cloranfenicol + dexametazona + nafasolina', 'Gotas oftalmicas', '', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'FJ789', '2026-11-01', 8, 0, 0, 8, 20.00, 25.00),
('Cloranfenicol', 'Gotas oftalmicas 0.5%15ml', '0.5%', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'GF936', '2027-10-01', 11, 0, 0, 11, 12.00, 15.00),
('Clorfeniramina', 'Tabletas 4mg.', '4mg', 'Caplin', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'T140L25', '2027-07-01', 170, 100, 0, 270, 0.40, 0.50),
('Clorfeniramina', 'Ampolla 10mg/1ml', '10mg/1ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GS039', '2026-09-01', 15, 0, 0, 15, 8.00, 10.00),
('Clorfeniramina', 'Jarabe 2mg/2ml', '2mg/2ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GN407', '1930-04-01', 28, 0, 0, 28, 12.00, 15.00),
('Clotrimazol 1%', 'Crema tópica', '1%', 'Caplin', 'DERMATOLOGICOS Y TOPICOS', '24J24A', '1930-03-01', 10, 0, 0, 10, 8.00, 10.00),
('Clotrimazol 2% vaginal', 'Crema vaginal 2%', '2%', 'Selectpharma', 'DERMATOLOGICOS Y TOPICOS', 'GN526', '1930-03-01', 7, 5, 0, 12, 12.00, 15.00),
('Clotrimazol Ovulos vaginales', 'Caja de 6 ovulos UNIDADES 100mg', '100mg', 'Caplin', 'OTROS Y OTICOS/OFTALMICOS', 'SU07K25', '2026-12-01', 18, 30, 0, 48, 2.80, 3.50),
('Complejo B', 'Ampolla 10ml', '10ml', 'Bonin', 'VITAMINAS Y SUPLEMENTOS', '275436', '2027-09-01', 7, 5, 0, 12, 12.00, 15.00),
('Cuesiigermina (bacillus clausii 2bill/5ml)', 'Amp. Bebible caja x 10 viales', '5ml', 'Pharmavisión', 'GASTROINTESTINALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 8.00, 10.00),
('Depoprovera ( uniact Anticonceptivo)', 'Ampolla 150mg/1ml', '150mg/1ml', 'GENERICO', 'SALUD FEMENINA Y GINECOLOGIA', 'S/L', '2030-12-31', 1, 0, 0, 1, 36.50, 45.62),
('Dexametazona', 'Ampolla 4mg/2ml', '4mg/2ml', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'JI20150135', '2027-08-01', 40, 0, 0, 40, 8.00, 10.00),
('Diclofenaco potasico', 'Gel Topico', '', 'Argus', 'DERMATOLOGICOS Y TOPICOS', 'C1926', '2027-08-01', 17, 22, 0, 39, 10.00, 12.50),
('Diclofenaco Sodico', 'Ampolla 75mg', '75mg', 'Argus', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'T88251201', '2028-11-01', 17, 50, 0, 67, 8.00, 10.00),
('Diclofenaco potasico', 'jarabe 9mg/5ml', '9mg/5ml', 'Selectpharma', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'GU936', '2027-10-01', 3, 10, 0, 13, 16.00, 20.00),
('Diclofenaco Recinato (JIM LOFENAK )', 'jarabe 9mg/5ml 120 ml', '9mg/5ml', 'Pheniel', 'ANALGESICOS Y ANTIINFLAMATORIOS', '250234', '2030-12-31', 2, 0, 0, 2, 16.00, 20.00),
('Diclofenaco potasico', 'Tabletas de 50 mg', '50 mg', 'Argus', 'ANALGESICOS Y ANTIINFLAMATORIOS', '965250902', '2028-08-01', 320, 0, 0, 320, 0.40, 0.50),
('Diclofenaco + neurotropas', 'Capsulas en gel caja x 100', '', 'Shekinah', 'DERMATOLOGICOS Y TOPICOS', 'S021A26', '2027-04-01', 90, 0, 0, 90, 1.20, 1.50),
('Dicloxacilina sodica', 'tabletas 500mg', '500mg', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'CB05K25', '2027-10-01', 175, 0, 0, 175, 1.60, 2.00),
('Dicloxacilina sodica', 'suspension 125mg/5ml', '125mg/5ml', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'FC686', '2027-07-01', 2, 0, 0, 2, 28.00, 35.00),
('Delrrec ( hemorroidal)', 'Crema', '', 'Caplin', 'DERMATOLOGICOS Y TOPICOS', '26C29A', '2027-12-01', 6, 2, 0, 8, 24.00, 30.00),
('Desloratadina', 'Tabletas 5mg caja x 100', '5mg', 'Caplin', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'T048G24', '2027-03-01', 120, 0, 0, 120, 0.80, 1.00),
('Desloratadina', 'jarabe', '', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'FX103', '2028-06-01', 5, 0, 0, 5, 24.00, 30.00),
('Drobeflux', 'jarabe 120 ml', '120 ml', 'Brobesa', 'OTROS Y OTICOS/OFTALMICOS', '141/26', '2028-05-01', 11, 10, 0, 21, 28.00, 35.00),
('Drobeflux', 'Gota', '', 'Brobesa', 'OTROS Y OTICOS/OFTALMICOS', '02/26*', '2028-01-01', 12, 5, 0, 17, 28.00, 35.00),
('Dexketoprofeno (kalivia inyectado)', 'Ampolla 25mg/1ml caja x 10', '25mg/1ml', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'GY104', '2029-01-01', 66, 25, 0, 91, 12.00, 15.00),
('Dexketoprofeno', 'Tabletas 25mg caja x 10', '25mg', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'S/L', '2030-12-31', 0, 0, 0, 0, 4.00, 5.00),
('Dexketoprofeno (Dropa Dex )', 'Caspsulas de gelatina 25mg caja x 10', '25mg', 'Caplin', 'DERMATOLOGICOS Y TOPICOS', 'S023L25', '2028-11-01', 30, 200, 200, 430, 4.00, 5.00),
('Dolo artrisel (glucosamina+ meloxicam)', 'Sobres caja x 30', '', 'Selectpharma', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'GY136', '2030-12-31', 30, 30, 0, 60, 5.20, 6.50),
('Enalapril', 'tabletas 20mg', '20mg', 'Caplin', 'CARDIOVASCULARES Y METABOLICOS', '677250902', '2028-08-01', 365, 100, 0, 465, 0.40, 0.50),
('Ex-flu multisintomas', 'Jarabe 120ml', '120ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GS146', '2029-04-01', 42, 10, 0, 52, 16.00, 20.00),
('Ex-flu multisintomas', 'Tabletas', '', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GR283', '2028-10-01', 330, 140, 0, 470, 0.80, 1.00),
('Ex-flu multisintomas', 'Ampolla', '', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GR297', '2028-05-01', 10, 0, 0, 10, 8.00, 10.00),
('Exflu tos', 'jarabe 120 ml', '120 ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'G0153', '2030-12-31', 23, 0, 0, 23, 28.00, 35.00),
('Ex-flu infantil', 'Gotas', '', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GN816', '2029-01-01', 7, 0, 0, 7, 16.00, 20.00),
('Enzimas digestivas', 'Tabletas caja x 100', '', 'Selectpharma', 'GASTROINTESTINALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 1.00, 1.25),
('Fenitoina', 'tableta 100mg', '100mg', 'Infasa', 'OTROS Y OTICOS/OFTALMICOS', '311425', '2027-09-01', 100, 0, 0, 100, 0.65, 0.81),
('Fluconazol', 'tabletas 150mg caja x 2 caps', '150mg', 'Caplin', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'C029L25', '2028-11-01', 26, 0, 0, 26, 4.00, 5.00),
('Furosemida', 'tabletas 40mg', '40mg', 'Caplin', 'CARDIOVASCULARES Y METABOLICOS', 'W199L25', '2027-07-01', 145, 0, 0, 145, 0.40, 0.50),
('Glicerina', 'Gotas Oóticas 30ml', '30ml', 'Lasana', 'GASTROINTESTINALES', '7401172400125', '2028-02-01', 9, 5, 0, 14, 8.00, 10.00),
('Glimepirida', 'Tabletas 4mg.', '4mg', 'Caplin', 'CARDIOVASCULARES Y METABOLICOS', 'AL059G25', '2028-01-01', 705, 200, 0, 905, 0.40, 0.50),
('Guayacolato', 'jarabe 100mg/5ml', '100mg/5ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'GE079', '2029-08-01', 22, 0, 0, 22, 12.00, 15.00),
('Germinterol', 'sobres caja x 10', '', 'Caplin', 'GASTROINTESTINALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 12.00, 15.00),
('Hidroclorotiazida', 'tabletas 50 mg', '50 mg', 'Caplin', 'CARDIOVASCULARES Y METABOLICOS', 'TO44V26', '2028-09-01', 315, 100, 0, 415, 0.40, 0.50),
('Hidròxido de Aluminio (trilox)', 'jarabe de 180 ml. Pequeño', '180 ml', 'Selectpharma', 'GASTROINTESTINALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 12.00, 15.00),
('Hidròxido de Aluminio (trilox)', 'jarabe de 360 ml. Grande', '360 ml', 'Selectpharma', 'GASTROINTESTINALES', 'GU425', '2028-04-01', 22, 6, 0, 28, 20.00, 25.00),
('Hydrocortizona', 'crema 1% 30g', '1%', 'Selectpharma', 'DERMATOLOGICOS Y TOPICOS', 'GU647', '2028-05-01', 11, 0, 0, 11, 16.00, 20.00),
('Ibuprofeno', 'tabletas 400 mg', '400 mg', 'Argus', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'TO17K25', '2028-03-01', 245, 100, 0, 345, 0.40, 0.50),
('Ibuprofeno', 'tabletas 600 mg', '600 mg', 'Argus', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'T097K25', '2028-03-01', 310, 0, 0, 310, 0.40, 0.50),
('Ibuprofeno', 'tabletas 800 mg', '800 mg', 'Argus', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'WO70D25', '2027-03-01', 240, 0, 0, 240, 0.50, 0.62),
('Ibuprofeno', 'Jarabe 120ml', '120ml', 'Selectpharma', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'GT356', '1930-02-01', 21, 10, 0, 31, 12.00, 15.00),
('Hierro + Acido folico', 'jarabe', '', 'Selectpharma', 'VITAMINAS Y SUPLEMENTOS', 'GS897', '2028-01-01', 14, 0, 0, 14, 20.00, 25.00),
('Hierro + Acido folico', 'Tabletas caja x 30', '', 'Selectpharma', 'VITAMINAS Y SUPLEMENTOS', 'S/L', '2028-05-01', 0, 0, 0, 0, 30.00, 37.50),
('Ketoconazol', 'Crema tópica 2%', '2%', 'Selectpharma', 'DERMATOLOGICOS Y TOPICOS', 'GT273', '2026-10-01', 9, 0, 0, 9, 12.00, 15.00),
('koreofin ( Anticonceptivas)', 'Tabletas', '', 'Caplin', 'SALUD FEMENINA Y GINECOLOGIA', 'KF2601', '2029-10-01', 8, 0, 0, 8, 16.00, 20.00),
('Lanzoprazol', 'tabletas 30mg', '30mg', 'Argus', 'GASTROINTESTINALES', 'C007L25', '2028-09-01', 185, 0, 0, 185, 0.80, 1.00),
('Levofloxacina', 'tabletas 500mg', '500mg', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'S/L', '2028-08-01', 0, 0, 0, 0, 2.50, 3.12),
('Levofloxacina', 'tabletas 750mg', '750mg', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'T120I25', '2028-08-01', 85, 20, 0, 105, 5.60, 7.00),
('Lidocaina 2%', 'Ampolla', '2%', 'Caplin', 'OTROS Y OTICOS/OFTALMICOS', '243212200', '2027-01-01', 15, 0, 0, 15, 4.00, 5.00),
('Loratadina', 'tabletas 10mg', '10mg', 'Caplin', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'T109J25', '2028-04-01', 150, 0, 0, 150, 0.40, 0.50),
('Loratadina', 'jarabe 5mg/5ml', '5mg/5ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'G0422', '2029-02-01', 13, 5, 0, 18, 12.00, 15.00),
('Losartan', 'tabletas 50mg.', '50mg', 'Argus', 'CARDIOVASCULARES Y METABOLICOS', 'ST082J25A', '2027-04-01', 480, 100, 0, 580, 0.80, 1.00),
('Lagrimas oculares', 'Gotas oftalmicas', '', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'JS662', '2028-09-01', 12, 0, 0, 12, 24.00, 30.00),
('Levogastric (Esomeprazol)', 'Tab 40mg caja x 30', '40mg', 'Selectpharma', 'GASTROINTESTINALES', 'GH620', '2030-12-31', 90, 30, 0, 120, 1.60, 2.00),
('Meloxicam', 'tableta 15 mg', '15 mg', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'T122F25', '2028-05-01', 350, 100, 0, 450, 0.40, 0.50),
('Metamizol (DIPIRONA)', 'Ampolla 1g/2ml', '1g/2ml', 'Selectpharma', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'FZ089', '2028-09-01', 25, 0, 0, 25, 8.00, 10.00),
('Metformina', 'tabletas 850mg', '850mg', 'Infasa', 'CARDIOVASCULARES Y METABOLICOS', '361024', '2027-08-01', 230, 0, 0, 230, 0.80, 1.00),
('Metformina', 'Tabletas 1000 mg', '1000 mg', 'Infasa', 'CARDIOVASCULARES Y METABOLICOS', 'AL086K25', '2028-01-01', 855, 300, 0, 1155, 1.00, 1.25),
('Metformina', 'Tabletas 500 mg', '500 mg', 'Selectpharma', 'CARDIOVASCULARES Y METABOLICOS', 'GP325', '2028-08-01', 250, 0, 0, 250, 0.80, 1.00),
('Metronidazol', 'jarabbe.125mg/5ml', '125mg/5ml', 'Selectpharma', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'GM339', '2029-02-01', 12, 2, 0, 14, 12.00, 15.00),
('Metronidazol', 'tabletas 500mg', '500mg', 'Caplin', 'ANTIPARASITARIOS Y ANTIFUNGICOS', '494251074', '2028-09-01', 140, 100, 0, 240, 0.80, 1.00),
('Metronidazol+ Nistatina (Metrizol v)', 'Caja 10 ovulos 500mg+100,000', '500mg', 'Selectpharma', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'GJ945', '2027-01-01', 50, 0, 0, 50, 24.00, 30.00),
('Metoclopramida', 'ampolla 10 mg inyectado.', '10 mg', 'Selectpharma', 'GASTROINTESTINALES', 'GM821', '2027-10-01', 10, 0, 0, 10, 8.00, 10.00),
('Metoclopramida 2.6mg/ml', 'Gotas', '2.6mg', 'Selectpharma', 'GASTROINTESTINALES', 'GK088', '2029-01-01', 10, 0, 0, 10, 16.00, 20.00),
('Metoclopramida 10mg', 'Tabletas', '10mg', 'Caplin', 'GASTROINTESTINALES', 'T016C26', '2027-04-01', 120, 0, 0, 120, 0.80, 1.00),
('Mesi 3', 'Inyectado', '', 'Piersan', 'OTROS Y OTICOS/OFTALMICOS', '6658', '2028-06-01', 0, 1, 0, 1, 37.00, 46.25),
('Nauseol', 'Ampolla', '', 'Selectpharma', 'GASTROINTESTINALES', 'ER839', '2028-03-01', 18, 0, 0, 18, 3.00, 3.75),
('Nauseol', 'tableta 50mg', '50mg', 'Selectpharma', 'GASTROINTESTINALES', 'FC408', '2027-12-01', 180, 0, 0, 180, 0.80, 1.00),
('Nervisel (Neurotropas 25000)', 'Ampolla 5,000', '', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'FX514', '2028-10-01', 55, 0, 0, 55, 12.00, 15.00),
('Neurotropas', 'Capsulas en gel caja x 50', '', 'Conamep', 'DERMATOLOGICOS Y TOPICOS', 'S/L', '2027-09-01', 0, 0, 0, 0, 1.20, 1.50),
('Nistatina', 'Gotas Orales 100,000UI/ml(30ml)', '000UI', 'Selectpharma', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'FV529', '2028-02-01', 6, 0, 0, 6, 12.00, 15.00),
('Nitaxozanida Tabletas (NITASEL)', 'tabletas', '', 'Selectpharma', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'GN960', '2026-11-01', 0, 0, 0, 0, 18.00, 22.50),
('Nitaxozanida jarabe (NITASEL)', 'jarabe', '', 'Selectpharma', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'S/L', '2026-03-01', 0, 0, 0, 0, 25.00, 31.25),
('Naproxeno', 'Tabletas 550mg caja x 100', '550mg', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'T070A25', '2027-07-01', 200, 100, 0, 300, 1.60, 2.00),
('Neofebrina', 'Jarabe 250/5ml', '5ml', 'Therfan', 'ANALGESICOS Y ANTIINFLAMATORIOS', '5634', '2028-10-01', 11, 0, 0, 11, 24.00, 30.00),
('Neomelubrina', 'supositorios', '', 'Sanofi', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'S/L', '2030-12-31', 0, 0, 0, 0, 7.45, 9.31),
('Otik', 'Suspension óótica', '', 'Piersan', 'OTROS Y OTICOS/OFTALMICOS', '6675', '2029-01-01', 7, 3, 0, 10, 16.00, 20.00),
('Ojo de Aguila', 'Gotas Oftalmicas 10ml', '10ml', 'Piersan', 'OTROS Y OTICOS/OFTALMICOS', '46636', '2027-09-01', 8, 0, 0, 8, 12.00, 15.00),
('Omeprasol', 'tabletas 20mg', '20mg', 'Argus', 'GASTROINTESTINALES', 'C029C26', '2027-09-01', 700, 300, 0, 1000, 0.80, 1.00),
('Pediaflora', 'sobres', '', 'Selectpharma', 'GASTROINTESTINALES', 'S/L', '2027-05-01', 0, 0, 0, 0, 12.00, 15.00),
('Revitaflora', 'SOBRES 10', '', 'Selectpharma', 'GASTROINTESTINALES', 'FB081', '2030-12-31', 15, 50, 0, 65, 12.00, 15.00),
('Penicilina Benzatinica', 'Suspencion .1200.000unidades', '1200.000unidades', 'Washington', 'ANTIBIOTICOS Y ANTIVIRALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 0.00, 0.00),
('Prednisona', 'Tabletas 5mg', '5mg', 'Selectpharma', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'GB250', '2029-07-01', 125, 100, 0, 225, 0.40, 0.50),
('Paracetamol (Zetawin )', 'tabletas 500 mg caja x 100', '500 mg', 'Winzer', 'ANALGESICOS Y ANTIINFLAMATORIOS', '535056', '2027-01-01', 310, 100, 0, 410, 1.20, 1.50),
('Paracetamol', 'Jarabe', '', 'Caplin', 'ANALGESICOS Y ANTIINFLAMATORIOS', 'S/L', '2030-12-31', 0, 0, 0, 0, 0.00, 0.00),
('Propinoxato', 'Gotas 5mg', '5mg', 'Selectpharma', 'GASTROINTESTINALES', 'FY593', '2027-10-01', 10, 2, 0, 12, 16.00, 20.00),
('Propanolol', 'Tableta 40mg caja x 100', '40mg', 'Caplin', 'CARDIOVASCULARES Y METABOLICOS', 'T032E25', '2028-04-01', 100, 0, 0, 100, 0.40, 0.50),
('Prueba de embarazo Yes Not', 'Test por orina', '', 'Caplin', 'SALUD FEMENINA Y GINECOLOGIA', '20260108HCGC', '2028-03-01', 5, 3, 0, 8, 12.00, 15.00),
('Salbutamol', 'jarabe 2mg/5ml', '2mg/5ml', 'Selectpharma', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'FA132', '2027-10-01', 3, 0, 0, 3, 12.00, 15.00),
('Secnidasol', 'tabletas 500mg', '500mg', 'Argus', 'ANTIPARASITARIOS Y ANTIFUNGICOS', 'S/L', '2030-12-31', 0, 0, 0, 0, 0.00, 0.00),
('Sertal compuesto (Espasmolit compuesto)', 'Ampolla15+100mg/2ml', '100mg/2ml', 'Nunz', 'GASTROINTESTINALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 24.00, 30.00),
('Sertal (klorprosin inyectado)', 'Ampolla 15+100mg/2 ml', '100mg/2 ml', 'Selectpharma', 'GASTROINTESTINALES', 'GK624', '2027-07-01', 6, 0, 0, 6, 16.00, 20.00),
('Sertal (klorprosin)', 'Tabletas 125mg+10mg', '125mg', 'Selectpharma', 'GASTROINTESTINALES', 'GT581', '2029-04-01', 245, 100, 0, 345, 1.20, 1.50),
('Simeticona', 'Gotas Pediatricas 30 ml', '30 ml', 'Selectpharma', 'GASTROINTESTINALES', 'GW396', '2029-04-01', 16, 10, 0, 26, 16.00, 20.00),
('Simeticona', 'Tabletas 125mg caja x 30', '125mg', 'Caplin', 'GASTROINTESTINALES', 'S/L', '2026-07-01', 0, 0, 0, 0, 0.60, 0.75),
('Simeticona', 'Tabletas 40 mg masóticables', '40 mg', 'Caplin', 'GASTROINTESTINALES', 'GE697', '2028-11-01', 105, 90, 0, 195, 0.80, 1.00),
('Solucion agua esteril', 'Ampolla de 10 ml', '10 ml', 'Bonin', 'SOLUCIONES Y ELECTROLITOS', '321108', '2030-12-31', 14, 0, 0, 14, 2.00, 2.50),
('Sol.Hartman', '1,000ml', '000ml', 'Bonin', 'SOLUCIONES Y ELECTROLITOS', 'V24M236', '2025-09-01', 1, 0, 0, 1, 20.00, 25.00),
('Sol. Hartman', '500 ml', '500 ml', 'Bonin', 'SOLUCIONES Y ELECTROLITOS', 'P24G730', '2027-08-01', 5, 0, 0, 5, 20.00, 25.00),
('Sol. Salina 0. 9 %', '1,000ml', '9 %', 'Bonin', 'SOLUCIONES Y ELECTROLITOS', '261051', '2026-04-01', 4, 0, 0, 4, 20.00, 25.00),
('Sol. Salina 0. 9 %', '500 ml', '9 %', 'Bonin', 'SOLUCIONES Y ELECTROLITOS', 'P25G717', '2026-05-01', 8, 0, 0, 8, 20.00, 25.00),
('Solucion salina', 'Gotas 15ml', '15ml', 'Selectpharma', 'OTROS Y OTICOS/OFTALMICOS', 'GT217', '2029-04-01', 14, 5, 0, 19, 16.00, 20.00),
('Supositorios de glicerina', 'supositorios', '', 'Caplin', 'GASTROINTESTINALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 0.00, 0.00),
('Supositorios de Nauseol', 'supositorios', '', 'Bonin', 'GASTROINTESTINALES', 'S/L', '2030-12-31', 0, 0, 0, 0, 4.00, 5.00),
('Suero oral', 'Polvo 383.4 g 1 ( vaso)', '383.4 g', 'Ancalmo', 'SOLUCIONES Y ELECTROLITOS', '544H5', '2028-04-01', 22, 0, 0, 22, 1.20, 1.50),
('Suero oral', 'Polvo 20.5 g ( 1 litro)', '20.5 g', 'Caplin', 'SOLUCIONES Y ELECTROLITOS', 'S/L', '2026-08-01', 0, 0, 0, 0, 3.00, 3.75),
('Sulfato ferroso', 'tabletas 300mg', '300mg', 'Selectpharma', 'VITAMINAS Y SUPLEMENTOS', 'G0328', '2028-02-01', 205, 100, 0, 305, 0.40, 0.50),
('Sildenafil', 'Tableta 50 mg caja x 2', '50 mg', 'Washington', 'OTROS Y OTICOS/OFTALMICOS', 'SID50125301', '2028-01-01', 8, 20, 0, 28, 5.25, 6.56),
('Segura plus anticonceptivas', 'Tabletas caja por 28', '', 'Mylan', 'SALUD FEMENINA Y GINECOLOGIA', '8182615', '2030-12-31', 140, 5, 0, 145, 20.00, 25.00),
('Trimetropim', 'tabletas 160/800mg', '800mg', 'Caplin', 'ANTIBIOTICOS Y ANTIVIRALES', 'T113E24', '2027-04-01', 15, 0, 0, 15, 0.80, 1.00),
('Trimetropim', 'Jarabe. 200+40mg/5ml(120ml)', '40mg/5ml', 'Selectpharma', 'ANTIBIOTICOS Y ANTIVIRALES', 'DP215', '2027-12-01', 9, 0, 0, 9, 12.00, 15.00),
('Triple Crema (clotri+beta+genta)', 'Crema tubo 30g', '30g', 'Argus', 'DERMATOLOGICOS Y TOPICOS', 'B2226', '2028-01-01', 21, 5, 0, 26, 12.00, 15.00),
('Unal', 'Ampolla 150+10mg/1.5ml', '10mg/1.5ml', 'Piersan', 'SALUD FEMENINA Y GINECOLOGIA', '3669', '2029-03-01', 2, 0, 0, 2, 24.00, 30.00),
('Vitadec C adultos', 'Ampolla bebible', '', 'Lafco', 'VITAMINAS Y SUPLEMENTOS', '010325A', '2029-10-01', 20, 10, 0, 30, 10.00, 12.50),
('Vitadec C niños', 'Ampolla bebible', '', 'Lafco', 'VITAMINAS Y SUPLEMENTOS', '020625A', '2030-12-31', 0, 40, 0, 40, 10.00, 12.50),
('Vitaminas adultos', 'Tabletas', '', 'Caplin', 'VITAMINAS Y SUPLEMENTOS', 'S/L', '2030-12-31', 0, 0, 0, 0, 0.00, 0.00),
('Vitaminas niños', 'Tabletas', '', 'Caplin', 'VITAMINAS Y SUPLEMENTOS', 'B64J07', '2030-12-31', 0, 0, 1350, 1350, 0.00, 0.00),
('Vitaminas Prenatales', 'Tabletas Gomitas', '', 'Caplin', 'VITAMINAS Y SUPLEMENTOS', 'BL4H30F', '2030-12-31', 0, 0, 800, 800, 0.00, 0.00),
('Vaselina solida simple', 'tarro 40 gr', '40 g', 'Disfavil', 'DERMATOLOGICOS Y TOPICOS', '026-0082', '2028-01-01', 2, 2, 0, 4, 8.00, 10.00),
('Zinc', 'Tabletas 15mg', '15mg', 'Caplin', 'VITAMINAS Y SUPLEMENTOS', 'TC094J24', '2027-09-01', 120, 0, 0, 120, 0.40, 0.50),
('Jeringas', '3 ml', '3 ml', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 100, 100, 0, 200, 0.37, 0.46),
('Jeringas', '5 ml', '5 ml', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 100, 100, 0, 200, 0.36, 0.45),
('Jeringas', '10 ml', '10 ml', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 100, 100, 0, 200, 0.65, 0.81),
('Micropore Nexcare', '1 pg', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 6, 5, 0, 11, 11.15, 13.94),
('Baja Lengua', 'Caja x 100', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 3, 0, 0, 3, 25.00, 31.25),
('Dextrovita', '500ml', '500ml', 'Caplin', 'VITAMINAS Y SUPLEMENTOS', 'S/L', '2030-12-31', 0, 0, 0, 0, 30.00, 37.50),
('Tropium', 'Gotero para nebulizar', '', 'Caplin', 'RESPIRATORIOS Y ANTIHISTAMINICOS', 'S/L', '2030-12-31', 1, 0, 0, 1, 180.00, 225.00),
('Venoseth', 'Unidad', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 13, 10, 0, 23, 5.00, 6.25),
('Angiocath', 'Numero 18', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 15, 0, 0, 15, 5.00, 6.25),
('Angiocath', 'Numero 20', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 6, 10, 0, 16, 6.00, 7.50),
('Angiocath', 'Numero 22', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 19, 0, 0, 19, 3.65, 4.56),
('Angiocath', 'Numero 24', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 22, 0, 0, 22, 3.65, 4.56),
('Venda elasótica', 'Rollo de 2 x 5 yds', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 19, 0, 0, 19, 3.45, 4.31),
('Venda elasótica', 'Rollo de 10 cm x 5 m', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 8, 0, 0, 8, 0.00, 0.00),
('Guante', 'Caja', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 8, 0, 0, 8, 40.00, 50.00),
('Alcohol al 70%', 'Galon', '70%', 'Vesa', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 1, 0, 0, 1, 66.15, 82.69),
('Algodón plisado zuum', '1 libra', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 2, 0, 0, 2, 43.30, 54.12),
('Kit para nebulizar', 'talla s', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 23, 0, 0, 23, 15.55, 19.44),
('Kit para nebulizar', 'talla m', '', 'Caplin', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 60, 0, 0, 60, 15.55, 19.44),
('Vendas de guata', '4" x 4 yardas', '', 'Operson', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 12, 0, 0, 12, 12.00, 15.00),
('Vendas de gasa', '4" x 10 yardas', '', 'Operson', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 12, 0, 0, 12, 12.00, 15.00),
('Espéculos con tornillo', 'Talla S', '', 'Operson', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 10, 0, 0, 10, 8.00, 10.00),
('Espéculos sin tornillo', 'Talla M', '', 'Viamed', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 5, 0, 0, 5, 8.00, 10.00),
('Espéculos con tornillo', 'Talla L', '', 'Operson', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 5, 0, 0, 5, 8.00, 10.00),
('Espátula de aire ginecológica, espátula cervical', '', '', 'Viamed', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 100, 0, 0, 100, 1.20, 1.50),
('Yeso unidad, color GR', '5*4yardas', '', 'Optima Cast', 'MATERIAL Y EQUIPO MEDICO', 'S/L', '2030-12-31', 2, 0, 0, 2, 80.00, 100.00);

-- 4. REGISTRO DE MEDICAMENTOS (EVITANDO DUPLICADOS POR NOMBRE, PRESENTACIÓN Y LABORATORIO)
INSERT INTO medicamento (nombre, presentacion, concentracion, id_casa_farmaceutica, id_categoria_medicamento, estado)
SELECT DISTINCT
    t.nombre,
    NULLIF(t.presentacion, ''),
    NULLIF(t.concentracion, ''),
    c.id_casa_farmaceutica,
    cat.id_categoria_medicamento,
    TRUE
FROM tmp_carga_inventario t
JOIN casa_farmaceutica c ON c.nombre = t.casa_farmaceutica
JOIN categoria_medicamento cat ON cat.nombre = t.categoria
WHERE NOT EXISTS (
    SELECT 1 FROM medicamento m
    WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(t.nombre))
      AND LOWER(TRIM(COALESCE(m.presentacion, ''))) = LOWER(TRIM(COALESCE(t.presentacion, '')))
      AND m.id_casa_farmaceutica = c.id_casa_farmaceutica
);

-- 5. REGISTRO DE LOTES DE MEDICAMENTO CON PRECIO DE COMPRA Y PRECIO DE VENTA (+25%)
INSERT INTO lote_medicamento (id_medicamento, numero_lote, fecha_expiracion, precio_unitario, precio_venta, cantidad_inicial, estado)
SELECT
    m.id_medicamento,
    t.lote,
    t.fecha_expiracion,
    t.precio_unitario,
    t.precio_venta,
    t.stock_actual,
    CASE WHEN t.stock_actual > 0 THEN 'ACTIVO' ELSE 'INACTIVO' END
FROM tmp_carga_inventario t
JOIN casa_farmaceutica c ON c.nombre = t.casa_farmaceutica
JOIN medicamento m ON LOWER(TRIM(m.nombre)) = LOWER(TRIM(t.nombre))
                  AND LOWER(TRIM(COALESCE(m.presentacion, ''))) = LOWER(TRIM(COALESCE(t.presentacion, '')))
                  AND m.id_casa_farmaceutica = c.id_casa_farmaceutica
WHERE NOT EXISTS (
    SELECT 1 FROM lote_medicamento l
    WHERE l.id_medicamento = m.id_medicamento
      AND l.numero_lote = t.lote
      AND l.fecha_expiracion = t.fecha_expiracion
);

-- Si el lote ya existía con mismo medicamento y número de lote, sincronizar stock y precios:
UPDATE lote_medicamento l
SET cantidad_inicial = t.stock_actual,
    precio_unitario = t.precio_unitario,
    precio_venta = t.precio_venta,
    estado = CASE WHEN t.stock_actual > 0 THEN 'ACTIVO' ELSE 'INACTIVO' END
FROM tmp_carga_inventario t
JOIN casa_farmaceutica c ON c.nombre = t.casa_farmaceutica
JOIN medicamento m ON LOWER(TRIM(m.nombre)) = LOWER(TRIM(t.nombre))
                  AND LOWER(TRIM(COALESCE(m.presentacion, ''))) = LOWER(TRIM(COALESCE(t.presentacion, '')))
                  AND m.id_casa_farmaceutica = c.id_casa_farmaceutica
WHERE l.id_medicamento = m.id_medicamento
  AND l.numero_lote = t.lote
  AND l.fecha_expiracion = t.fecha_expiracion;

-- 6. REGISTRO DEL MOVIMIENTO DE ENTRADA INICIAL EN AUDITORÍA DE FARMACIA
DO $$
DECLARE
    v_id_usuario BIGINT;
    v_id_entrada BIGINT;
BEGIN
    SELECT id_usuario INTO v_id_usuario FROM usuario WHERE username = 'farmacia' LIMIT 1;
    IF v_id_usuario IS NULL THEN
        SELECT id_usuario INTO v_id_usuario FROM usuario LIMIT 1;
    END IF;

    INSERT INTO entrada_medicamento (id_usuario, fecha_entrada, tipo_entrada, observaciones)
    VALUES (v_id_usuario, CURRENT_TIMESTAMP, 'PEDIDO', 'Carga inicial de inventario farmacéutico - Octubre 2026')
    RETURNING id_entrada INTO v_id_entrada;

    INSERT INTO detalle_entrada_medicamento (id_entrada, id_lote, cantidad, precio_unitario, precio_venta)
    SELECT
        v_id_entrada,
        l.id_lote,
        t.stock_actual,
        t.precio_unitario,
        t.precio_venta
    FROM tmp_carga_inventario t
    JOIN casa_farmaceutica c ON c.nombre = t.casa_farmaceutica
    JOIN medicamento m ON LOWER(TRIM(m.nombre)) = LOWER(TRIM(t.nombre))
                      AND LOWER(TRIM(COALESCE(m.presentacion, ''))) = LOWER(TRIM(COALESCE(t.presentacion, '')))
                      AND m.id_casa_farmaceutica = c.id_casa_farmaceutica
    JOIN lote_medicamento l ON l.id_medicamento = m.id_medicamento
                           AND l.numero_lote = t.lote
                           AND l.fecha_expiracion = t.fecha_expiracion
    WHERE t.stock_actual > 0;
END $$;

-- 7. INSERCIÓN / ACTUALIZACIÓN DEL CONTROL MENSUAL DE INVENTARIO (OCTUBRE 2026)
INSERT INTO inventario_mensual (
    id_medicamento,
    periodo_mes,
    periodo_anio,
    total_fisico_mes_anterior,
    pedidos,
    otras_entradas,
    total_fisico_mes,
    medicamento_vencido,
    total_entregado,
    saldo_actual,
    inventario_fisico,
    diferencia,
    precio_unitario,
    total_valor,
    fecha_registro
)
SELECT
    m.id_medicamento,
    10, -- Octubre
    2026, -- 2026
    t.stock_anterior,
    t.pedidos,
    t.bonificaciones,
    (t.stock_anterior + t.pedidos + t.bonificaciones),
    0,
    0,
    t.stock_actual,
    t.stock_actual,
    0,
    t.precio_unitario,
    ROUND(t.stock_actual * t.precio_unitario, 2),
    CURRENT_TIMESTAMP
FROM tmp_carga_inventario t
JOIN casa_farmaceutica c ON c.nombre = t.casa_farmaceutica
JOIN medicamento m ON LOWER(TRIM(m.nombre)) = LOWER(TRIM(t.nombre))
                  AND LOWER(TRIM(COALESCE(m.presentacion, ''))) = LOWER(TRIM(COALESCE(t.presentacion, '')))
                  AND m.id_casa_farmaceutica = c.id_casa_farmaceutica
ON CONFLICT (id_medicamento, periodo_mes, periodo_anio)
DO UPDATE SET
    total_fisico_mes_anterior = EXCLUDED.total_fisico_mes_anterior,
    pedidos = EXCLUDED.pedidos,
    otras_entradas = EXCLUDED.otras_entradas,
    total_fisico_mes = EXCLUDED.total_fisico_mes,
    saldo_actual = EXCLUDED.saldo_actual,
    inventario_fisico = EXCLUDED.inventario_fisico,
    precio_unitario = EXCLUDED.precio_unitario,
    total_valor = EXCLUDED.total_valor;

COMMIT;
