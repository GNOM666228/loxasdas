const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

// Настройка и запуск Express сервера
const serverApp = express();
const serverPort = 3000;

serverApp.use(express.static(path.join(__dirname, 'public')));

serverApp.listen(serverPort, () => {
    console.log(`Express сервер запущен на http://localhost:${serverPort}`);
});

// Функция для создания окна Electron
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Проверяем, зарегистрирован ли пользователь
    const loggedIn = checkIfUserLoggedIn(); // Функция для проверки логина

    if (loggedIn) {
        // Если пользователь зарегистрирован, открываем чат
        win.loadURL(`http://localhost:${serverPort}/chat.html`);
    } else {
        // Иначе открываем страницу регистрации
        win.loadURL(`http://localhost:${serverPort}/regis.html`);
    }
}

// Проверка, зарегистрирован ли пользователь
function checkIfUserLoggedIn() {
    // Здесь вы можете использовать логику проверки localStorage или сохраненных данных
    // Например, проверка наличия ключа loggedUser в localStorage
    const fs = require('fs');
    const dataPath = path.join(__dirname, 'data', 'users.json');

    // Пример: если файл с пользователями существует и не пустой
    if (fs.existsSync(dataPath)) {
        const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        return users.length > 0; // Если есть хотя бы один пользователь, считаем, что кто-то зарегистрирован
    }
    return false;
}

// Когда Electron готов, создаем окно
app.whenReady().then(createWindow);

// Закрытие приложения при закрытии всех окон
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Для macOS (если все окна закрыты, но приложение запущено)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
