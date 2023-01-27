const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 8000;
app.use(express.json());
app.use(express.urlencoded());

//press authorize button to start request
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname) + '/zoomtest.html')
})


//single endpoint for Oauth Requests
app.get('/success', async (req,res)=>{
        //console.log(req.query.code)
        //user authentication token
        const accessToken = req.query.code
        //axios configuration
        var config ={
            method: 'post',
            url: 'https://zoom.us/oauth/token',
            headers:{
                //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
                'Authorization' :'Basic ' + 'dFB2djVtNG9RTEtaVkp5OXhHbHgyQTp1Z3YyQnV0YkhrdjJ5ZHBxN1YydGlIUFB0NHhDblJ5OA==',
                'content-type' : 'application/x-www-form-urlencoded'
            },
            data:{
                "code": accessToken,
                "grant_type": "authorization_code",
                "redirect_uri": "http://localhost:8000/success",
            }
        }

        //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
        var result = await axios(config).then(res =>{
            console.log(res.data)
        }).catch(err =>{
            console.log(err.data)
        })
        
        res.redirect('/')
    
})

app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
})