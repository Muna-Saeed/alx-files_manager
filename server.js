const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
routes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
module.exports = app;
