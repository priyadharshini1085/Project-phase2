# stock_predictor.py

import yfinance as yf
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
from sklearn.metrics import mean_squared_error
def load_data(symbol, start='2015-01-01', end='2024-01-01'):
    data = yf.download(symbol, start=start, end=end)
    return data[['Close']]

def preprocess_data(data):
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)
    X, y = [], []
    for i in range(60, len(scaled_data)):
        X.append(scaled_data[i-60:i, 0])
        y.append(scaled_data[i, 0])
    return np.array(X), np.array(y), scaler

def build_model():
    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(60, 1)))
    model.add(LSTM(50))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

def train_predict(symbol):
    data = load_data(symbol)
    train_data = data[:int(len(data)*0.8)]
    test_data = data[int(len(data)*0.8) - 60:]

    X_train, y_train, scaler = preprocess_data(train_data)
    X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)

    model = build_model()
    model.fit(X_train, y_train, epochs=10, batch_size=32)

    # Test data
    X_test, y_test, _ = preprocess_data(test_data)
    X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)
    predicted = model.predict(X_test)
    predicted_prices = scaler.inverse_transform(predicted.reshape(-1, 1))

    # Visualize
    actual_prices = data['Close'].values[len(data) - len(predicted_prices):]
    plt.figure(figsize=(10, 6))
    plt.plot(actual_prices, color='blue', label='Actual Price')
    plt.plot(predicted_prices, color='red', label='Predicted Price')
    plt.title(f'{symbol} Stock Price Prediction')
    plt.xlabel('Time')
    plt.ylabel('Price')
    plt.legend()
    plt.show()

# Run prediction
if __name__ == "__main__":
    symbol = input("Enter stock symbol (e.g., AAPL): ")
    train_predict(symbol)
