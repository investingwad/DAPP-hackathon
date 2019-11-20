import mongoose, { mongo } from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

//require('now-env')

console.log("db starting-----")


//mongoose.connect("mongodb+srv://malagath:qwerty123?@cluster0-7eftm.mongodb.net/Waitlist?retryWrites=true",{ useNewUrlParser: true });
const connectWithRetry = () => {
        return mongoose.connect("mongodb://localhost:27017/leaseservice", { useNewUrlParser: true })
}

mongoose.connection.on('connected', () => {
    console.log("mongodb database connected successfully")
})

mongoose.connection.on('error', (error) => {
    console.log("error connecting to the database", error)
    setTimeout(connectWithRetry, 5000)
})

const connect = () => {
    connectWithRetry()
}

export default (callback) => {
    connect()
    callback({

    })

}
