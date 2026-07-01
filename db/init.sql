CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
  userName       VARCHAR(100) NOT NULL,
  userEmail      VARCHAR(150) NOT NULL UNIQUE,
  userPassword   VARCHAR(255) NOT NULL,
  userImg        VARCHAR(255),
  userRole       VARCHAR(50) DEFAULT 'cliente'
);

CREATE TABLE IF NOT EXISTS productos (
  id_producto        INT AUTO_INCREMENT PRIMARY KEY,
  nombre_producto    VARCHAR(150) NOT NULL,
  codigo_producto    VARCHAR(50),
  cantidad_producto  INT DEFAULT 0,
  precio_producto    DECIMAL(10,2) DEFAULT 0,
  starRating         DECIMAL(2,1) DEFAULT 0,
  url_imagen         VARCHAR(255)
);
