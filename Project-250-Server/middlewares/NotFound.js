

const NotFound = (req,res)=>{
    res.json(404).json({Message: "Not Found"});
}

module.exports = NotFound;