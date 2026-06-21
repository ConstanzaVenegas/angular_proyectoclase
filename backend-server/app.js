require('dotenv').config();
var express = require('express');
var mysql   = require('mysql');
var app     = express();
var bcrypt  = require('bcrypt');
var jwt     = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
let SEED = "esta-es-una-semilla-para-generar-el-token";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});


var conn = mysql.createConnection({
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME
});
conn.connect();

app.use(express.static('public'));



app.post('/usuarios', (req, res) => {
  const { name, email, img, role } = req.body;
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  conn.query(
    `INSERT INTO usuarios (userName, userEmail, userPassword, userImg, userRole) VALUES (?,?,?,?,?)`,
    [name, email, hashedPassword, img, role],
    (err) => {
      if (err) throw err;
      res.status(201).json({ ok: true, mensaje: 'Usuario registrado correctamente' });
    }
  );
});

app.post('/login', (req, res) => {
  conn.query('SELECT * FROM usuarios WHERE userEmail = ?', [req.body.email], (err, results) => {
    if (err) throw err;
    if (results.length === 0)
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    const user = results[0];
    if (!bcrypt.compareSync(req.body.password, user.userPassword))
      return res.status(401).json({ ok: false, mensaje: 'Contraseña incorrecta' });
    const token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });
    res.status(200).json({ ok: true, mensaje: 'Login exitoso', usuario: user, token });
  });
});

// Login con Google
app.post('/google-login', async (req, res) => {
  const { googletoken } = req.body;

  try {
    // Comprobamos que el token de Google es válido
    const ticket = await client.verifyIdToken({
      idToken: googletoken,
      audience: GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    // Buscar el email en nuestra base de datos
    conn.query('SELECT * FROM usuarios WHERE userEmail = ?', [email], (err, results) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar la base de datos',
          error: err
        });
      }

      if (results.length === 0) {
        // El email no existe: creamos un usuario nuevo
        const randomPassword = bcrypt.hashSync(Math.random().toString(36), 10);

        conn.query(
          `INSERT INTO usuarios (userName, userEmail, userPassword, userImg, userRole) VALUES (?,?,?,?,?)`,
          [name, email, randomPassword, picture, 'cliente'],
          (errInsert, resultInsert) => {
            if (errInsert) {
              return res.status(500).json({ ok: false, mensaje: 'Error al crear usuario', error: errInsert });
            }

            const nuevoUsuario = {
              id_usuario: resultInsert.insertId,
              userName: name,
              userEmail: email,
              userImg: picture,
              userRole: 'cliente'
            };

            const token = jwt.sign({ usuario: nuevoUsuario }, SEED, { expiresIn: 14400 });
            res.status(201).json({ ok: true, mensaje: 'Usuario creado y login exitoso', usuario: nuevoUsuario, token });
          }
        );
      } else {
        // El usuario ya existe: generamos el token JWT de nuestra aplicación
        const user = results[0];
        const token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });
        res.status(200).json({ ok: true, mensaje: 'Login exitoso', usuario: user, token });
      }
    });
  } catch (error) {
    // El token de Google no es correcto
    res.status(401).json({ ok: false, mensaje: 'Token de Google no válido', error: error.message });
  }
});


app.use(function(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, mensaje: 'Token no proporcionado' });
  jwt.verify(token, SEED, (err, decoded) => {
    if (err) return res.status(401).json({ ok: false, mensaje: 'Token no válido' });
    req.usuario = decoded.usuario;
    next();
  });
});



// GET todos los productos
app.get('/productos', (req, res) => {
  conn.query('SELECT * FROM productos', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// GET producto por id
app.get('/productos/:id', (req, res) => {
  conn.query('SELECT * FROM productos WHERE id_producto = ?', [req.params.id], (err, rows) => {
    if (err) throw err;
    res.json({ ok: true, producto: rows[0] });
  });
});

// POST crear producto
app.post('/producto', (req, res) => {
  const { nombre_producto, codigo_producto, cantidad_producto, precio_producto, starRating, url_imagen } = req.body;
  conn.query(
    `INSERT INTO productos (nombre_producto, codigo_producto, cantidad_producto, precio_producto, starRating, url_imagen)
     VALUES (?,?,?,?,?,?)`,
    [nombre_producto, codigo_producto, cantidad_producto, precio_producto, starRating, url_imagen],
    (err) => {
      if (err) throw err;
      res.status(201).json({ ok: true, mensaje: 'Producto creado' });
    }
  );
});

// PUT actualizar producto
app.put('/producto/:id', (req, res) => {
  const { nombre_producto, codigo_producto, cantidad_producto, precio_producto, starRating, url_imagen } = req.body;
  conn.query(
    `UPDATE productos SET nombre_producto=?, codigo_producto=?, cantidad_producto=?, precio_producto=?, starRating=?, url_imagen=?
     WHERE id_producto=?`,
    [nombre_producto, codigo_producto, cantidad_producto, precio_producto, starRating, url_imagen, req.params.id],
    (err) => {
      if (err) throw err;
      res.json({ ok: true, mensaje: 'Producto actualizado' });
    }
  );
});

// DELETE producto
app.delete('/producto/:id', (req, res) => {
  conn.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id], (err) => {
    if (err) throw err;
    res.json({ ok: true, mensaje: 'Producto eliminado' });
  });
});

app.listen(3000, () => console.log('Backend corriendo en puerto 3000'));