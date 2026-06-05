const plaid = require('plaid');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

const client = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  env: plaid.environments.sandbox,
  options: {
    version: '2020-09-14'
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'plaid-link.html'));
});

app.post('/plaid_token_exchange', async (req, res) => {
  try {
    const { publicToken } = req.body;

    const { access_token } = await client.exchangePublicToken(publicToken);
    const { accounts, item } = await client.getAccounts(access_token);

    console.log({ accounts, item });

    res.json({ success: true, accounts, item });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(8080, () => {
  console.log('Server started. Listening at localhost:8080');
});
