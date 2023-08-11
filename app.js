let express = require("express");
let app = express();
let bcrypt = require("bcrypt");
app.use(express.json());
let sql3 = require("sqlite3");
let { open } = require("sqlite");
let path = require("path");
let dbp = path.join(__dirname, "userData.db");
console.log(dbp);
let db = null;
let invservst = async () => {
  try {
    db = await open({
      filename: dbp,
      driver: sql3.Database,
    });
    app.listen(5011, () => console.log("server started"));
  } catch (e) {
    console.log(`server error occured at ${e}`);
  }
};
let hashp = null;
invservst();
app.post("/register", async (req, resp) => {
  let { username, name, password, gender, location } = req.body;
  let q = `select * from user where username=='${username}';`;
  let query = await db.get(q);
  if (query === undefined) {
    hashp = await bcrypt.hash(password, 10);
    if (password.length < 5) {
      resp.status(400);
      resp.send("Password is too short");
      console.log("Password is too short");
    } else {
      let query = `insert into user values ('${username}','${name}','${hashp}','${gender}','${location}');`;
      let s = await db.run(query);
      resp.status(200);
      resp.send("User created successfully");
      console.log("User created successfully");
    }
  } else {
    resp.status(400);
    resp.send("User already exists");
    console.log("User already exists");
  }
});
app.post("/login", async (req, resp) => {
  let { username, password } = req.body;
  let q = `select * from user where username=='${username}';`;
  let q1 = await db.get(q);
  if (q1 === undefined) {
    resp.status(400);
    resp.send("Invalid user");
  } else {
    let pasc = await bcrypt.compare(password, q1.password);
    if (pasc) {
      resp.status(200);
      resp.send("Login success!");
    } else {
      resp.status(400);
      resp.send("Invalid password");
    }
  }
});
app.post("/change-password", async (req, resp) => {
  let { username, oldPassword, newPassword } = req.body;
  let q = `select * from user where username='${username}';`;
  let q1 = await db.get(q);
  let pcheck = await bcrypt.compare(oldPassword, q1.password);
  console.log(pcheck);
});
module.exports = app;
