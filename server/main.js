const express = require("express");
const cors = require("cors");
// const sequelize = require('./config/sequelize');

const app = express();
console.log("ENV Loaded and DB_NAME...............", process.env.DB_NAME);

// sequelize
//   .sync({ alter: true }, { force: true })
//   .then(() => {
//     console.log('All tables synced.');
//   })
//   .catch((err) => console.error('Sync failed:', err));

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully..!!');
//   })
//   .catch((err) => {
//     console.error('error connecting to db............', err);
//   });

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);

const authRoutes = require("./routes/authRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}..!!`));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Initial Route is working..!!" });
});
// app.use("/v1", v1);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
