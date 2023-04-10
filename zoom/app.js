const express = require('express');
const app = express();
const {port,applyConfiguration} = require('./server/config');
applyConfiguration(app)
require('./server/webRoutes')(app)
require('./server/api/apiRoutes')(app)
app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
})