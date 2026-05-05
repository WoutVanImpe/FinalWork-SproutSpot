const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");

// Import Routes

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
