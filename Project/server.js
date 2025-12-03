const express = require('express');
const cors = require('cors');

const app = express();
const port = 3300;

app.use(cors());

// Endpoint untuk status server
app.get('/status', (req, res) => {
  res.send('Server berjalan dengan sukses!');
});

// Endpoint untuk mendapatkan semua ulasan
app.get('/reviews', (req, res) => {
  res.json(reviews);
});


// Endpoint untuk mendapatkan ulasan berdasarkan ID
app.get('/reviews/:id', (req, res) => {
  const reviewId = parseInt(req.params.id);
  const review = reviews.find(r => r.id === reviewId);

  if (review) {
    res.json(review);
  } else {
    res.status(404).send('Ulasan tidak ditemukan.');
  }

app.post('/reviews', (req, res) => {
  const { filmid, user, rating, comment } = req.body;

  if (!filmid || !user || !rating || !comment) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }
});

});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// Basis data sementara untuk ulasan
let reviews = [
  {
    id: 1,
    film_id: "2baf70d1-42bb-4437-b551-e5fed5a87abe",
    user: "Baruna",
    ratting: 100,
    comment: "Filmnya keren banget, aku suka animasinya!"
  },
  {
    id: 2,
    film_id: "3baf70d1-42bb-4437-b551-e5fed5a87abe",
    user: "Mathew",
    ratting: 99,
    comment: "Film dengan animasi yang dewa, hampir tidak bisa membedakan apakah ini asli atau palsu!"
  },
  {
    id: 3,
    film_id: "4baf70d1-42bb-4437-b551-e5fed5a87abe",
    user: "vero",
    ratting: 85,
    comment: "keren banget tidak bisa berkata kata!"
  },
   {
    id: 4,
    film_id: "5baf70d1-42bb-4437-b551-e5fed5a87abe",
    user: "Hillmi",
    ratting: 98,
    comment: "pemerannya sangat mendalami sekali!"
  },
   {
    id: 5,
    film_id: "6baf70d1-42bb-4437-b551-e5fed5a87abe",
    user: "Septa",
    ratting: 77,
    comment: "keren sih, namun masih ada pemeran yang bercanda!"
  },
];