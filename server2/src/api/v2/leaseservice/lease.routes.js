import express from 'express'
import leaseController from './lease.controller'

const router = express.Router()

router.get('/create', (req, res) => {
    leaseController.create(req, res)
})
router.post('/register_user', (req, res) => {
    leaseController.register_user(req, res)
})
router.post('/create_order', (req, res) => {
    leaseController.create_order(req, res)
})

router.post("/lease_transfer", (req, res) => {
    leaseController.lease_transfer(req, res)
})
router.post("/match_order", (req, res) => {
    leaseController.match_order(req, res)
})

router.post("/withdraw", (req, res) => {
    leaseController.withdraw(req, res)
})
router.post("/cancelorder", (req, res) => {
    leaseController.cancelorder(req, res)
})

router.post("/leaseunstake", (req, res) => {
    leaseController.leaseunstake(req, res)
})

router.get('/get_orderdet/:authorizer', (req, res) => {
    leaseController.get_orderdet(req, res)
  })
  
  router.get('/get_orderstatdet', (req, res) => {
    leaseController.get_orderstatdet(req, res)
  })

  router.get('/get_orderstatdet_byaccount/:account_name', (req, res) => {
    leaseController.get_orderstatdet_byaccount(req, res)
  })
  
  router.get('/get_accountblc/:vaccount', (req, res) => {
    leaseController.get_accountblc(req, res)
  })
  


export default router;