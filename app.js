const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const startServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

startServerAndDB()

//API1 for list of all moviesName
app.get('/movies/', async (request, response) => {
  const getMovieNameQuery = `
    select movie_name 
    from movie
  `
  const dbResponse = await db.all(getMovieNameQuery)

  const snakeToCamel = eachItem => {
    return {
      movieName: eachItem.movie_name,
    }
  }

  response.send(dbResponse.map(eachItem => snakeToCamel(eachItem)))
})

//API2 for creating new movie
app.post('/movies/', async (request, response) => {
  console.log(request.body)
  //ERROR : request.body undefined
  const {directorId, movieName, leadActor} = request.body

  const addMovieQuery = `
    insert into 
      movie(director_id, movie_name, lead_actor)
    values 
      ('${directorId}', '${movieName}', '${leadActor}',)
  `

  const dbResponse = await db.run(addMovieQuery)
  console.log(dbResponse.lastID)
  response.send('Movie Successfully Added')
})

//API3 for getting movie details
app.get('/movies/:movieId/', async (request, response) => {
  const movieId = request.params
  // ERROR : dbResponse undefined
  const movieDetailsQuery = `
    SELECT movie_id, director_id, movie_name, lead_actor
    FROM movie
    WHERE movie_id = '${movieId}'
    `
  const snakeToCamel = movieDetails => {
    return {
      movieId: movieDetails.movie_id,
      directorId: movieDetails.director_id,
      movieName: movieDetails.movie_name,
      leadActor: movieDetails.lead_actor,
    }
  }

  const dbResponse = await db.all(movieDetailsQuery)
  console.log(dbResponse)
  response.send(snakeToCamel(dbResponse))
})

//API4 for changing movie details
app.put('/movies/:movieId/', async (request, response) => {
  console.log(request.params, request.body)
  // ERROR : request.body undefined
  const movieId = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
    UPDATE movie
    SET 
      director_id = '${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}',
  `
  await db.run(updateMovieQuery)
  response.send('Movie Detials Updated')
})

//API5 for deleting movie
app.delete('/movies/:movieId/', async (request, response) => {
  const movieId = request.params
  const movieDeleteQuery = `
    DELETE FROM movie
    WHERE movie_id = '${movieId}'
  `
  await db.run(movieDeleteQuery)
  response.send('Movie Removed')
})

//API6 for getting directors Detail
app.get('/directors/', async (request, response) => {
  const directorsDetailQuery = `
    SELECT *
    FROM director
    `
  const snakeToCamel = directorDetail => {
    return {
      directorId: directorDetail.director_id,
      directorName: directorDetail.director_name,
    }
  }
  const dbResponse = await db.all(directorsDetailQuery)
  response.send(dbResponse.map(eachItem => snakeToCamel(eachItem)))
})

//API7 for getting movieName by directorId
app.get('/directors/:directorId/movies/', async (request, response) => {
  const directorId = request.params
  // ERROR : Empty Query result
  const moviesNameQuery = `
  SELECT movie_name FROM movie
  WHERE director_id = '${directorId}'
  `
  const snakeToCamel = movieName => {
    return {
      movieName: movieName.movie_name,
    }
  }

  const dbResponse = await db.all(moviesNameQuery)
  console.log(dbResponse)
  const moviesName = dbResponse.map(eachItem => snakeToCamel(eachItem))
  response.send(moviesName)
})
