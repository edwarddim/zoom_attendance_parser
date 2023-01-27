const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 8000;
app.use(express.json());
app.use(express.urlencoded());


app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname) + '/zoomtest.html')
})

app.get('/success', async (req,res)=>{
        console.log(req.query.code)
        const accessToken = req.query.code

        var config ={
            method: 'post',
            url: 'https://zoom.us/oauth/token',
            headers:{
                'Authorization' :'Basic ' + 'dFB2djVtNG9RTEtaVkp5OXhHbHgyQTp1Z3YyQnV0YkhrdjJ5ZHBxN1YydGlIUFB0NHhDblJ5OA==',
                'content-type' : 'application/x-www-form-urlencoded'
            },
            data:{
                "code": accessToken,
                "grant_type": "authorization_code",
                "redirect_uri": "http://localhost:8000/success",
            }
        }

        // axios.post({
        //     headers:{'Authorization' : 'Basic ' + 'ugv2ButbHkv2ydpq7V2tiHPPt4xCnRy8', 'content-type' : 'application/x-www-form-urlencoded'},
        //     url: 'https://zoom.us/oauth/token',
        //     body:{
        //         "code": accessToken,
        //         "grant_type": "authorization_code",
        //         "redirect_uri": "https://localhost:8000/access",
        //         },
        //     json:true
        //     },
        //         function(error,response,body){
        //             //console.log('error' + error)
        //             //console.log('response' + response)
        //             console.log('body' + JSON.stringify(body))
        //         })
        //     res.redirect('/')
        
        var result = await axios(config).then(res =>{
            console.log(res)
        }).catch(err =>{
            console.log(err)
        })
        
        res.redirect('/')
    
})

app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
})