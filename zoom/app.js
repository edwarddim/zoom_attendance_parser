const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
var session = require('express-session')
const path = require('path');
const app = express();
const port = 8000;
app.use(cookieParser());
app.use(session({secret: "I solemnly swear i am upto no good!"}))
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('static'))


//temp user var
//press authorize button to start request
app.get('/', (req,res)=>{
    if(req.session['authorized']){

    }
    res.sendFile(path.join(__dirname) + '/zoomtest.html')
})

app.get('/page', (req,res)=>{
    if(!req.session['authorized']){
        res.redirect('/')
    }

    res.sendFile(path.join(__dirname) + '/page.html')
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
            //console.log(res.data);
            req.session['authorized'] = true;
            req.session['access_token'] = res.data.access_token
            req.session['refresh_token'] = res.data.refresh_token
            req.session['expires'] = new Date().getTime()+3599000
            console.log(req.session['expires'])
        }).catch(err =>{
            console.log(err.data);
            req.session['authorized'] = false;
        })
        
        res.redirect('/page');
})

app.post('/users', async (req,res)=>{
    var config ={
        method: 'get',
        url: 'https://zoom.us/v2/users?page_size=300',
        headers:{
            //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
            'Authorization' :'Bearer ' + req.session['access_token'],
        },
        
    }

    //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
    let userData = []
    var result = await axios(config).then(async data =>{
        //console.log('data',Object.keys(data.data));
        
        userData = (data.data.users);
        //console.log('after userData');
        config.url+='&next_page_token='+data.data.next_page_token;
        //console.log(config);
        var next = await axios(config).then(moreData =>{
            //console.log('moredata',moreData);
            userData = userData.concat(moreData.data.users)
            res.json({'users':userData});
        })
        //console.log(userData);
    }).catch(err =>{
        console.log(err.data)
    })
})
//get list of meetings for a user
app.post('/meetings/:userId', async (req,res)=>{
    console.log('resquesting meetings for userId',req.params.userId)
    var config ={
        method: 'get',
        url: 'https://zoom.us/v2/users/'+req.params.userId+'/meetings',
        headers:{
            //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
            'Authorization' :'Bearer ' + req.session['access_token'],
        },
        
    }
    var meetings =[]
    //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
    var result = await axios(config).then(data =>{
        //console.log(data.data)
        meetings = data.data.meetings;
        res.json({meetings:meetings})
    }).catch(err =>{
        console.log(err.data)
    })
    //console.log('result is',result)
})
app.post('/part', async (req,res)=>{
    var config ={
        method: 'get',
        url: 'https://zoom.us/v2/report/meetings/83190389871/participants',
        headers:{
            //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
            'Authorization' :'Bearer ' + req.session['access_token'],
        },
        
    }

    //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
    var result = await axios(config).then(res =>{
        console.log('data'+JSON.stringify(res.data))
    }).catch(err =>{
        console.log('err' + err)
    })
})


//get details of a specific meeting
app.post('/meeting/:meetingId', async (req,res)=>{
    console.log('resquesting meeting details',req.params.meetingId)
    var config ={
        method: 'get',
        url: 'https://zoom.us/v2/past_meetings/'+req.params.meetingId+'/instances',
        headers:{
            //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
            'Authorization' :'Bearer ' + req.session['access_token'],
        },
        
    }
    var details ={}
    //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
    var result = await axios(config).then(data =>{
        console.log(data.data)
        details = data.data;
        res.json({occurrences:details.meetings})
    }).catch(err =>{
        console.log(err.data)
    })
    //console.log('result is',result)
})



app.post('/part/:meetingId', async (req,res)=>{
    console.log('parts id',req.params.meetingId);
    var config ={
        method: 'get',
        url: `https://zoom.us/v2/report/meetings/${req.params.meetingId}/participants`,
        headers:{
            //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
            'Authorization' :'Bearer ' + req.session['access_token'],
        },
        
    }

    //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
    var result = await axios(config).then(data =>{
        console.log('data'+data.data)
        res.json(data.data)
    }).catch(err =>{
        console.log('err' + err)
    })
})

//get occurence uuid from meeting id and occurence id

app.post('/occurrence/:meetingId/:occurrenceId',async (req,res)=>{
    console.log('getting occurence uuid',req.params.meetingId,req.params.occurrenceId);
    var config ={
        method: 'get',
        url: `https://zoom.us/v2/meetings/${req.params.meetingId}/?occurrence_id=${req.params.occurrenceId}`,
        headers:{
            //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
            'Authorization' :'Bearer ' + req.session['access_token'],
        },
        
    }

    //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
    var result = await axios(config).then(data =>{
        console.log('uuid',(data.data.uuid))
        res.json({uuid:data.data.uuid})
    }).catch(err =>{
        console.log('err' + err)
    })
})


app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
})



