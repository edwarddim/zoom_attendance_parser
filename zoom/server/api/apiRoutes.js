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
    //get list of meetings for a user
    app.post('/meetings/:userId', async (req,res)=>{
        //console.log('resquesting meetings for userId',req.params.userId)
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        var config ={
            method: 'get',
            url: 'https://zoom.us/v2/users/'+req.params.userId+'/meetings?page_size=300',
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


    //get details of a specific meeting
    app.post('/meeting/:meetingId', async (req,res)=>{
        //console.log('resquesting meeting details',req.params.meetingId)
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        var config ={
            method: 'get',
            url: 'https://zoom.us/v2/past_meetings/'+req.params.meetingId+'/instances?page_size=300',
            headers:{
                //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
                'Authorization' :'Bearer ' + req.session['access_token'],
            },
            
        }
        var details ={}
        
        var result = await axios(config).then(data =>{
            //console.log(data.data)
            details = data.data;
            res.json({occurrences:details.meetings})
        }).catch(err =>{
            console.log(err.data)
        })
        //console.log('result is',result)
    })

    //fetch participants list

    app.post('/part/:meetingId', async (req,res)=>{
        // if(!checkRefresh(req)){
        //     req.session.authorized = false;
        //     res.json({'error':'authenticate'})
        //     return
        // }
        //console.log('parts id',req.params.meetingId);
        var config ={
            method: 'get',
            url: `https://zoom.us/v2/past_meetings/${req.params.meetingId}/participants?page_size=300`,
            headers:{
                //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
                'Authorization' :'Bearer ' + req.session['access_token'],
            },
            
        }

        let participants = [];
        var result = await axios(config).then(async data =>{
            let next_page_token = data.data.next_page_token
            //data.data = {page_count: 1, page_size: 300, total_records: 155, next_page_token: '', participants: Array(155)}
            //console.log('data'+data.data)
            data.data.participants.forEach(participant =>{
                participants.push(participant)
            })
            while(data.data.total_records > participants.length){
                config.url=`https://zoom.us/v2/report/meetings/${req.params.meetingId}/participants?page_size=300&next_page_token=${next_page_token}`;
                //console.log(config);
                var next = await axios(config).then(moreData =>{
                    //console.log('moredata',moreData);
                    next_page_token = moreData.data.next_page_token
                    participants = participants.concat(moreData.data.participants)
                })
            }
            res.json({'participants':participants})
        }).catch(err =>{
            console.log('err' + err)
        })
    })


    app.get('/logout', (req,res)=>{
        req.session.destroy()
        res.redirect('/')
    })
}