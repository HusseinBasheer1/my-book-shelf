import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import db from "./db/db.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Main page
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY created_at DESC");
    res.render("index", { books: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching books");
  }
});

// Add page
app.get("/add", (req, res) => {
  res.render("add");
});

// Add book
app.post("/books", async (req, res) => {
  const { title, author, rating, description, cover_id, date_read } = req.body;

  try {
    await db.query(
      `INSERT INTO books (title, author, rating, description, cover_id, date_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, author, rating, description, cover_id, date_read]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid book data");
  }
});

// Edit page
app.get("/edit/:id", async (req, res) => {
  const bookId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [bookId]);
    res.render("edit", { book: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading book");
  }
});

// Update book
app.post("/books/:id/edit", async (req, res) => {
  const bookId = req.params.id;
  const { title, author, rating, description, cover_id, date_read } = req.body;

  try {
    await db.query(
      `UPDATE books
       SET title = $1, author = $2, rating = $3, description = $4, cover_id = $5, date_read = $6
       WHERE id = $7`,
      [title, author, rating, description, cover_id, date_read, bookId]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating book");
  }
});

// Delete book
app.post("/books/:id/delete", async (req, res) => {
  const bookId = req.params.id;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting book");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
