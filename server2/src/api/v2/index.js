
import leaseRouter from './leaseservice/lease.routes'

export default (app)=>{
    console.log("initiallizing routes")
    app.use('/api/v1/',leaseRouter)
    
    
}
