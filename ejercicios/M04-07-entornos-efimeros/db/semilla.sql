-- Datos de semilla del lab M04-07.
-- PostgreSQL ejecuta este fichero solo al crear la base de datos (volumen vacío).
CREATE TABLE libros (
  id     SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor  TEXT NOT NULL
);

INSERT INTO libros (titulo, autor) VALUES
  ('Cien años de soledad', 'Gabriel García Márquez'),
  ('La casa de los espíritus', 'Isabel Allende'),
  ('Rayuela', 'Julio Cortázar');
