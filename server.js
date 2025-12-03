//import .env
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
// >>> FIX 1: Import jsonwebtoken <<<
const jwt = require("jsonwebtoken"); 
// Ambil secret dari environment variable
const JWT_SECRET = process.env.JWT_SECRET;

//Ganti impor lama dengan yang ini
const { authenticateToken, authorizeRole } = require("./middleware/auth.js");

//import database
const db = require("./database.js");

const app = express();

const PORT = process.env.PORT || 3200;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute Status
app.get("/status", (req, res) => {
  res.json({ ok: true, status: "Server is running", service: "Movie API" });
});

// AUTH REGISTER
app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Invalid username or password (min 6 characters)." });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("error hashing:", err);
      return res.status(500).json({ error: "Failed to process registration" });
    }
    const sql = "INSERT INTO users (username, password, role) VALUES (?,?,?)";
    const params = [username.toLowerCase(), hashedPassword, "user"];
    db.run(sql, params, function (err) {
      if (err) {
        if (err.message.includes(`UNIQUE constraint`)) {
          return res.status(409).json({ error: "Username sudah terdaftar" });
        }
        console.error("Error inserting user :", err);
        return res.status(500).json({ error: "Failed to process registration" });
      }
      res
        .status(201)
        .json({ message: "User registered successfully", userId: this.lastID });
    });
  });
});

// BUAT ENDPOINT INI HANYA UNTUK PENGUJIAN, HAPUS DI PRODUKSI
app.post("/auth/register-admin", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Invalid username or password (min 6 characters)." });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("error hashing:", err);
      return res.status(500).json({ error: "Failed to process registration" });
    }
    const sql = "INSERT INTO users (username, password, role) VALUES (?,?,?)";
    const params = [username.toLowerCase(), hashedPassword, "admin"]; // tetapkan 'admin'
    db.run(sql, params, function (err) {
      if (err) {
        if (err.message.includes(`UNIQUE`)) {
          return res.status(409).json({ error: "username admin sudah ada" });
        }
        return res.status(500).json({ error: err.message});
      }
      res.status(201).json({ message: "Admin berhasil dibuat", userId: this.lastID});
    });
  });
});

// LOGIN
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username or password is missing" });
  }
  
  const sql = " SELECT * FROM users WHERE username = ?";
  db.get(sql, [username.toLowerCase()], (err, user) => {
    if (err || !user) {
      return res
        .status(401)
        .json({ error: "Username or password is incorrect" });
    }
    
    // >>> FIX 2: Fixed bcrypt.compare callback syntax <<<
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: "Username or password is incorrect" });
      }

      // >>> FIX 3 & 4: Corrected JWT payload and defined userId <<<
      const userId = user.id; 
      // Password TIDAK boleh dimasukkan ke payload
      const payload = { 
        user: { 
          id: userId, 
          username: user.username,
          role: user.role
        }
      };
      
      jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err);
          return res.status(500).json({ error: "Failed to generate token" });
        }
        res.json({ message: "Login successful", token: token });
      });
    });
  });
});



// PROTECTED ROUTES: MOVIES
// Get All Movies (requires token)
app.get("/movies", authenticateToken, (req, res) => {
  // Anda bisa mengakses data user dari token via req.user
  console.log(`User ${req.user.username} is accessing all movies.`); 
  
  const sql = "SELECT * FROM movies ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching movies:", err.message);
      return res.status(500).json({ error: "Failed to fetch movies" });
    }
    res.json({ message: "success", data: rows });
  });
});

// Get Movie by ID (requires token)
app.get("/movies/:id", authenticateToken, (req, res) => {
  const sql = "SELECT * FROM movies WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error("Error fetching movie by ID:", err.message);
      return res.status(500).json({ error: "Failed to fetch movie" });
    }
    if (!row) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json({ message: "success", data: row });
  });
});

// Create New Movie (requires token)
app.post("/movies", authenticateToken, (req, res) => {
  const { title, director, year } = req.body;

  if (!title || !director || !year) {
    return res.status(400).json({ error: "Missing required fields: title, director, and year." });
  }
  
  const sql = "INSERT INTO movies (title, director, year) VALUES (?,?,?)";

  db.run(sql, [title, director, year], function (err) {
    if (err) {
      console.error("Error creating movie:", err.message);
      return res.status(500).json({ error: "Failed to create movie" });
    }
    res.status(201).json({ message: "success", movieId: this.lastID });
  });
});


app.delete("/movies/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
  const sql = "DELETE FROM movies WHERE id = ?";
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      console.error("Error deleting movie:", err.message);
      return res.status(500).json({ error: "Failed to delete movie" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(204).end();
  });
});

// >>> FIX 5: Moved app.listen to the correct location (end of file) <<<
// Start server
if (JWT_SECRET) {
  app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
  });
} else {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file. Server cannot start.");
}