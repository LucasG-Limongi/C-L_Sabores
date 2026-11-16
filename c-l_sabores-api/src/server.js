const express = require('express');
const { loadConfig } = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const stockRoutes = require('./routes/stockRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Valida configuração antes de subir o servidor (fail-fast)
const config = loadConfig();

const app = express();
const PORTA = config.port;

app.use(express.json());

app.get('/status', (_req, res) => {
  return res.json({ status: 'API Online - Projeto Semana 1' });
});

app.use('/recipes', recipeRoutes);
app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/ingredients', ingredientRoutes);
app.use('/stock', stockRoutes);
app.use('/clients', clientRoutes);
app.use('/orders', orderRoutes);

// Error handler global montado ÚLTIMO (após todas as rotas)
app.use(errorHandler);

app.listen(PORTA, () => {
  console.log(`[SERVIDOR OK] Rodando em http://localhost:${PORTA}`);
  console.log(`[CONFIG] Ambiente: ${config.nodeEnv}`);
});
