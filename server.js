const express = require('express');
const app = express();
const port = 3100;

app.use(express.json());

let movies = [
    { id: 1, title: 'Inception', director: 'Christopher Nolan', year: 2010, },
    { id: 2, title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
    { id: 3, title: 'Interstellar', director: 'Christopher Nolan', year: 2014 }
];

let directors = [
    { id: 1, name: 'Christopher Nolan', year: 2010 },
    { id: 2, name: 'The Wachowskis', year: 1999 },
    { id: 3, name: 'Christopher Nolan', year: 2014 }
];

app.get('/', (req, res) => {
    res.send('Selamat datang di API Film!');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});
app.get('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Film tidak ditemukan');
    }
});
app.get('/movies/title/:title', (req, res) => {
    const movie = movies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Film tidak ditemukan');
    }
});

app.get('/directors', (req, res) => {
    res.json(directors);
});

app.get('/directors/:id', (req, res) => {
    const director = directors.find(d => d.id === parseInt(req.params.id));
    if (director) {
        res.json(director);
    } else {
        res.status(404).send('Sutradara tidak ditemukan');
    }
});

app.post('/movies', (req, res) => {
    const newMovie = {
        id: movies.length + 1,
        title: req.body.title,
        director: req.body.director,
        year: req.body.year
    };
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

app.post('/directors', (req, res) => {
    const newDirector = {
        id: directors.length + 1,  
        name: req.body.name,
        year: req.body.year
    };
    directors.push(newDirector);
    res.status(201).json(newDirector);
});

app.put('/directors/:id', (req, res) => {
    const director = directors.find(d => d.id === parseInt(req.params.id));
    if (!director) {
        return res.status(404).send('Sutradara tidak ditemukan');
    }
    if (!req.body || (!req.body.name && !req.body.year)) {
        return res.status(400).json({ error: 'Body request harus berisi name atau year' });
    }
    director.name = req.body.name || director.name;
    director.year = req.body.year || director.year;
    res.json(director);
});

app.delete('/directors/:id', (req, res) => {
    const directorIndex = directors.findIndex(d => d.id === parseInt(req.params.id));
    if (directorIndex !== -1) {
        const deletedDirector = directors.splice(directorIndex, 1)[0];
        res.json(deletedDirector);
    } else {
        res.status(404).send('Sutradara tidak ditemukan');
    }  
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost: ${port}`);
});