import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express()
const port = process.env.PORT || 5001;
const mongodbURI = process.env.mongodbURI || "mongodb+srv://userdb:dbpassword@cluster0.89mwy3g.mongodb.net/";

app.use(cors());
app.use(express.json());

let users = []; // TODO: connect with mongodb instead

const userSchema = new mongoose.Schema({
    createdOn: { type: Date, default: Date.now },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});
const userModel  = mongoose.model('users', userSchema);




// Endpoint to handle POST requests for creating a new user
app.post('/api/users', async (req, res) => {
    try {
        const newUser = new userModel(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to handle POST requests for user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await userModel.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the stored password
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // User authenticated successfully
        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Schema for User Projects
const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    projectName: { type: String, required: true },
    projectLink: { type: String, required: true },
    developerName: { type: String, required: true },
    description: { type: String, required: true },
    createdOn: { type: Date, default: Date.now }
});

// Model for User Projects
const projectModel = mongoose.model('projects', projectSchema);
app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new projectModel(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to handle GET requests for fetching all projects
// ...

// Endpoint to handle GET requests for fetching all projects
app.get('/api/projects', async (req, res) => {
    try {
        const allProjects = await projectModel.find();
        res.status(200).json(allProjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ...



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

/////////////////////////////////////////////////////////////////////////////////////////////////
mongoose.connect(mongodbURI);

////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////