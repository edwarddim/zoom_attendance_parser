const path = require('path');
const axios = require('axios');
const apiController = require('./apiController')

module.exports = (app)=>{
    //callback route for zoom api for instructor Oauth Requests
    app.get('/instructorsuccess', async (req,res)=>{
        console.log('instructor login')
        apiController.loginCB(req,res,false);
    })
    //callback route for zoom api for admin Oauth Requests
    app.get('/success', async (req,res)=>{
        console.log('admin login')
        apiController.loginCB(req,res,true);
    })


    

    const refreshToken = async (req,now) => {
        var config ={
            method: 'post',
            url: 'https://zoom.us/oauth/token',
            headers:{
                //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
                'Authorization' :'Basic ' + 'dFB2djVtNG9RTEtaVkp5OXhHbHgyQTp1Z3YyQnV0YkhrdjJ5ZHBxN1YydGlIUFB0NHhDblJ5OA==',
                'content-type' : 'application/x-www-form-urlencoded'
            },
            data:{
                "grant_type": "refresh_token",
                "refresh_token": req.session['refresh_token'],
            }
        }

        var result = await axios(config)
            .then(res =>{
                //console.log('res',res.data, req.session)
                req.session['access_token'] = res.data.access_token
                req.session['refresh_token'] = res.data.refresh_token
                req.session['refresh'] = now +1800000
                req.session['expires'] = now +3599000
                return true
            }).catch(err =>{
                console.log('error',err);
                req.session['authorized'] = false;
                return false
            })
    }
    //admin route to retrieve list of users
    app.post('/users', async (req,res)=>{
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        apiController.getUsers(req,res)
    })
    //instructor route to retrieve own data
    app.post('/user', async (req,res)=>{
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        apiController.getUser(req,res);
    })
    //admin route to retrieve list of meetings for a specific user
    app.post('/meetings/:userId', async (req,res)=>{
        //console.log('resquesting meetings for userId',req.params.userId)
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        apiController.getMeetingsForUser(req,res);
    })


    //route to get occurrences of a specific meeting
    app.post('/meeting/:meetingId', async (req,res)=>{
        //console.log('resquesting meeting details',req.params.meetingId)
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        apiController.getMeetingOccurrences(req,res);
    })

    //fetch participants list

    app.post('/part/:meetingId', async (req,res)=>{
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        //console.log('parts id',req.params.meetingId);
        apiController.getMeetingParticipants(req,res);
    })


    app.get('/logout', (req,res)=>{
        req.session.destroy()
        res.redirect('/')
    })
}