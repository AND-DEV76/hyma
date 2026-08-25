INSERT INTO rol (nombre) VALUES
('ADMIN'),
('MEDICO'),
('ENFERMERA'),
('FARMACIA');



INSERT INTO usuario (id_rol, username, password_hash)
SELECT id_rol, 'angel', 'superadmin'
FROM rol
WHERE nombre = 'ADMIN';