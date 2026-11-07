const express = require("express");
const cors = require("cors");

const app = express();

const pool = require("./config/db");
console.log("Pool type:",typeof pool);
console.log("Pool query:", typeof pool.query);

//Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health",(req,res)=>{
    res.status(200).json({
        success: true,
        message: "Api is running"
    })
})

// DB health check
app.get("/api/db-health",async (req,res)=>{
    try{
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            success:true,
            message: "Database connection successful",
            databaseTime: result.row[0].now
        });
    }catch(error){
        console.log("Database connection failed:",error.message);

        res.status(500).json({
            success:false,
            message: "Database connection failed"
        });
    }
});

module.exports = app;