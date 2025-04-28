const express = require('express');
const fs = require('fs');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Joi = require('joi');
const path = require('path');
const app = express();
dotenv.config();

const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;
const salt = process.env.SALT || 10;

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/image", express.static("./public/image"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

let usersCollection; // We’ll store our collection here
let sessionsCollection; // We’ll store our collection here

async function connectToDB() {
    try {
        await client.connect();
        const db = client.db("assignment1db"); // Use your actual DB name
        usersCollection = db.collection("users"); // Use your actual collection
        sessionsCollection = db.collection("sessions"); // Use your actual collection
        console.log("✅ Connected to MongoDB Atlas!");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
    }
}
connectToDB();

app.use(session({
    secret: process.env.NODE_SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: uri,
        dbName: "assignment1db",
        crypto: {
            secret: process.env.MONGODB_SESSION_SECRET
        }
    }),
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

app.get("/", (req, res) => {
    if (req.session.username) {
        res.redirect("/memberspage");
    } else {
        let doc = fs.readFileSync("./app/html/index.html", "utf8");
        res.setHeader("Content-Type", "text/html");
        res.send(doc);
    }
});

app.get("/loginpage", (req, res) => {
    if (req.session.username) {
        res.redirect("/memberspage");
    } else {
        let doc = fs.readFileSync("./app/html/login.html", "utf8", "utf8");
        res.setHeader("Content-Type", "text/html");
        res.send(doc);
    }
});

app.get("/signuppage", (req, res) => {
    if (req.session.username) {
        res.redirect("/memberspage");
    } else {
        let doc = fs.readFileSync("./app/html/signup.html", "utf8", "utf8");
        res.setHeader("Content-Type", "text/html");
        res.send(doc);
    }
});

app.get("/memberspage", (req, res) => {
    if (req.session.username) {
        let doc = fs.readFileSync("./app/html/members.html", "utf8", "utf8");
        res.setHeader("Content-Type", "text/html");
        res.send(doc);
    } else {
        res.redirect("/loginpage");
    }
});

app.post("/signup", async (req, res) => {
    const json = req.body;

    // STEP 1: Create a Joi schema
    const schema = Joi.object({
        username: Joi.string().max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(20).required()
    });

    // STEP 2: Validate user input against the schema
    const validationResult = schema.validate(json);

    if (validationResult.error) {
        // STEP 3: If validation fails
        console.log(validationResult.error);
        res.send("Validation Error: " + validationResult.error.details[0].message);
        return;
    }

    // STEP 4: If validation passes, continue
    const salt = 12; // You need to define salt if not already
    const hashedPassword = bcrypt.hashSync(json.password, salt);

    const user = {
        username: json.username,
        email: json.email,
        password: hashedPassword
    };

    // STEP 5: Insert user into MongoDB
    try {
        const result = await usersCollection.insertOne(user);
        // STEP 6: Create session and redirect
        req.session.username = user.username;
        res.status(201).json({ message: `User inserted with ID: ${result.insertedId}` });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Failed to insert user` });
      }
});

app.post("/login", async (req, res) => {
    const json = req.body;
    const result = await usersCollection.findOne({ email: json.email })

    if(result) {
        const match = await bcrypt.compare(json.password, result.password);
        if (match) {
            req.session.username = result.username;
            res.status(201).json({ message: `Success`});
        } else {
            res.status(500).json({ message: `This email does not have an account or the password for this email is wrong`});
        }
    } else {
        res.status(500).json({ message: `This email does not have an account or the password for this email is wrong`});
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.status(500).send("Error logging out");
        } else {
            res.redirect("/loginpage");
        }
    });
});

app.get("/getUsername", (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.redirect('/loginpage');
    }
});

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
});

app.listen(port, () => {
    console.log('Server running at http://localhost:' + port);
});