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

// get method
app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } catch (error) {
    console.log(error);
  }
});

app.get("/canciones", async (req, res) => {
  try {
    const songs = await readFile(songsFilePath, "utf-8");

    res.json(JSON.parse(songs));
  } catch (error) {
    console.log(error);
  }
});

// post method

app.post("/canciones", async (req, res) => {
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

  } catch (error) {
    
    console.log(error);
  }
});

// delete method

app.delete("/canciones/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const songs = await readFile(songsFilePath, "utf-8");
    const songsArray = JSON.parse(songs);
    const newSongsArray = songsArray.filter((song) => song.id !== parseInt(id));
    await writeFile(songsFilePath, JSON.stringify(newSongsArray));
    res.json(newSongsArray);
  } catch (error) {
    console.log(error);
  }
});

// put method

app.put("/canciones/:id", async (req, res) => {
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
  } catch (error) {
    console.log(error);
  }
});
