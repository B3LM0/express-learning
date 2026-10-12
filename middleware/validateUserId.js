const users = require('../data/users')


function validateUserid(req,res,next){
    const id = Number(req.params.id)

    if(!Number.isInteger(id)||id<=0){
        return res.status(400).json({
            "message":"Id is invalid"
        })}

    const user = users.find(user=>user.id===id)
    if(!user){
         return res.status(404).json({
            "message":"User not found"
        })
    }
     req.user = user
     next()
    
}

module.exports = validateUserid