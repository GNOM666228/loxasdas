document.addEventListener("DOMContentLoaded", () => {
    // Chat elements
    const messageInput = document.getElementById("messageInput");
    const messagesDiv = document.getElementById("messages");
    const friendSearch = document.getElementById("friendSearch");
    const friendSuggestions = document.getElementById("friendSuggestions");
    const searchFriendButton = document.getElementById("searchFriendButton");
    const friendListDiv = document.getElementById("friendsContainer");

    // Logged-in user and data initialization
    const loggedUser = localStorage.getItem('loggedUser') || 'testUser';
    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    let friendsList = JSON.parse(localStorage.getItem(`${loggedUser}_friends`)) || [];
    let chats = JSON.parse(localStorage.getItem(`${loggedUser}_chats`)) || {};

    let activeFriend = null;
    let lastMessageDate = null;

    // Display friends list
    function displayFriends() {
        friendListDiv.innerHTML = "";
        if (friendsList.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-message");
            emptyMessage.textContent = "Список друзей пуст";
            friendListDiv.appendChild(emptyMessage);
        } else {
            friendsList.forEach(friend => {
                const friendElement = document.createElement("div");
                friendElement.classList.add("friend-item");
                friendElement.textContent = friend;
                friendElement.addEventListener("click", () => selectFriend(friendElement));
                friendListDiv.appendChild(friendElement);
            });
        }
    }

    // Select a friend and update chat
    function selectFriend(friendElement) {
        activeFriend = friendElement.textContent;
        updateMessages();
        document.querySelectorAll('.friend-item').forEach(f => f.classList.remove('active'));
        friendElement.classList.add("active");
        messageInput.disabled = false;
        document.getElementById("inputArea").classList.remove("hidden");
        showNotification(`Вы выбрали друга: ${activeFriend}`, 'info');
    }

    // Update messages for the selected friend
    function updateMessages() {
        messagesDiv.innerHTML = "";
        if (!chats[activeFriend]) {
            chats[activeFriend] = [];
        }
        chats[activeFriend].forEach((message, index) => {
            if (index === 0 || chats[activeFriend][index - 1].date !== message.date) {
                addDateToDOM(message.date);
            }
            addMessageToDOM(message.text, message.isMine, message.time);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        saveData();
    }

    // Send a new message
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText !== "" && activeFriend) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = now.toLocaleDateString();

            if (lastMessageDate !== dateString) {
                lastMessageDate = dateString;
                addDateToDOM(dateString);
            }

            const newMessage = {
                text: messageText,
                isMine: true,
                time: timeString,
                date: dateString
            };

            chats[activeFriend].push(newMessage);
            addMessageToDOM(messageText, true, timeString);
            messageInput.value = "";
            saveData();
            showNotification('Сообщение отправлено!', 'success');
        } else {
            showNotification('Невозможно отправить сообщение: нет активного друга.', 'error');
        }
    }

    // Add message to DOM
    function addMessageToDOM(text, isMine, time) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", isMine ? "my-message" : "other-message");

        const timeElement = document.createElement("div");
        timeElement.classList.add("message-info");
        timeElement.innerHTML = `<span class="time">${time}</span>`;

        messageElement.textContent = text;
        messageElement.appendChild(timeElement);
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Add date in chat
    function addDateToDOM(date) {
        const dateElement = document.createElement("div");
        dateElement.classList.add("date");
        dateElement.textContent = date;
        messagesDiv.appendChild(dateElement);
    }

    // Save chat and friend data to localStorage
    function saveData() {
        localStorage.setItem(`${loggedUser}_friends`, JSON.stringify(friendsList));
        localStorage.setItem(`${loggedUser}_chats`, JSON.stringify(chats));
    }

    // Clear chat
    document.getElementById("clearChat").addEventListener("click", () => {
        if (activeFriend) {
            chats[activeFriend] = [];
            updateMessages();
            showNotification('Чат очищен', 'info');
        }
    });

    // Search for friends
    friendSearch.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        friendSuggestions.innerHTML = "";
        if (query !== "") {
            fetch('/api/logins')
                .then(response => response.json())
                .then(logins => {
                    const filteredUsers = logins.filter(user => user.toLowerCase().includes(query) && user !== loggedUser);
                    filteredUsers.forEach(user => {
                        const suggestion = document.createElement("div");
                        suggestion.textContent = user;
                        suggestion.classList.add("friend-item");
                        friendSuggestions.appendChild(suggestion);

                        suggestion.addEventListener("click", () => {
                            if (!friendsList.includes(user)) {
                                friendsList.push(user);
                                displayFriends();
                                saveData();
                                showNotification(`Вы добавили ${user} в друзья`, 'success');
                            }
                            friendSearch.value = "";
                            friendSuggestions.innerHTML = "";
                        });
                    });
                })
                .catch(error => {
                    console.error('Ошибка получения логинов:', error);
                    showNotification('Ошибка при получении списка пользователей', 'error');
                });
        }
    });

    // Find friend
    searchFriendButton.addEventListener("click", () => {
        const friendName = friendSearch.value.trim();
        fetch('/api/logins')
            .then(response => response.json())
            .then(logins => {
                if (friendName !== "" && logins.includes(friendName) && !friendsList.includes(friendName)) {
                    friendsList.push(friendName);
                    displayFriends();
                    saveData();
                    showNotification(`Вы добавили ${friendName} в друзья`, 'success');
                } else if (friendsList.includes(friendName)) {
                    showNotification(`${friendName} уже в списке ваших друзей`, 'info');
                } else {
                    showNotification('Такого пользователя не существует', 'error');
                }
                friendSearch.value = "";
                friendSuggestions.innerHTML = "";
            })
            .catch(error => {
                console.error('Ошибка проверки друга:', error);
                showNotification('Ошибка при проверке пользователя', 'error');
            });
    });

    // Restore friend list on page load
    displayFriends();

    // Event listener for sending message
    document.getElementById("sendMessage").addEventListener("click", sendMessage);

    // Send message on Enter key press
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    // Custom notification function
    function showNotification(message, type) {
        const notification = document.getElementById('customNotification');
        notification.textContent = message;
        notification.classList.add('show');
        notification.classList.add(type);

        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove(type);
        }, 3000);
    }
});
