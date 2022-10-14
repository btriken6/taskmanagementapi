const { response } = require('express');
const express = require('express');
const app= express();
const bodyParser=require('body-parser')
const mongoose = require('mongoose');
const port =process.env.PORT || 3005
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb+srv://btriken8:Triken12@cluster0.eei0ody.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log('connected')
}).catch((error)=>{
    console.log(error)
})
const Uschema = mongoose.Schema({
    name: String,
    email:String,
    pendingTasks:[{type: String}],
    dateCreated: {
        type:Date,
        default:Date.now()
    }
})

const TasksSchema = mongoose.Schema({
    name:String,
    description:String,
    deadline:Date,
    completed:{
        type:Boolean,
        default:true
    },
    assignedUser:{
        type:String,
        default:""
    },
    assignedUserName:{
        type:String,
        default:"unassigned"
    },
    dateCreated:{
        type:Date,
        default:Date.now()
    }
})

const Users = new mongoose.model('users',Uschema)
const Tasks = new mongoose.model('tasks',TasksSchema)


app.use(express.json())


//CREATE NEW USER
app.post('/api/users', async(req,res)=>{
    if(!req.body.email=="" && !req.body.name==""){
        const findEmail=await Users.find({'email':req.body.email})
        console.log(findEmail)
        if(findEmail.length==0){
            try {

                const Upeople = new Users(req.body)
                const data = await Upeople.save()
                res.status(201).json({ message: "ok", data })

            }
            catch (error) {
                res.status(500).json({message:"Server Error"})
            }
        }
        else{
            res.status(500).json({message:"User already exists"})
        }

    }
    else{
        res.status(500).json({message:"Please enter email and name"})
    }
})


//CREATE NEW TASK
app.post('/api/tasks', async(req,res)=>{

    if(!req.body.name=="" && !req.body.deadline==""){
            try {

                const taskData = new Tasks(req.body)
                const data = await taskData.save()
                res.status(201).json({ message: "ok", data })

            }
            catch (error) {
                res.status(500).json({message:"Invalid Deadline Input"} )
            }


    }
    else{
        res.status(500).json({message:"Please enter deadline and name"})
    }
})

//GET USERS
app.get('/api/users',async(req,res)=>{
    try{
        await Users.find((eval("(" + req.query.where + ")")))
        .select(eval("("+req.query.select+")"))
        .sort(eval( "("+req.query.sort+" )"))
        .skip(eval( "("+req.query.skip+" )"))
        .limit(eval( "("+req.query.limit+" )"))
        .exec((error, data) => {
        if (error) {
            res.status(404).json({message:"Invalid URL"});
        } else {
            
            res.status(200).json({message:"success",count:data.length,data});
        }
        });
    }
    catch{
        res.status(404).json({message:"Invalid URL"});
    }

/*------------------------------------------------**Another Method**--------------------------------------------------*/

        // const {where}=req.query; 
        // const {sort}=req.query;
        // const {select}=req.query;
        // if(where){
        //     try{
        //         const json = JSON.parse(where);
        //         console.log(json["_id"])
        //         const id=json["_id"]
        //         const data = await Users.find({'_id':id});
        //         if(data){
        //             res.status(200).json({message:"ok",data})
        //         }
        //         else{
        //             res.status(404).send("No Records Found")
        //         }
        //     }
        //     catch{
        //         res.status(500).send("Please enter a valid id")
        //     }
        // }
        // else if(sort){
        //     const json = JSON.parse(sort);
        //     const nameQuery=json["name"];
        //     // console.log(nameQuery)
        //     const sorting = { name: nameQuery }
        //     // console.log(sorting)
        //     const sortedData=await Users.find().sort(sorting)
        //     res.status(200).json({message:"Sorted Data",sortedData})
        // }
        // else if(select){

        // }
        // else{
        //     const data = await Users.find();
        //     res.status(200).json({message:"ok",count:data.length,data})
        // }
})


//GET TASKS
app.get('/api/tasks',async(req,res)=>{

    try{
        await Tasks.find((eval("(" + req.query.where + ")")))
        .select(eval("("+req.query.select+")"))
        .sort(eval( "("+req.query.sort+" )"))
        .skip(eval( "("+req.query.skip+" )"))
        .limit(eval( "("+req.query.limit+" )"))
        .exec((error, data) => {
        if (error) {
            res.status(404).json({message:"Invalid URL"});
        } else {
            
            res.status(200).json({message:"success",count:data.length,data});
        }
        });
    }
    catch{
        res.status(404).json({message:"Invalid URL"});
    }


    /*------------------------------------------------**Another Method**--------------------------------------------------*/

        // const {where}=req.query; 
        // if(where){
        //     try{
        //         const json = JSON.parse(where);
        //         if(json["completed"]){
        //                     const data = await Tasks.find({'completed':json["completed"]});
                            
        //                     if(data){
        //                         res.status(200).json({message:"ok",count:data.length,data})
        //                     }
        //                     else{
        //                         res.status(404).json({message:"No Records Found"})
        //                     }          
        //         }
        //         else if(json["_id"]){
        //             const data = await Tasks.find({'_id':json["_id"]});
        //             if(data){
        //                 res.status(200).json({message:"ok",count:data.length,data})
        //             }
        //             else{
        //                 res.status(404).json({message:"No Records Found"})
        //             }
                    
        //         }
        //     }
        //     catch{
        //         res.status(404).json({message:"Invalid URL"});
        //     }
        // }
        // else{
        //     const data = await Tasks.find();
        //     res.status(200).json({message:"ok",count:data.length,data})
        // }
})

//GET TASKS BY ID
app.get('/api/tasks/:id', async (req, res) => {
    try{
        const data = await Tasks.findById(req.params.id);
        if(data){
            res.status(200).json({message:"ok",data})
        }
        else{
            res.status(404).json({message:"No Records Found"})
        }
        
    }
    catch(error){
        res.status(404).json({message:"No Records Found"})
    }
})

//GET USERS BY ID
app.get('/api/users/:id', async (req, res) => {
    try{
        const data = await Users.findById(req.params.id);
        if(data){
            res.status(200).json({message:"ok",data})
        }
    }
    catch(error){
        res.status(404).json({message:"No Records Found"})
    }
})



//UPDATE USER BY ID AND ADD PENDING TASK TO AN USER
app.put('/api/users/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };
        // console.log("error")
        if(!req.body.email=="" && !req.body.name==""){
            const result = await Users.findByIdAndUpdate(id, updatedData, options)
            if(result){
                res.status(201).json({message:"Successfully updated ",result})
            }
            else{
                res.status(500).json({message:"Please insert email and name"})
            }
        }
        else if((req.body.email=="" && req.body.name=="")||!req.body.pendingTasks==""){

                    const findTask=await Tasks.findById(req.body.pendingTasks)
                    console.log(findTask)
                    // console.log(findTask.length)
                    if(findTask===null){
                        res.status(404).json({message:"This task doesn't exist"})
                    }
                    else{
                        if (findTask.completed == true) {
                            const findPendingTask = await Users.findById(req.params.id)
                            // console.log(findPendingTask.pendingTasks.length)
                            const availPend = findPendingTask.pendingTasks.filter((task_id) => {
                                if (task_id === req.body.pendingTasks) {
                                    return task_id
                                }
                            })
                            // console.log(availPend.length)
                            if (availPend.length > 0) {
                                res.status(200).json({message:"This Task is already taken By you"})
                            }
                            else {
                                const result = await Users.findByIdAndUpdate(req.params.id, { $push: { pendingTasks: req.body.pendingTasks } }, { new: true })
                                console.log(result)
                                res.send(result)
                                const uname = result.name;
                                try {
                                    const taskId = req.body.pendingTasks;
                                    const updatedDataTask = {
                                        'assignedUser': id,
                                        'completed': false,
                                        'assignedUserName': uname
                                    }
                                    const finalresult = async () => {
                                        const resultTask = await Tasks.findByIdAndUpdate(
                                            taskId, updatedDataTask, options
                                        )
                                        return;
                                    }
                                    finalresult()
                                }
                                catch {
                                    res.status(500).json({message:"Server Error"})
                                }
                            }
                        }
                        else{
                            res.status(200).json({message:"This Task is already taken By another user"})
                        }
                    }
        }
        else{
            res.status(500).json({message:"please insert name and email"})
        }
    }
    catch (error) {

        res.status(500).json({message:"Server Error"})
    }
    
})


//UPDATE TASK BY ID
app.put('/api/tasks/:id', async (req, res) => {
    if(!req.body.name=="" && !req.body.deadline==""){
        try{
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };
            const data=await Tasks.findByIdAndUpdate(id, updatedData, options)
            res.status(200).json({message:"Successfully Updated",data})
        }
        catch{
            res.status(500).json({message:"Invalid Deadline Input"} )
        }
    }
    else{
        res.status(500).json({message:"Please enter deadline and name"})
    }

})

//DELETE USER BY ID
app.delete('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Users.findByIdAndDelete(id)
        if(data){
            res.status(200).json({message:`User: ${data.name} deleted successfuly`})
        }
    }
    catch (error) {
        res.status(404).json({message:"Not found any user"})
    }
})


//DELETE TASK BY ID
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Tasks.findByIdAndDelete(id)
        res.status(200).json({message:`Task: ${data.name} deleted successfuly`})
    }
    catch (error) {
        res.status(500).json({message:"Server Error"})
    }
})




app.listen(port,()=>{
    console.log("started");
})
