
export async function smartcontracterr(err) {
  // console.log("err--", err)
  let msg = err.toString().split(':')
  if (msg) {
  
    let errorObj = {}
    let ermsg = msg[msg.length - 1]

    var el = msg.find(a => a.includes('FetchError') || a.includes('ECONNREFUSED'))
    var keyexist = msg.find(a => a.includes('uniqueness constraint was violated'))
    var cpulimit = msg.find(a => a.includes('leeway on account CPU limits') || a.includes('transaction was unable to complete by deadline'))
    var billed_cpulimit = msg.find(
      a => a.includes('billed CPU time') || a.includes('greater than the maximum billable CPU time for the transaction'),
    )
    var vaccnotfound = msg.find(a => a.includes('vaccount not found'))
    var noamttransferred = msg.find(a => a.includes('No amount was transferred by vaccount user') || a.includes('Initial amount not transferred by vaccount user'))
    var amtleasedout = msg.find(a => a.includes('can not withdraw. amount leased out'))
    var alreadyreg = msg.find(a => a.includes('Account already registered'))
    var ordernotfound = msg.find(a => a.includes('Order id not found'))
    var orderactive = msg.find(a => a.includes('can not withdraw. order is active and filled'))
    var orderstatnotfound = msg.find(a => a.includes('Order status id not found'))
    var ordernotexp = msg.find(a => a.includes('Order not expired yet'))

    
    if (el) ermsg = 'econnrefused'
    if (keyexist) ermsg = ' key already exists'
    if (cpulimit) ermsg = ' transaction exceeded the current network usage limit imposed on the transaction'
    if (billed_cpulimit) ermsg = ' transaction exceeded billed cpu time'

    if (vaccnotfound) ermsg = 'vaccount not found'
    if (noamttransferred) ermsg = 'No amount was transferred by vaccount user'
    if (amtleasedout) ermsg = 'can not withdraw. amount leased out'
    if (alreadyreg) ermsg = 'Account already registered'
    if (ordernotfound) ermsg = 'Order id not found'
    if (orderactive) ermsg = 'can not withdraw. order is active and filled'
    if (orderstatnotfound) ermsg = 'Order status id not found'
    if (ordernotexp) ermsg = 'Order not expired yet'

    errorObj.message = ermsg
    return errorObj
  }
  else {
    errorObj.message = 'Error in processing request'
    return errorObj
  }
}

