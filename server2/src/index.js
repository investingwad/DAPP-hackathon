import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import config from './config.json'
import initializedb from './db'
import routes from './api/v2'
// import autoIncrement from 'mongoose-auto-increment'
//export const autoIncrement = require('mongoose-auto-increment'); // import


let app = express()
// app.server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(cors());
app.use(morgan('dev'))
app.use(compression())

initializedb( cb => {})

app.get('/',(req,res)=>{
	// res.status(200).send("Equastart API")
	res.json({
		version: '1.0.0'
	})
})
routes(app);
app.listen(8081)
export default app
