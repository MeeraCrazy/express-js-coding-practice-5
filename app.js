const express = require('express')
const app = express()
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Success')
    })
  } catch (e) {
    console.log(`DB ERROR ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertMovieTableResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorTableResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//API 1: GET MOVIES IN MOVIE_NAME

app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
    SELECT 
     movie_name

    FROM
    movie;
    `

  const movieNameList = await db.all(getMovieQuery)

  response.send(
    movieNameList.map(eachFilm => ({
      movieName: eachFilm.movie_name,
    })),
  )
})

//API 2: GET  MOVIE  BASED ON ID

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getIdMovieQuery = `
  SELECT 
  *
  FROM 
  movie
  WHERE 
  movie_id = ${movieId};
  `

  const movieInformation = await db.get(getIdMovieQuery)
  response.send(convertMovieTableResponseObject(movieInformation))
})

//API 3: PUT MOVIE

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body

  const updateMovieQuery = `
  UPDATE movie
  SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE 
   movie_id = ${movieId};
  `

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// API 4:  DELETE MOVIE

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
  movie
  WHERE
  movie_id = ${movieId};
  
  `

  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//API 5: GET DIRECTOR

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT *
  FROM
  director;
  `

  const directorList = await db.all(getDirectorsQuery)
  response.send(
    directorList.map(eachdirector =>
      convertDirectorTableResponseObject(eachdirector),
    ),
  )
})

//API 6: GET DIRECTOR MOVIE

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
  SELECT

  movie_name

  FROM

  movie

  WHERE

  director_id = '${directorId}';

  `

  const directorMovie = await db.all(getDirectorMovieQuery)
  response.send(
    directorMovie.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})

//API 7: POST MOVIE

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const addMovieQuery = `
  
  INSERT INTO

  movie (director_id,movie_name,lead_actor)

  VALUES
    (
      ${directorId},
      '${movieName}',
      '${leadActor}'
    );
  `

  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})
module.exports = app
