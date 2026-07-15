import "dotenv/config";
import app from "./app";
import { PORT } from "./config";

app.listen(PORT, () => {
  console.log(`✔ API corriendo en http://localhost:${PORT}`);
});
