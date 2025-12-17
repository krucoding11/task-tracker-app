const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const takeRoutes = require("../server/routes/takeRoutes");
const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ message: "No token" });

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // MUST contain id
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});


app.use((req, res, next) => {
    next();
});

app.use("/api/takes", takeRoutes);

const PORT = 3000;
app.listen(PORT, () => 
    console.log("Local Task API on", PORT),
    
)