const  checkRefresh = async (req) => {
    //console.log(req.session['expires'], new Date().getTime())
    let now = new Date().getTime()
    if(req.session['expires'] < now){
        return false
    }else if(req.session['refresh'] < now){
        //console.log('checking refresh',req.session)
        //console.log('after refresh', req.session)
        res = await refreshToken(req, now)
        return res
    }else{
        return true
    }
}

module.exports = (app)=>{
    app.get('/', (req,res)=>{
        if(req.session['authorized']){
            res.redirect('/page')
        }else {res.render('authorize')}
        
    })
    
    app.get('/page', (req,res)=>{
        if(!req.session['authorized']){
            res.redirect('/')
        }else { 
            if(checkRefresh(req)){
                //console.log('about to render',req.session)
                req.session['admin']?res.render('admin'):res.render('attendance')
            }else{
                req.session['authorized'] = false;
                res.redirect('/')
            }
        }
    })
}