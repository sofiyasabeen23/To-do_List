
/* =========================================
   GET HTML ELEMENTS
========================================= */

const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");

const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");

const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const searchInput = document.getElementById("searchInput");

const themeButton = document.getElementById("themeButton");

const todayDate = document.getElementById("todayDate");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const productivityMessage =
    document.getElementById("productivityMessage");


/* =========================================
   TASK DATA
========================================= */

let tasks =
    JSON.parse(localStorage.getItem("taskflowTasks")) || [];


/* =========================================
   DISPLAY DATE
========================================= */

function displayDate() {

    const today = new Date();

    const options = {
        weekday: "short",
        month: "short",
        day: "numeric"
    };

    todayDate.textContent =
        today.toLocaleDateString("en-US", options);
}

displayDate();


/* =========================================
   SAVE TASKS
========================================= */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}


/* =========================================
   ADD TASK
========================================= */

function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {
        taskInput.focus();
        return;
    }

    const newTask = {

        id: Date.now(),

        text: text,

        completed: false,

        createdAt: new Date().toLocaleString(),

        completedAt: null
    };

    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    taskInput.focus();
}


/* =========================================
   COMPLETE / UNCOMPLETE TASK
========================================= */

function toggleTask(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {

            task.completed = !task.completed;

            if (task.completed) {

                task.completedAt =
                    new Date().toLocaleString();

            } else {

                task.completedAt = null;
            }
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });

    saveTasks();

    renderTasks();
}


/* =========================================
   EDIT TASK
========================================= */

function editTask(id) {

    const card =
        document.querySelector(`[data-id="${id}"]`);

    if (!card) {
        return;
    }

    const task =
        tasks.find(function (task) {
            return task.id === id;
        });

    if (!task) {
        return;
    }

    const taskText =
        card.querySelector(".task-text");

    const input =
        document.createElement("input");

    input.type = "text";
    input.value = task.text;
    input.maxLength = 150;

    input.className = "edit-input";

    taskText.replaceWith(input);

    input.focus();
    input.select();


    function saveEdit() {

        const updatedText =
            input.value.trim();

        if (updatedText !== "") {

            task.text = updatedText;

            saveTasks();
        }

        renderTasks();
    }


    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                saveEdit();
            }

            if (event.key === "Escape") {
                renderTasks();
            }
        }
    );

    input.addEventListener(
        "blur",
        saveEdit
    );
}


/* =========================================
   CREATE TASK CARD
========================================= */

function createTaskCard(task) {

    const card =
        document.createElement("div");

    card.className = "task-card";

    card.dataset.id = task.id;


    /* Complete button */

    const completeButton =
        document.createElement("button");

    completeButton.className =
        "complete-button";

    completeButton.innerHTML =
        task.completed ? "✓" : "";

    completeButton.title =
        task.completed
            ? "Mark as pending"
            : "Mark as complete";

    completeButton.addEventListener(
        "click",
        function () {
            toggleTask(task.id);
        }
    );


    /* Task content */

    const content =
        document.createElement("div");

    content.className = "task-content";


    const text =
        document.createElement("p");

    text.className = "task-text";

    text.textContent = task.text;


    const time =
        document.createElement("p");

    time.className = "task-time";

    if (task.completed && task.completedAt) {

        time.textContent =
            "Completed: " + task.completedAt;

    } else {

        time.textContent =
            "Added: " + task.createdAt;
    }


    content.appendChild(text);
    content.appendChild(time);


    /* Action buttons */

    const actions =
        document.createElement("div");

    actions.className = "task-actions";


    /* Edit button */

    const editButton =
        document.createElement("button");

    editButton.className =
        "action-button";

    editButton.innerHTML = "✎";

    editButton.title = "Edit task";

    editButton.addEventListener(
        "click",
        function () {
            editTask(task.id);
        }
    );


    /* Delete button */

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "action-button delete-button";

    deleteButton.innerHTML = "×";

    deleteButton.title = "Delete task";

    deleteButton.addEventListener(
        "click",
        function () {
            deleteTask(task.id);
        }
    );


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    card.appendChild(completeButton);
    card.appendChild(content);
    card.appendChild(actions);

    return card;
}


/* =========================================
   EMPTY STATE
========================================= */

function showEmptyState(container, message, icon) {

    const empty =
        document.createElement("div");

    empty.className = "empty-state";

    empty.innerHTML = `
        <div class="empty-icon">${icon}</div>
        <p>${message}</p>
    `;

    container.appendChild(empty);
}


/* =========================================
   DISPLAY TASKS
========================================= */

function renderTasks() {

    pendingList.innerHTML = "";
    completedList.innerHTML = "";


    const searchTerm =
        searchInput.value.toLowerCase().trim();


    const filteredTasks =
        tasks.filter(function (task) {

            return task.text
                .toLowerCase()
                .includes(searchTerm);
        });


    const pendingTasks =
        filteredTasks.filter(function (task) {
            return !task.completed;
        });


    const completedTasks =
        filteredTasks.filter(function (task) {
            return task.completed;
        });


    /* Pending tasks */

    pendingTasks.forEach(function (task) {

        pendingList.appendChild(
            createTaskCard(task)
        );
    });


    /* Completed tasks */

    completedTasks.forEach(function (task) {

        completedList.appendChild(
            createTaskCard(task)
        );
    });


    /* Pending empty message */

    if (pendingTasks.length === 0) {

        if (searchTerm !== "") {

            showEmptyState(
                pendingList,
                "No pending tasks found.",
                "⌕"
            );

        } else {

            showEmptyState(
                pendingList,
                "No pending tasks. Add one above.",
                "✓"
            );
        }
    }


    /* Completed empty message */

    if (completedTasks.length === 0) {

        if (searchTerm !== "") {

            showEmptyState(
                completedList,
                "No completed tasks found.",
                "⌕"
            );

        } else {

            showEmptyState(
                completedList,
                "Completed tasks will appear here.",
                "○"
            );
        }
    }


    updateCounters();

    updateProductivity();
}


/* =========================================
   UPDATE COUNTERS
========================================= */

function updateCounters() {

    const pending =
        tasks.filter(function (task) {
            return !task.completed;
        }).length;

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;


    pendingCount.textContent =
        pending + " pending";

    completedCount.textContent =
        completed + " completed";
}


/* =========================================
   PRODUCTIVITY
========================================= */

function updateProductivity() {

    const total = tasks.length;

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;


    let percentage = 0;

    if (total > 0) {

        percentage =
            Math.round((completed / total) * 100);
    }


    progressFill.style.width =
        percentage + "%";

    progressText.textContent =
        percentage + "%";


    if (total === 0) {

        productivityMessage.textContent =
            "Start by adding your first task.";

    } else if (percentage === 100) {

        productivityMessage.textContent =
            "All tasks completed!";

    } else if (percentage >= 75) {

        productivityMessage.textContent =
            "Almost done. Keep going!";

    } else if (percentage >= 50) {

        productivityMessage.textContent =
            "Good progress. Keep it up!";

    } else if (percentage > 0) {

        productivityMessage.textContent =
            "Good start. Keep working.";

    } else {

        productivityMessage.textContent =
            "Your tasks are ready. Let's get started.";
    }
}


/* =========================================
   ADD TASK BUTTON
========================================= */

addButton.addEventListener(
    "click",
    addTask
);


/* =========================================
   ENTER KEY
========================================= */

taskInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            addTask();
        }
    }
);


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    renderTasks
);


/* =========================================
   THEME
========================================= */

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle("dark");

        const darkMode =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "taskflowTheme",
            darkMode ? "dark" : "light"
        );
    }
);


/* =========================================
   LOAD SAVED THEME
========================================= */

const savedTheme =
    localStorage.getItem("taskflowTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}


/* =========================================
   FIRST LOAD
========================================= */

renderTasks();

