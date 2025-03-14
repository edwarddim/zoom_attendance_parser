const path = require('path');
const axios = require('axios');

module.exports = {
    //login function for zoom api for Oauth Requests
    //user : Z1J0bnRkZHpUWldSRFBwZUUwM3VMQTpPaGtYMjE4b2J2M1Q4b3pPWXBWWWFKU1BVTEJ5aTcyWg==
    //admin : dFB2djVtNG9RTEtaVkp5OXhHbHgyQTp1Z3YyQnV0YkhrdjJ5ZHBxN1YydGlIUFB0NHhDblJ5OA==
    //sets session values 'authorized, admin, access_token, refresh_token' then redirects to page
    'loginCB': async (req,res,isAdmin)=>{
        const accessToken = req.query.code

        var config ={
            method: 'post',
            url: 'https://zoom.us/oauth/token',
            headers:{
                //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
                'Authorization' :isAdmin?"Basic dFB2djVtNG9RTEtaVkp5OXhHbHgyQTp1Z3YyQnV0YkhrdjJ5ZHBxN1YydGlIUFB0NHhDblJ5OA==":"Basic Z1J0bnRkZHpUWldSRFBwZUUwM3VMQTpPaGtYMjE4b2J2M1Q4b3pPWXBWWWFKU1BVTEJ5aTcyWg==",
                'content-type' : 'application/x-www-form-urlencoded'
            },
            data:{
                "code": accessToken,
                "grant_type": "authorization_code",
                "redirect_uri": isAdmin?"http://localhost:8000/success":"http://localhost:8000/instructorsuccess",
            }
        }
        //console.log('config',config)
        //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
        var result = await axios(config)
        .then(res =>{
            //console.log(res.data);
            req.session['authorized'] = true;
            req.session['admin'] = isAdmin;
            req.session['access_token'] = res.data.access_token
            req.session['refresh_token'] = res.data.refresh_token
            req.session['refresh'] = new Date().getTime()+1800000
            req.session['expires'] = new Date().getTime()+3599000
            //console.log(req.session['expires'])
        }).catch(err =>{
            //console.log(req.session)
            console.log(err);
            req.session['authorized'] = false;
        })
        
        res.redirect('/page');
    },
    //function to get list of zoom account users
    //responds with JSON {'users':[{userdata},...]}
    'getUsers': async(req,res)=>{
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
        var result = await axios(config)
        .then(async data =>{
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
    },
    //function to get single users zoom account
    //responds with JSON {'user':{userdata}}
    'getUser': async(req,res)=>{
        var config ={
            method: 'get',
            url: 'https://zoom.us/v2/users/me',
            headers:{
                //"Basic " plus Base64-encoded clientID:clientSECRET from https://www.base64encode.org/
                'Authorization' :'Bearer ' + req.session['access_token'],
            },
            
        }

        //axios request => res.data = {access_token: ... , token_type: ..., refresh_token: ..., expires_in: ..., scope: ...}
        
        var result = await axios(config)
        .then(async data =>{
            //console.log('data',Object.keys(data.data));
            
            userData = (data.data);
            //console.log('after userData');
                res.json({'user':userData});
            //console.log(userData);
        }).catch(err =>{
            console.log(err.data)
        })
    },
    //function to get single users list of meetings
    //responds with JSON {'meetings':[{meetingdata}...]}
    'getMeetingsForUser':async(req,res)=>{
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
    },
    //function to get details for single reoccuring meeting
    //responds with JSON {'occurrences':[{meetingDetails}...]}
    'getMeetingOccurrences':async(req,res)=>{
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
    },
    //function to get list of partcipants for a single meeting
    //responds with JSON {'participants':[{participantDetails}...]}
    'getMeetingParticipants':async(req,res)=>{
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
                config.url=`https://zoom.us/v2/past_meetings/${req.params.meetingId}/participants?page_size=300&next_page_token=${next_page_token}`;
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
    }

}