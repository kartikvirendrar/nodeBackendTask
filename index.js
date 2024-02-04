const express =require('express');
const morgan =require('morgan');
const bodyParser =require('body-parser');
const cors =require('cors');
const cron =require('node-cron');
require('dotenv').config();
const {readdirSync} = require("fs");
const cookieParser = require('cookie-parser');
const authenticateUser = require('./middleware/authenticateUser');
const { updateTaskPriority } = require('./cronjobs/updateTaskPriority');
const { callUserTasksUsers } = require('./cronjobs/callDueTasksUsers');
const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json({limit:"50mb"}));
app.use(cors());
app.use(cookieParser());

cron.schedule('0 0 * * *', () => {
    updateTaskPriority();
    callUserTasksUsers();
});

readdirSync("./routes").map((r)=> app.use("/", authenticateUser, require("./routes/"+r)));

const port=process.env.PORT || 8000;
app.listen(port,()=>console.log(`Server is running on port ${port}`));