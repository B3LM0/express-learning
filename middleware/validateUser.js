function validateUser(req,res,next){
    const {name, age} = req.body
    if(typeof name !== "string"){
        return res.status(400).json({
            "message":"Name must be a string"
        })
        
    }
    if(name.trim()===""){
        return res.status(400).json({
            "message":"Name should not be empty"
        })
        
    }
    if(!Number.isInteger(age)){
        return res.status(400).json({
            "message":"Age must be an integer"
        })
        
    }
    if(age<=0){
        return res.status(400).json({
            "message":"Age must be positive"
        })
        
    }

    next()

}

module.exports = validateUser