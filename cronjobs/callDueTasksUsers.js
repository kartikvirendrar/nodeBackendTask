const Task = require("../models/taskModel");
const User = require("../models/userModel");

const callUserTasksUsers = async () => {
    try {
        const tasks = await Task.getAllTasks();
        tasks.forEach(async (task) => {
            const today = new Date();
            const dueDate = new Date(task.due_date);
            const timeDiff = dueDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const callMap = new Map();
            if (daysDiff < 0) {
                task.users.map((user) => {
                    const data = User.getUserById(user);
                    callMap.set(data.priority, data.phone_number);
                })
                let current = 0;
                while (current <= 2) {
                    if (callMap.get(current) !== undefined) {
                        const accountSid = process.env.TWILIO_ACCOUNT_SID;
                        const authToken = process.env.TWILIO_AUTH_TOKEN;
                        const client = require('twilio')(accountSid, authToken);
                        const response = await client.calls.create({
                            url: 'http://demo.twilio.com/docs/voice.xml',
                            to: callMap.get(0),
                            from: process.env.TWILIO_PHONE_NUMBER,
                            statusCallback: "http://127.0.0.1:8000/call/completed",
                            statusCallbackEvent: ["completed"],
                            statusCallbackMethod: 'POST',
                            twiml: `<Response><Say>Hello User, Your task with task id ${task.id} has passed its due date.</Say></Response>`,
                        });
                        console.log(response);
                        if( response.status === "completed" && response.duration > 0){
                            break;
                        }
                    }
                    current++;
                }
            }
        });
        console.log('Calling users for overdue tasks successfull.');
    } catch (error) {
        console.error('Error calling:', error);
    }
};

module.exports = { callUserTasksUsers };