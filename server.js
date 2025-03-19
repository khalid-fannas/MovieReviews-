const express = require("express");
require("dotenv").config();
const db = require("./config/db");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const viewRoutes = require("./routes/viewRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const PORT = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/", viewRoutes);
app.use("/", protectedRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
