const express = require('express')
const app = express()
app.use(express.json())
require('dotenv').config()


function checkAccess(req,res,next){
    const accessKey = req.headers["x-access-key"]
    const adminKey = process.env.ADMIN_ACCESS_KEY

    if(!adminKey || accessKey !== adminKey){
        return res.status(401).json({
            message:"Access denied"
        })
    }
    next()
}

app.get("/admin", checkAccess, (req, res) => {
    res.json({ message: "Welcome to the admin area" })
})

app.get("/test-error", (req, res, next) => {
    const error = new Error("Something went wrong!")
    next(error)
})

const usersRouter = require('./routes/users')
app.use('/users',usersRouter)
app.get("/",(req,res)=>{
    res.send("Hello from express")
})

app.get("/products",(req,res)=>{
    res.send("List of products")
})

app.use((err,req,res,next)=>{
    console.log(err.message)
    res.status(500).json({
        
  "message": "Internal server error"

    })
})

module.exports = app