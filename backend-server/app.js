require('dotenv').config();
var express = require('express');
var mysql   = require('mysql');
var app     = express();
var bcrypt  = require('bcrypt');
var jwt     = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const EMAIL_CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const EMAIL_CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const EMAIL_REDIRECT_URI = process.env.EMAIL_REDIRECT_URI;
const EMAIL_REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    EMAIL_CLIENT_ID,
    EMAIL_CLIENT_SECRET,
    EMAIL_REDIRECT_URI
);

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
    const ticket = await client.verifyIdToken({
      idToken: googletoken,
      audience: GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    conn.query('SELECT * FROM usuarios WHERE userEmail = ?', [email], (err, results) => {
      if (err) {
        return res.status(500).json({ ok: false, mensaje: 'Error al consultar la base de datos', error: err });
      }
      if (results.length === 0) {
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
        const user = results[0];
        const token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });
        res.status(200).json({ ok: true, mensaje: 'Login exitoso', usuario: user, token });
      }
    });
  } catch (error) {
    res.status(401).json({ ok: false, mensaje: 'Token de Google no válido', error: error.message });
  }
});

// ── EMAIL ──────────────────────────────────────────────────────────────
oauth2Client.setCredentials({ refresh_token: EMAIL_REFRESH_TOKEN });
const accessToken = oauth2Client.getAccessToken();

const smptTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: EMAIL_CLIENT_ID,
        clientSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
        accessToken: accessToken
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Enviar Email de Prueba (sin JWT)
app.post('/email-test', (req, res) => {
    const { email_adress } = req.body;

    let msg = `<h3>
        <span style="background-color: #ffcc00;">
            Envío de Email con NodeJS - Nodemailer y GMail
        </span>
    </h3>
    <p>Este es un <strong>email de ejemplo</strong> utilizando
        <span style="color: #ff0000;">Nodemailer</span> y <em>NodeJS</em>.
    </p>
    <ul>
        <li>Permite formato HTML</li>
        <li>Permite adjuntar archivos</li>
        <li>Se utiliza una cuenta GMail configurada con OAuth2</li>
    </ul>`;

    const mailOptions = {
        from: "Asignatura Angular",
        to: email_adress,
        subject: "Email de ejemplo con Nodemailer",
        generateTextFromHTML: true,
        html: msg
    };

    smptTransport.sendMail(mailOptions, (err, response) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log(response);
        smptTransport.close();
        res.status(200).json({
            ok: true,
            mensaje: 'Email enviado correctamente'
        });
    });
});
// ── RECUPERACIÓN DE CONTRASEÑA ─────────────────────────────────────────
const recoveryStore = {};

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, mensaje: 'Email requerido' });

  conn.query('SELECT * FROM usuarios WHERE userEmail = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ ok: false, mensaje: 'Error de base de datos' });

    if (results.length === 0)
      return res.status(404).json({ ok: false, mensaje: 'No existe una cuenta con ese email.' });

    const user = results[0];

    const isGoogleUser = user.userImg && user.userImg.includes('googleusercontent.com');
    if (isGoogleUser)
      return res.status(400).json({
        ok: false,
        mensaje: 'Esta cuenta usa Google para iniciar sesión. No necesita contraseña.',
        esGoogle: true
      });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    recoveryStore[email] = { code, expiry };

    try {
      const accessTokenResponse = await oauth2Client.getAccessToken();
      const accessToken = accessTokenResponse.token;

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: EMAIL_CLIENT_ID,
          clientSecret: EMAIL_CLIENT_SECRET,
          refreshToken: EMAIL_REFRESH_TOKEN,
          accessToken: accessToken
        },
        tls: { rejectUnauthorized: false }
      });

      const msg = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 32px;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p>Hola <strong>${user.userName}</strong>,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña en <strong>ACME Corp</strong>.</p>
          <p>Tu código de verificación es:</p>
          <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; text-align: center;
                      background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #888; font-size: 13px;">⏱ Este código expira en <strong>10 minutos</strong>.</p>
          <p style="color: #888; font-size: 13px;">Si no solicitaste esto, puedes ignorar este correo.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #bbb; font-size: 11px; text-align: center;">ACME Corp — Sistema de gestión</p>
        </div>`;

      await transport.sendMail({
        from: 'ACME Corp <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'Tu código de verificación - ACME Corp',
        html: msg
      });

      transport.close();
      res.status(200).json({ ok: true, mensaje: 'Código enviado al correo.' });

    } catch (error) {
      console.error('Error enviando email:', error);
      res.status(500).json({ ok: false, mensaje: 'Error al enviar el código. Intenta más tarde.' });
    }
  });
});

app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const entry = recoveryStore[email];

  if (!entry)
    return res.status(400).json({ ok: false, mensaje: 'No hay solicitud de recuperación para este email.' });

  if (Date.now() > entry.expiry) {
    delete recoveryStore[email];
    return res.status(400).json({ ok: false, mensaje: 'El código ha expirado. Solicita uno nuevo.' });
  }

  if (entry.code !== code)
    return res.status(400).json({ ok: false, mensaje: 'Código incorrecto.' });

  const resetToken = jwt.sign({ email, reset: true }, SEED, { expiresIn: 600 });
  delete recoveryStore[email];

  res.status(200).json({ ok: true, resetToken });
});

app.post('/reset-password', (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword)
    return res.status(400).json({ ok: false, mensaje: 'Datos incompletos.' });

  jwt.verify(resetToken, SEED, (err, decoded) => {
    if (err || !decoded.reset)
      return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado.' });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    conn.query(
      'UPDATE usuarios SET userPassword = ? WHERE userEmail = ?',
      [hashedPassword, decoded.email],
      (err) => {
        if (err) return res.status(500).json({ ok: false, mensaje: 'Error al actualizar contraseña.' });
        res.status(200).json({ ok: true, mensaje: 'Contraseña actualizada correctamente.' });
      }
    );
  });
});

// ── MIDDLEWARE JWT (va después de las rutas públicas) ──────────────────
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

// GET top 5 productos por rating
app.get('/productos/top/ranking', (req, res) => {
  conn.query(
    'SELECT nombre_producto, starRating FROM productos ORDER BY starRating DESC LIMIT 5',
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

app.listen(3000, () => console.log('Backend corriendo en puerto 3000'));