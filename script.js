document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notesContainer = document.getElementById('notes-container');
    const remindersContainer = document.getElementById('reminders-container');
    const addNoteBtn = document.getElementById('add-note');
    const showRemindersBtn = document.getElementById('show-reminders');
    const showNotesBtn = document.getElementById('show-notes');
    const priorityFilter = document.getElementById('priority-filter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Note rotations for visual effect
    const rotations = ['rotate-1', 'rotate-2', 'rotate-3', 'rotate-4', 'rotate-5'];
    let currentFilter = 'all';
    
    // Initialize the app
    loadNotes();
    loadReminders();
    
    // Event Listeners
    addNoteBtn.addEventListener('click', addNewNote);
    showRemindersBtn.addEventListener('click', showReminders);
    showNotesBtn.addEventListener('click', showNotes);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.dataset.priority;
            updateFilterButtons();
            filterNotes();
        });
    });
    
    function updateFilterButtons() {
        filterButtons.forEach(button => {
            if (button.dataset.priority === currentFilter) {
                button.classList.add('font-bold', 'scale-105');
                button.classList.remove('bg-opacity-50');
            } else {
                button.classList.remove('font-bold', 'scale-105');
                button.classList.add('bg-opacity-50');
            }
        });
    }
    
    function filterNotes() {
        const allNotes = document.querySelectorAll('.note-card');
        
        allNotes.forEach(note => {
            if (currentFilter === 'all' || note.dataset.priority === currentFilter) {
                note.classList.remove('hidden');
            } else {
                note.classList.add('hidden');
            }
        });
    }
    
    function showReminders() {
        notesContainer.classList.add('hidden');
        remindersContainer.classList.remove('hidden');
        showRemindersBtn.classList.add('hidden');
        showNotesBtn.classList.remove('hidden');
        priorityFilter.classList.add('hidden');
    }
    
    function showNotes() {
        notesContainer.classList.remove('hidden');
        remindersContainer.classList.add('hidden');
        showRemindersBtn.classList.remove('hidden');
        showNotesBtn.classList.add('hidden');
        priorityFilter.classList.remove('hidden');
    }
    
    function addNewNote() {
        const noteId = Date.now().toString();
        const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
        const currentDate = new Date().toISOString().split('T')[0];
        
        const noteElement = document.createElement('div');
        noteElement.className = `note-card priority-low ${randomRotation} note-shadow hover:note-shadow-hover transition-all duration-300 transform hover:scale-105 hover:z-10 relative bg-priority-low animate-fade-in`;
        noteElement.setAttribute('data-id', noteId);
        noteElement.setAttribute('data-priority', 'low');
        noteElement.setAttribute('data-date', currentDate);
        noteElement.setAttribute('data-type', 'note');
        
        noteElement.innerHTML = `
            <div class="h-full flex flex-col p-4">
                <div class="flex justify-between items-start mb-2">
                    <input type="checkbox" class="custom-checkbox complete-checkbox mr-2 mt-1">
                    <h2 class="text-xl font-bold flex-1 outline-none" contenteditable="true" data-placeholder="Title">Title</h2>
                    <div class="priority-dot bg-green-500"></div>
                </div>
                <p class="flex-1 font-handwriting text-2xl outline-none mb-4" contenteditable="true" data-placeholder="Start writing...">Start writing...</p>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <div class="date-display">${formatDate(currentDate)}</div>
                    <div class="flex space-x-2">
                        <select class="priority-select bg-transparent border rounded px-2 py-1 text-xs">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <button class="delete-note p-1 text-gray-400 hover:text-red-500 transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        notesContainer.prepend(noteElement);
        
        // Set up event listeners
        setupNoteEvents(noteElement, noteId);
        
        // Focus on the title
        const titleElement = noteElement.querySelector('h2');
        titleElement.focus();
        
        // Select all text for easy replacement
        const range = document.createRange();
        range.selectNodeContents(titleElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Save empty note
        saveNote({
            id: noteId,
            title: 'Title',
            content: 'Start writing...',
            priority: 'low',
            date: currentDate,
            completed: false,
            type: 'note'
        });
    }
    
    function addNewReminder() {
        const reminderId = Date.now().toString();
        const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
        const currentDate = new Date().toISOString().split('T')[0];
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + 1);
        const reminderDateStr = reminderDate.toISOString().split('T')[0];
        
        const reminderElement = document.createElement('div');
        reminderElement.className = `note-card ${randomRotation} note-shadow hover:note-shadow-hover transition-all duration-300 transform hover:scale-105 hover:z-10 relative bg-reminder animate-fade-in`;
        reminderElement.setAttribute('data-id', reminderId);
        reminderElement.setAttribute('data-date', reminderDateStr);
        reminderElement.setAttribute('data-type', 'reminder');
        
        reminderElement.innerHTML = `
            <div class="h-full flex flex-col p-4">
                <div class="flex justify-between items-start mb-2">
                    <input type="checkbox" class="custom-checkbox complete-checkbox mr-2 mt-1">
                    <h2 class="text-xl font-bold flex-1 outline-none" contenteditable="true" data-placeholder="Reminder">Reminder</h2>
                </div>
                <p class="flex-1 font-handwriting text-2xl outline-none mb-4" contenteditable="true" data-placeholder="Reminder details...">Reminder details...</p>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <div class="date-display">Due: ${formatDate(reminderDateStr)}</div>
                    <div class="flex space-x-2">
                        <input type="date" class="reminder-date bg-transparent border rounded px-2 py-1 text-xs" value="${reminderDateStr}">
                        <button class="delete-note p-1 text-gray-400 hover:text-red-500 transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        remindersContainer.prepend(reminderElement);
        
        // Set up event listeners
        setupNoteEvents(reminderElement, reminderId);
        
        // Focus on the title
        const titleElement = reminderElement.querySelector('h2');
        titleElement.focus();
        
        // Save empty reminder
        saveNote({
            id: reminderId,
            title: 'Reminder',
            content: 'Reminder details...',
            date: reminderDateStr,
            completed: false,
            type: 'reminder'
        });
    }
    
    function setupNoteEvents(noteElement, noteId) {
        const titleElement = noteElement.querySelector('h2');
        const contentElement = noteElement.querySelector('p');
        const deleteBtn = noteElement.querySelector('.delete-note');
        const completeCheckbox = noteElement.querySelector('.complete-checkbox');
        const prioritySelect = noteElement.querySelector('.priority-select');
        const dateInput = noteElement.querySelector('.reminder-date');
        const priorityDot = noteElement.querySelector('.priority-dot');
        
        // Save on edit
        titleElement.addEventListener('input', () => {
            saveNoteData(noteElement);
        });
        
        contentElement.addEventListener('input', () => {
            saveNoteData(noteElement);
        });
        
        // Delete note
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this note?')) {
                noteElement.style.animation = 'removeNote 0.5s ease-in forwards';
                setTimeout(() => {
                    noteElement.remove();
                    localStorage.removeItem(`note_${noteId}`);
                }, 500);
            }
        });
        
        // Complete checkbox
        if (completeCheckbox) {
            completeCheckbox.addEventListener('change', function() {
                noteElement.classList.toggle('opacity-70', this.checked);
                noteElement.classList.toggle('line-through', this.checked);
                noteElement.classList.toggle('bg-completed', this.checked);
                saveNoteData(noteElement);
            });
        }
        
        // Priority select
        if (prioritySelect) {
            prioritySelect.addEventListener('change', function() {
                const priority = this.value;
                noteElement.dataset.priority = priority;
                
                // Update background color
                noteElement.classList.remove('bg-priority-high', 'bg-priority-medium', 'bg-priority-low');
                noteElement.classList.add(`bg-priority-${priority}`);
                
                // Update priority dot color
                if (priorityDot) {
                    priorityDot.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-500');
                    priorityDot.classList.add(
                        priority === 'high' ? 'bg-red-500' :
                        priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    );
                }
                
                saveNoteData(noteElement);
                if (currentFilter !== 'all') filterNotes();
            });
        }
        
        // Reminder date
        if (dateInput) {
            dateInput.addEventListener('change', function() {
                const newDate = this.value;
                noteElement.dataset.date = newDate;
                noteElement.querySelector('.date-display').textContent = `Due: ${formatDate(newDate)}`;
                saveNoteData(noteElement);
            });
        }
        
        // Placeholder behavior
        [titleElement, contentElement].forEach(element => {
            element.addEventListener('focus', function() {
                if (this.textContent === this.dataset.placeholder) {
                    this.textContent = '';
                }
            });
            
            element.addEventListener('blur', function() {
                if (this.textContent.trim() === '') {
                    this.textContent = this.dataset.placeholder;
                }
            });
        });
    }
    
    function saveNoteData(noteElement) {
        const noteId = noteElement.dataset.id;
        const title = noteElement.querySelector('h2').textContent;
        const content = noteElement.querySelector('p').textContent;
        const priority = noteElement.dataset.priority || 'low';
        const date = noteElement.dataset.date || new Date().toISOString().split('T')[0];
        const completed = noteElement.querySelector('.complete-checkbox')?.checked || false;
        const type = noteElement.dataset.type || 'note';
        
        saveNote({
            id: noteId,
            title: title,
            content: content,
            priority: priority,
            date: date,
            completed: completed,
            type: type
        });
    }
    
    function saveNote(noteData) {
        localStorage.setItem(`note_${noteData.id}`, JSON.stringify(noteData));
    }
    
    function loadNotes() {
        const notes = [];
        
        // Get all notes from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('note_')) {
                const noteData = JSON.parse(localStorage.getItem(key));
                if (noteData.type === 'note') {
                    notes.push(noteData);
                }
            }
        }
        
        // Sort notes by date (newest first)
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create note elements
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
            
            noteElement.className = `note-card ${randomRotation} note-shadow hover:note-shadow-hover transition-all duration-300 transform hover:scale-105 hover:z-10 relative animate-fade-in bg-priority-${note.priority}`;
            noteElement.setAttribute('data-id', note.id);
            noteElement.setAttribute('data-priority', note.priority);
            noteElement.setAttribute('data-date', note.date);
            noteElement.setAttribute('data-type', 'note');
            
            if (note.completed) {
                noteElement.classList.add('opacity-70', 'line-through', 'bg-completed');
            }
            
            const priorityDotColor = 
                note.priority === 'high' ? 'bg-red-500' :
                note.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
            
            noteElement.innerHTML = `
                <div class="h-full flex flex-col p-4">
                    <div class="flex justify-between items-start mb-2">
                        <input type="checkbox" class="custom-checkbox complete-checkbox mr-2 mt-1" ${note.completed ? 'checked' : ''}>
                        <h2 class="text-xl font-bold flex-1 outline-none" contenteditable="true" data-placeholder="Title">${note.title || 'Title'}</h2>
                        <div class="priority-dot ${priorityDotColor}"></div>
                    </div>
                    <p class="flex-1 font-handwriting text-2xl outline-none mb-4" contenteditable="true" data-placeholder="Start writing...">${note.content || 'Start writing...'}</p>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <div class="date-display">${formatDate(note.date)}</div>
                        <div class="flex space-x-2">
                            <select class="priority-select bg-transparent border rounded px-2 py-1 text-xs">
                                <option value="low" ${note.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${note.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${note.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                            <button class="delete-note p-1 text-gray-400 hover:text-red-500 transition-colors">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            notesContainer.appendChild(noteElement);
            setupNoteEvents(noteElement, note.id);
        });
        
        // If no notes, add a welcome note
        if (notes.length === 0) {
            addNewNote();
        }
    }
    
    function loadReminders() {
        const reminders = [];
        
        // Get all reminders from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('note_')) {
                const reminderData = JSON.parse(localStorage.getItem(key));
                if (reminderData.type === 'reminder') {
                    reminders.push(reminderData);
                }
            }
        }
        
        // Sort reminders by date (soonest first)
        reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Create reminder elements
        reminders.forEach(reminder => {
            const reminderElement = document.createElement('div');
            const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
            
            reminderElement.className = `note-card ${randomRotation} note-shadow hover:note-shadow-hover transition-all duration-300 transform hover:scale-105 hover:z-10 relative bg-reminder animate-fade-in`;
            reminderElement.setAttribute('data-id', reminder.id);
            reminderElement.setAttribute('data-date', reminder.date);
            reminderElement.setAttribute('data-type', 'reminder');
            
            if (reminder.completed) {
                reminderElement.classList.add('opacity-70', 'line-through', 'bg-completed');
            }
            
            reminderElement.innerHTML = `
                <div class="h-full flex flex-col p-4">
                    <div class="flex justify-between items-start mb-2">
                        <input type="checkbox" class="custom-checkbox complete-checkbox mr-2 mt-1" ${reminder.completed ? 'checked' : ''}>
                        <h2 class="text-xl font-bold flex-1 outline-none" contenteditable="true" data-placeholder="Reminder">${reminder.title || 'Reminder'}</h2>
                    </div>
                    <p class="flex-1 font-handwriting text-2xl outline-none mb-4" contenteditable="true" data-placeholder="Reminder details...">${reminder.content || 'Reminder details...'}</p>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <div class="date-display">Due: ${formatDate(reminder.date)}</div>
                        <div class="flex space-x-2">
                            <input type="date" class="reminder-date bg-transparent border rounded px-2 py-1 text-xs" value="${reminder.date}">
                            <button class="delete-note p-1 text-gray-400 hover:text-red-500 transition-colors">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            remindersContainer.appendChild(reminderElement);
            setupNoteEvents(reminderElement, reminder.id);
        });
        
        // If no reminders, add a sample reminder
        if (reminders.length === 0) {
            addNewReminder();
        }
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});
