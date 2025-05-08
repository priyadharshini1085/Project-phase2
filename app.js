<!DOCTYPE html>
<html>
<head>
  <title>Stock Predictor (JavaScript Only)</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      background: #f5f7fa;
      padding-top: 60px;
    }
    input, button {
      padding: 10px;
      margin: 10px;
      font-size: 16px;
      width: 250px;
    }
    #result {
      margin-top: 20px;
      font-size: 18px;
      color: green;
    }
  </style>
</head>
<body>

  <h1>AI Stock Price Predictor</h1>
  <input type="text" id="symbol" placeholder="Enter Stock Symbol (e.g., AAPL)">
  <button onclick="predict()">Predict Price</button>

  <div id="result"></div>

  <script>
    const API_KEY = 'YOUR_API_KEY'; // Replace with your Alpha Vantage or TwelveData key

    async function fetchStockData(symbol) {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const prices = Object.values(data["Time Series (Daily)"]).map(d => parseFloat(d["4. close"]));
      return prices.reverse(); // oldest to newest
    }

    function simpleLinearRegression(x, y) {
      const n = x.length;
      const xMean = x.reduce((a, b) => a + b, 0) / n;
      const yMean = y.reduce((a, b) => a + b, 0) / n;
      const num = x.map((xi, i) => (xi - xMean) * (y[i] - yMean)).reduce((a, b) => a + b);
      const den = x.map(xi => Math.pow(xi - xMean, 2)).reduce((a, b) => a + b);
      const slope = num / den;
      const intercept = yMean - slope * xMean;
      return x => slope * x + intercept;
    }

    async function predict() {
      const symbol = document.getElementById('symbol').value.toUpperCase();
      const resultDiv = document.getElementById('result');
      resultDiv.textContent = 'Loading...';

      try {
        const prices = await fetchStockData(symbol);
        const x = Array.from({ length: prices.length }, (_, i) => i);
        const y = prices;
        const predictFn = simpleLinearRegression(x, y);
        const nextDay = x.length;
        const predictedPrice = predictFn(nextDay).toFixed(2);
        resultDiv.textContent = `Predicted next close price for ${symbol}: $${predictedPrice}`;
      } catch (err) {
        console.error(err);
        resultDiv.textContent = 'Failed to fetch or predict.';
      }
    }
  </script>

</body>
</html>
