import './env.js';           // ← MUST be first: loads .env before all other modules
import app from "./app.js";
import connectDB from "./config/database.js";

const port = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`CORS origin allowed: ${process.env.CLIENT_URL}`);
  });
});
