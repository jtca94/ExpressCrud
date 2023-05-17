import express from "express";
import path from "path";
import {writeFile, readFile} from "fs/promises";

const app = express();
const PORT = process.env.PORT || 3000;
// direccion root dependiendo de donde se encuentre el index.js
const __dirname = path.resolve();
const songsFilePath = path.join(__dirname, "canciones.json");

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({message: "Algo salio mal: internal server error"});
});

// get method
app.get("/", (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } catch (err) {
    next(err);
  }
});

app.get("/canciones", async (req, res, next) => {
  try {
    const songs = await readFile(songsFilePath, "utf-8");

    res.json(JSON.parse(songs));
  } catch (err) {
    next(err);
  }
});

// post method

app.post("/canciones", async (req, res, next) => {
  try {
    const newSong = req.body;
    if (
      newSong.titulo.trim() === "" ||
      newSong.artista.trim() === "" ||
      newSong.tono.trim() === ""
    ) {
      res.status(400).json({message: "Faltan datos"});
      return;
    }
    const songs = await readFile(songsFilePath, "utf-8");
    const songsArray = JSON.parse(songs);
    // validacion para que no manden string vacios
    songsArray.push(newSong);
    await writeFile(songsFilePath, JSON.stringify(songsArray));
    res.status(201).json(songsArray);

  } catch (err) {
    
    next(err);
  }
});

// delete method

app.delete("/canciones/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const songs = await readFile(songsFilePath, "utf-8");
    const songsArray = JSON.parse(songs);
    const newSongsArray = songsArray.filter((song) => song.id !== parseInt(id));
    await writeFile(songsFilePath, JSON.stringify(newSongsArray));
    res.json(newSongsArray);
  } catch (err) {
    next(err);
  }
});

// put method

app.put("/canciones/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const {titulo, artista, tono} = req.body;
    if (titulo.trim() === "" || artista.trim() === "" || tono.trim() === "") {
      res.status(400).json({message: "Faltan datos"});
      return;
    }

    const songs = await readFile(songsFilePath, "utf-8");
    const songsArray = JSON.parse(songs);
    const newSongsArray = songsArray.map((song) => {
      if (song.id === parseInt(id)) {
        return {...song, titulo, artista, tono};
      }
      return song;
    });
    await writeFile(songsFilePath, JSON.stringify(newSongsArray));
    res.status(201).json(newSongsArray);

  } catch (err) {
    next(err);
  }
});
