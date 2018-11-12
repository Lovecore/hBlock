var express = require('express')
var app = express()

//create api endpoints
app.get('blockchain', function(req, res) {

})

app.get('/transaction', function(req, res ) {

})

app.get('/mine', function(req,res) {

})

 
app.listen(3000, function() {
    console.log('Listening on port 3000...'); //let me know the port is ready cause im dumb
})