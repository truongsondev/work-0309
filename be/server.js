import app from "./src/index.js";

import { configDotenv } from "dotenv";
configDotenv();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
