document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('new-task');
  taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTask();
    }
  });

  // Add event listener for file input
  const fileInput = document.getElementById('file-input');
  fileInput.addEventListener('change', handleFileUpload);

  // Add this to update the file input label with the selected file name
  fileInput.addEventListener('change', (event) => {
    const fileName = event.target.files[0]?.name;
    const label = document.querySelector('.file-input-label');
    label.textContent = fileName ? `File selected: ${fileName}` : 'Upload Tasks File';
  });
});

let tasks = [];
let scores = [];
let comparisons = [];
let currentPairIndex = 0;

function addTask() {
  const taskInput = document.getElementById('new-task');
  const task = taskInput.value.trim();
  if (task) {
    tasks.push(task);
    scores.push({ task: task, score: 0 });
    taskInput.value = '';
    updateAddedTasks();
  }
}

function updateAddedTasks() {
  const addedTasksList = document.getElementById('added-tasks');
  addedTasksList.innerHTML = '';
  tasks.forEach((task, index) => {
    let listItem = document.createElement('li');
    
    let taskText = document.createElement('span');
    taskText.textContent = task;
    taskText.className = 'task-text';
    listItem.appendChild(taskText);
    
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.onclick = () => deleteTask(index);
    listItem.appendChild(deleteButton);
    
    addedTasksList.appendChild(listItem);
  });
}

function startRanking() {
  if (tasks.length < 2) {
    alert("Add at least two tasks to start ranking.");
    return;
  }
  generateComparisons();
  document.getElementById('comparison-view').style.display = 'block';
  document.getElementById('added-tasks').style.display = 'none';
  presentComparison();
}

function generateComparisons() {
  comparisons = [];
  for (let i = 0; i < tasks.length - 1; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      comparisons.push([scores[i], scores[j]]);
    }
  }
  currentPairIndex = 0;
}

function presentComparison() {
  if (currentPairIndex < comparisons.length) {
    const [task1, task2] = comparisons[currentPairIndex];
    document.getElementById('option1').textContent = task1.task;
    document.getElementById('option2').textContent = task2.task;
  } else {
    document.getElementById('comparison-view').style.display = 'none';
    alert("All comparisons are done. Here is your ranked list.");
    displayRankedList();
  }
}

function chooseTask(option) {
  if (currentPairIndex < comparisons.length) {
    const [task1, task2] = comparisons[currentPairIndex];
    if (option === 1) {
      updateScore(task1, task2);
    } else {
      updateScore(task2, task1);
    }
    currentPairIndex++;
    presentComparison();
  }
}

function updateScore(winner, loser) {
  let winnerIndex = scores.findIndex(item => item.task === winner.task);
  scores[winnerIndex].score++;
}

function displayRankedList() {
  scores.sort((a, b) => b.score - a.score);
  const rankedList = document.getElementById('ranked-list');
  rankedList.innerHTML = '';
  let currentRank = 1;
  let previousScore = null;
  scores.forEach((item, index) => {
    if (previousScore !== null && item.score < previousScore) {
      currentRank = index + 1;
    }
    let listItem = document.createElement('li');
    listItem.textContent = `${currentRank}. ${item.task} (Score: ${item.score})`;
    rankedList.appendChild(listItem);
    previousScore = item.score;
  });
  
  document.getElementById('download-csv').style.display = 'block';
}

function deleteTask(index) {
  tasks.splice(index, 1);
  scores.splice(index, 1);
  updateAddedTasks();
}

function downloadCSV() {
  let csvContent = "data:text/csv;charset=utf-8,Rank,Task,Score\n";
  
  let currentRank = 1;
  let previousScore = null;
  scores.forEach((item, index) => {
    if (previousScore !== null && item.score < previousScore) {
      currentRank = index + 1;
    }
    let row = `${currentRank},"${item.task}",${item.score}`;
    csvContent += row + "\n";
    previousScore = item.score;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "ranked_tasks.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// New function to handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      const lines = content.split('\n');
      lines.forEach(line => {
        const task = line.trim();
        if (task) {
          tasks.push(task);
          scores.push({ task: task, score: 0 });
        }
      });
      updateAddedTasks();
    };
    reader.readAsText(file);
  }
}