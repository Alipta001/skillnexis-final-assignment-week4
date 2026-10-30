require("dotenv").config();

const app = require("./app");
const Database = require("./config/db");

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("Set MONGO_URI and JWT_SECRET in backend/.env");
  }

  await Database.connect();
  const port = process.env.PORT || 5000;
  app.listen(port, () =>
    console.log(`API listening on http://localhost:${port}`),
  );
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
