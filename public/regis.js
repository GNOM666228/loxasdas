document.addEventListener("DOMContentLoaded", () => {
    let isLogin = false;

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const submitButton = document.getElementById("submitForm");
    const toggleFormLink = document.getElementById("loginLink");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const generatePasswordButton = document.getElementById("generatePassword");
    const passwordStateIcon = document.getElementById("passwordStateIcon");

    toggleFormLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearErrors();
        if (isLogin) {
            setFormToRegister();
        } else {
            setFormToLogin();
        }
        isLogin = !isLogin;
    });

    passwordStateIcon.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);

        if (type === "text") {
            passwordStateIcon.textContent = "✅";
        } else {
            passwordStateIcon.textContent = "❌";
        }
    });

    generatePasswordButton.addEventListener("click", () => {
        const generatedPassword = generateSecurePassword();
        passwordInput.value = generatedPassword;
    });

    submitButton.addEventListener("click", (e) => {
        e.preventDefault();
        clearErrors();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (validateForm(username, password)) {
            if (isLogin) {
                loginUser(username, password);
            } else {
                registerUser(username, password);
            }
        }
    });

    function setFormToRegister() {
        document.getElementById("formTitle").textContent = "Регистрация";
        submitButton.textContent = "Зарегистрироваться";
        toggleFormLink.innerHTML = 'Уже есть аккаунт? <a href="#">Войти</a>';
    }

    function setFormToLogin() {
        document.getElementById("formTitle").textContent = "Вход";
        submitButton.textContent = "Войти";
        toggleFormLink.innerHTML = 'Нет аккаунта? <a href="#">Зарегистрируйтесь</a>';
    }

    function validateForm(username, password) {
        let isValid = true;

        if (username.length < 3) {
            usernameError.textContent = "Имя пользователя должно быть не менее 3 символов.";
            isValid = false;
            showNotification('Ошибка: Имя пользователя слишком короткое.', 'error');
        }

        if (password.length < 8) {
            passwordError.textContent = "Пароль должен содержать не менее 8 символов.";
            isValid = false;
            showNotification('Ошибка: Пароль должен содержать не менее 8 символов.', 'error');
        }

        return isValid;
    }

    function clearErrors() {
        usernameError.textContent = "";
        passwordError.textContent = "";
    }

    function registerUser(username, password) {
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Регистрация прошла успешно!', 'success');
                window.location.href = 'chat.html';
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showNotification('Ошибка при регистрации.', 'error');
        });
    }

    function loginUser(username, password) {
        fetch('/api/users')
            .then(response => response.json())
            .then(users => {
                const user = users.find(user => user.username === username && user.password === password);
                if (user) {
                    showNotification('Вход успешен!', 'success');
                    window.location.href = 'chat.html';
                } else {
                    showNotification('Неправильный логин или пароль.', 'error');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showNotification('Ошибка при входе.', 'error');
            });
    }

    // Custom notification function to show messages
    function showNotification(message, type) {
        const notification = document.getElementById('customNotification');
        notification.textContent = message;
        notification.classList.add('show');
        notification.classList.add(type); // success, error, info

        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove(type);
        }, 3000);
    }

    function generateSecurePassword() {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+?><:{}[]";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
});
