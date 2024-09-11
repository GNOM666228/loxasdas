const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Пути к JSON файлам
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const loginsFilePath = path.join(__dirname, 'data', 'logins.json');

// Настройка статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Для обработки JSON запросов

// Маршрут для корневой страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'regis.html'));
});

// Получение всех пользователей
app.get('/api/users', (req, res) => {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла пользователей' });
        }
        res.json(JSON.parse(data));
    });
});

// Получение всех логинов (для поиска друзей)
app.get('/api/logins', (req, res) => {
    fs.readFile(loginsFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла логинов' });
        }
        res.json(JSON.parse(data));
    });
});

// Регистрация пользователя
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    // Проверяем, существует ли такой логин
    fs.readFile(loginsFilePath, 'utf8', (err, loginsData) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла логинов' });
        }
        const logins = JSON.parse(loginsData);
        if (logins.includes(username)) {
            return res.status(400).json({ error: 'Имя пользователя уже занято' });
        }

        // Если логин уникален, добавляем пользователя
        fs.readFile(usersFilePath, 'utf8', (err, usersData) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при чтении файла пользователей' });
            }
            const users = JSON.parse(usersData);

            const newUser = { username, password };
            users.push(newUser);
            logins.push(username);

            // Обновляем файлы
            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при записи файла пользователей' });
                }
                fs.writeFile(loginsFilePath, JSON.stringify(logins, null, 2), (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка при записи файла логинов' });
                    }
                    res.json({ success: true, message: 'Пользователь зарегистрирован' });
                });
            });
        });
    });
});

// Новый маршрут для сохранения пароля в файл pas.txt
app.post('/api/save-password', (req, res) => {
    const { password } = req.body;
    const filePath = path.join(__dirname, 'pas.txt');

    // Сохраняем пароль в файл pas.txt
    fs.writeFile(filePath, password, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при сохранении пароля' });
        }
        res.json({ success: true, message: 'Пароль успешно сохранен' });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
