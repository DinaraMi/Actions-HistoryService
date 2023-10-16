const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { requestLogger, errorLogger } = require('./logger');

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/actions_history_service', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
});


// Определение модели для истории действий
const Action = mongoose.model('Action', {
  userId: String,
  actionType: String,
  timestamp: Date,
});

const app = express();
app.use(bodyParser.json());
app.use(requestLogger);
// Запись истории действий при создании пользователя
app.post('/record-action', (req, res) => {
  Action.create(req.body)
    .then(action => {
      res.status(201).send(action);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

// Получение истории действий с фильтрами
app.get('/actions-history', (req, res) => {
  const { userId, fromDate, toDate } = req.query;
  const query = {};
  if (userId) {
    query.userId = userId;
  }
  if (fromDate && toDate) {
    query.timestamp = { $gte: new Date(fromDate), $lte: new Date(toDate) };
  }
  Action.find(query)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.use(errorLogger);

app.listen(3001, () => {
  console.log('Actions History Service is running on port 3001');
});
