const express = require('express')
const router = express.Router()
const users = require('../data/users')
const validateUser = require('../middleware/validateUser')
const validateUserid = require('../middleware/validateUserId')
router.get("/",(req,res)=>{
    const age = req.query.age
    if(age===undefined){
        res.json(users)
        return
    }
    if(age.trim()==="" || Number(age)<=0 || !Number.isInteger(Number(age))){
        res.status(400).send("Invalid user age")
        return
    }
    const data = users.filter(user=>Number(age)===user.age)
    res.json(data)
})

router.get("/:id",validateUserid,(req,res)=>{   
    res.status(200).json(req.user)
})

router.post("/",validateUser,(req,res)=>{
    const name = req.body.name
    const age = req.body.age
    
    //to generte an ID 
    const idMap = users.map(user => user.id)
    let id = Math.max(...idMap)

    if (id === -Infinity) {
        id = 1
    } else {
        id = id + 1
    }
    
    const user = {
        id:id,
        name:name.trim(),
        age:age
    }

    users.push(user)

    
    res.status(201).json(user)
})

router.put("/:id",validateUserid,validateUser, (req,res)=>{
    const user = req.user
    user.name = req.body.name.trim()
    user.age = req.body.age

    res.status(200).json(user)

})

router.delete("/:id",validateUserid,(req,res)=>{
    const id = req.user.id
    const index = users.findIndex(user=>user.id===id)
    
    users.splice(index,1)
    res.status(200).send(`User with id ${id} deleted succesfully`)

    

    
})


module.exports = router
