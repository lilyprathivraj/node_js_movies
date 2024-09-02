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

//API for list of all movieNames
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

//API for creating new movie
app.post('/movies/', async (request, response) => {
  console.log(request.body)
  //const {directorId, movieName, leadActor} = request.body
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
