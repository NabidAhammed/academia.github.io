document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let state = {
        activeView: 'dashboard',
        editingItem: null,
        items: {
            projects: [],
            assignments: [],
            classes: [],
            books: [],
            cts: [],
        }
    };

    // --- DOM ELEMENTS ---
    const mainContent = document.getElementById('main-content');
    const sidebarNav = document.getElementById('sidebar-nav');
    const modal = document.getElementById('item-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalFields = document.getElementById('modal-fields');
    const modalForm = document.getElementById('modal-form');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');

    // --- LOCAL STORAGE ---
    function loadStateFromLocalStorage() {
        const savedState = localStorage.getItem('academicPlannerState');
        if (savedState) {
            state = JSON.parse(savedState);
        }
    }

    function saveStateToLocalStorage() {
        localStorage.setItem('academicPlannerState', JSON.stringify(state));
    }

    // --- RENDERING LOGIC ---

    function render() {
        renderContent();
        updateSidebar();
    }

    function updateSidebar() {
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('hover:bg-gray-700');
            if (btn.dataset.view === state.activeView) {
                btn.classList.add('bg-blue-600');
                btn.classList.remove('hover:bg-gray-700');
            }
        });
    }

    function renderContent() {
        if (state.activeView === 'dashboard') {
            renderDashboard();
        } else {
            renderItemView(state.activeView);
        }
    }

    function renderDashboard() {
        const upcomingItems = Object.values(state.items).flat()
            .filter(item => item.deadline && new Date(item.deadline) > new Date())
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5);

        const pendingAssignments = state.items.assignments.filter(a => a.status !== 'done');
        const pendingProjects = state.items.projects.filter(p => p.status !== 'done');
        
        mainContent.innerHTML = `
            <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-gray-800 p-6 rounded-lg col-span-1 md:col-span-2">
                    <h2 class="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
                    ${upcomingItems.length > 0 ? `
                        <ul class="space-y-3">
                            ${upcomingItems.map(item => `
                                <li class="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                    <span>${item.title}</span>
                                    <span class="text-sm text-yellow-400">${new Date(item.deadline).toLocaleDateString()}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : `<p class="text-gray-400">No upcoming deadlines.</p>`}
                </div>
                <div class="bg-gray-800 p-6 rounded-lg">
                    <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div class="space-y-3">
                        <button data-modal-type="projects" class="quick-add-btn w-full text-left bg-blue-500 hover:bg-blue-600 p-3 rounded-md flex items-center"><i class="fa-solid fa-plus mr-2"></i> Add Project</button>
                        <button data-modal-type="assignments" class="quick-add-btn w-full text-left bg-green-500 hover:bg-green-600 p-3 rounded-md flex items-center"><i class="fa-solid fa-plus mr-2"></i> Add Assignment</button>
                        <button data-modal-type="classes" class="quick-add-btn w-full text-left bg-purple-500 hover:bg-purple-600 p-3 rounded-md flex items-center"><i class="fa-solid fa-plus mr-2"></i> Add Class</button>
                    </div>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg">
                    <h2 class="text-xl font-semibold mb-4">Pending Projects</h2>
                    ${pendingProjects.length > 0 ? `
                        <ul class="space-y-2">
                            ${pendingProjects.map(p => `<li>${p.title}</li>`).join('')}
                        </ul>
                    ` : `<p class="text-gray-400">No pending projects. Great job!</p>`}
                </div>
                <div class="bg-gray-800 p-6 rounded-lg">
                    <h2 class="text-xl font-semibold mb-4">Pending Assignments</h2>
                    ${pendingAssignments.length > 0 ? `
                        <ul class="space-y-2">
                            ${pendingAssignments.map(a => `<li>${a.title}</li>`).join('')}
                        </ul>
                    ` : `<p class="text-gray-400">No pending assignments. All clear!</p>`}
                </div>
            </div>
        `;
    }

    function renderItemView(viewType) {
        const items = state.items[viewType] || [];
        const title = viewType === 'books' ? 'Books & Lectures' : viewType.charAt(0).toUpperCase() + viewType.slice(1);
        
        mainContent.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold">${title}</h1>
                    <button data-modal-type="${viewType}" class="add-item-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                        <i class="fa-solid fa-plus mr-2"></i> Add ${viewType === 'books' ? 'Item' : title.slice(0, -1)}
                    </button>
                </div>
                <div class="bg-gray-800 rounded-lg p-4">
                    ${items.length > 0 ? `
                        <ul class="space-y-4">
                            ${items.map(item => `
                                <li class="bg-gray-700 p-4 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div class="flex-1 mb-3 md:mb-0">
                                        <p class="font-bold text-lg">${item.title || ''}</p>
                                        ${item.course ? `<p class="text-sm text-gray-400">Course: ${item.course}</p>` : ''}
                                        ${item.deadline ? `<p class="text-sm text-yellow-400">Deadline: ${new Date(item.deadline).toLocaleDateString()}</p>` : ''}
                                        ${item.day ? `<p class="text-sm text-cyan-400">${item.day} at ${item.time}</p>` : ''}
                                        ${item.semester ? `<p class="text-sm text-gray-400">Semester: ${item.semester}</p>` : ''}
                                        ${item.fileName ? `<p class="text-sm text-blue-400 truncate">File: ${item.fileName}</p>` : ''}
                                        ${item.status ? `<p class="text-sm ${item.status === 'done' ? 'text-green-400' : 'text-orange-400'}">Status: ${item.status}</p>` : ''}
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        ${item.fileURL ? `<a href="${item.fileURL}" download="${item.fileName}" class="p-2 bg-blue-500 hover:bg-blue-600 rounded-full inline-block"><i class="fa-solid fa-download"></i></a>` : ''}
                                        ${(viewType === 'projects' || viewType === 'assignments') ? `
                                            <button data-action="toggle" data-id="${item.id}" data-type="${viewType}" class="p-2 rounded-full ${item.status === 'done' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}">
                                                <i class="fa-solid ${item.status === 'done' ? 'fa-xmark' : 'fa-check'}"></i>
                                            </button>
                                        ` : ''}
                                        <button data-action="edit" data-id="${item.id}" data-type="${viewType}" class="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full"><i class="fa-solid fa-pen"></i></button>
                                        <button data-action="delete" data-id="${item.id}" data-type="${viewType}" class="p-2 bg-red-500 hover:bg-red-600 rounded-full"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    ` : `<p class="text-gray-400 text-center py-8">No ${viewType} yet. Add one to get started!</p>`}
                </div>
            </div>
        `;
    }

    function renderModalFields(type) {
        const item = state.editingItem || {};
        const commonFields = `
            <div class="mb-4">
                <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input type="text" name="title" id="title" value="${item.title || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2" required />
            </div>`;

        const courseAndDeadlineFields = `
            <div class="mb-4">
                <label for="course" class="block text-sm font-medium text-gray-300 mb-1">Course</label>
                <input type="text" name="course" id="course" value="${item.course || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2" />
            </div>
            <div class="mb-4">
                <label for="deadline" class="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                <input type="date" name="deadline" id="deadline" value="${item.deadline || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2" />
            </div>`;
        
        switch (type) {
            case 'projects':
            case 'assignments':
            case 'cts':
                modalFields.innerHTML = commonFields + courseAndDeadlineFields;
                break;
            case 'classes':
                modalFields.innerHTML = `
                    ${commonFields}
                    <div class="mb-4">
                        <label for="day" class="block text-sm font-medium text-gray-300 mb-1">Day of Week</label>
                        <select name="day" id="day" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2">
                            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `<option value="${day}" ${item.day === day ? 'selected' : ''}>${day}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="time" class="block text-sm font-medium text-gray-300 mb-1">Time</label>
                        <input type="time" name="time" id="time" value="${item.time || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2" />
                    </div>`;
                break;
            case 'books':
                modalFields.innerHTML = `
                    ${commonFields}
                    <div class="mb-4">
                        <label for="semester" class="block text-sm font-medium text-gray-300 mb-1">Semester</label>
                        <input type="text" name="semester" id="semester" value="${item.semester || ''}" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2" />
                    </div>
                    <div class="mb-4">
                        <label for="file" class="block text-sm font-medium text-gray-300 mb-1">Upload File (PDF, DOCX, etc.)</label>
                        <input type="file" name="file" id="file" class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        ${item.fileName ? `<p class="text-xs text-gray-400 mt-1">Current file: ${item.fileName}</p>` : ''}
                    </div>`;
                break;
            default:
                modalFields.innerHTML = commonFields;
        }
    }

    // --- EVENT LISTENERS & LOGIC ---

    sidebarNav.addEventListener('click', (e) => {
        const button = e.target.closest('.nav-button');
        if (button) {
            state.activeView = button.dataset.view;
            render();
        }
    });

    mainContent.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-item-btn');
        const quickAddBtn = e.target.closest('.quick-add-btn');
        const actionBtn = e.target.closest('[data-action]');
        
        if (addBtn || quickAddBtn) {
            const type = addBtn?.dataset.modalType || quickAddBtn?.dataset.modalType;
            openModal(type);
        } else if (actionBtn) {
            const { action, id, type } = actionBtn.dataset;
            const item = state.items[type].find(i => i.id === id);
            if (action === 'delete') {
                handleDeleteItem(type, item);
            } else if (action === 'edit') {
                openModal(type, item);
            } else if (action === 'toggle') {
                toggleItemStatus(type, id, item.status);
            }
        }
    });

    function openModal(type, item = null) {
        state.editingItem = item;
        modal.dataset.type = type;
        const titleText = type === 'books' ? 'Book or Lecture' : type.slice(0, -1);
        modalTitle.textContent = `${item ? 'Edit' : 'Add'} ${titleText}`;
        modalSubmitBtn.textContent = item ? 'Update' : 'Add';
        renderModalFields(type);
        modal.classList.remove('hidden');
    }

    function closeModal() {
        state.editingItem = null;
        modal.classList.add('hidden');
        modalForm.reset();
    }

    modalCancelBtn.addEventListener('click', closeModal);

    modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const type = modal.dataset.type;
        const file = data.file.size > 0 ? data.file : null;
        
        if (state.editingItem) {
            await handleUpdateItem(type, { ...state.editingItem, ...data }, file);
        } else {
            await handleAddItem(type, data, file);
        }
    });

    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function handleAddItem(type, data, file) {
        const newItem = {
            ...data,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        if (type === 'projects' || type === 'assignments') {
            newItem.status = 'pending';
        }

        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File is too large. Please upload files smaller than 5MB.");
                return;
            }
            newItem.fileURL = await fileToDataUrl(file);
            newItem.fileName = file.name;
        }
        
        state.items[type].push(newItem);
        saveStateToLocalStorage();
        closeModal();
        render();
    }

    async function handleUpdateItem(type, data, file) {
        const updatedItem = { ...data };
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File is too large. Please upload files smaller than 5MB.");
                return;
            }
            updatedItem.fileURL = await fileToDataUrl(file);
            updatedItem.fileName = file.name;
        }
        
        state.items[type] = state.items[type].map(i => i.id === updatedItem.id ? updatedItem : i);
        saveStateToLocalStorage();
        closeModal();
        render();
    }

    function handleDeleteItem(type, itemToDelete) {
        if (window.confirm('Are you sure you want to delete this item?')) {
            state.items[type] = state.items[type].filter(item => item.id !== itemToDelete.id);
            saveStateToLocalStorage();
            render();
        }
    }

    function toggleItemStatus(type, id, currentStatus) {
        state.items[type] = state.items[type].map(item =>
            item.id === id ? { ...item, status: currentStatus === 'done' ? 'pending' : 'done' } : item
        );
        saveStateToLocalStorage();
        render();
    }

    // --- INITIALIZATION ---
    loadStateFromLocalStorage();
    render();
});
