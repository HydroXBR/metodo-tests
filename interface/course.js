document.addEventListener('DOMContentLoaded', async function () {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    if (!Auth.isAluno()) {
        window.location.href = Auth.getDefaultRoute();
        return;
    }

    const user = Auth.currentUser;
    const API_BASE_URL = AUTH_CONFIG.API_BASE_URL;

    const urlParams = new URLSearchParams(window.location.search);
    const cursoId = urlParams.get('curso') || 'ps1';

    let currentState = {
        curso: cursoId,
        cursoInfo: null,
        progressoUsuario: null,
        materias: [],
        todasAulas: []
    };

    async function initPage() {
        try {
            await updateUserInfo();
            await loadCourseInfo();
            await loadUserProgress();
            await loadMaterias();
            renderSubjects();
            await loadRecentLessons();
            setupEventListeners();
        } catch (error) {
            console.error('Erro ao inicializar página:', error);
            showError('Erro ao carregar o curso. Tente novamente.');
        }
    }

    async function updateUserInfo() {
        try {
            const userNameElement = document.getElementById('userName');
            const userAvatarElement = document.getElementById('userAvatar');
            
            if (userNameElement) {
                userNameElement.textContent = Auth.getUserDisplayName();
            }
            
            if (userAvatarElement && user.profilePicture) {
                userAvatarElement.src = user.profilePicture;
            }

            if (!user.completename) {
                const response = await fetch(`${API_BASE_URL}/dashboard?userId=${user.id}`);
                const data = await response.json();

                if (data.success && data.data) {
                    user.completename = data.data.userInfo.completename;
                    user.profilePicture = data.data.userInfo.profilePicture;
                    Auth.saveUserToStorage();
                    
                    if (userNameElement) {
                        userNameElement.textContent = user.completename?.split(" ")[0] || 'Estudante';
                    }
                    if (userAvatarElement && user.profilePicture) {
                        userAvatarElement.src = user.profilePicture;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar informações do usuário:', error);
        }
    }

    async function loadCourseInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/course/${cursoId}?userId=${user.id}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Curso não encontrado');
            }

            currentState.cursoInfo = data.course;
            currentState.progressoUsuario = data.progress;
            
            updateCourseUI();
        } catch (error) {
            console.error('Erro ao carregar curso:', error);
            showError('Curso não encontrado ou não disponível.');
        }
    }

    function updateCourseUI() {
        const curso = currentState.cursoInfo;
        if (!curso) return;

        document.getElementById('courseTitle').textContent = curso.title;
        document.getElementById('courseProf').textContent = curso.professors?.join(', ') || 'Professores';
        document.getElementById('courseDescription').textContent = curso.description;
        document.getElementById('courseAbout').textContent = curso.about || curso.description;
        document.getElementById('totalHours').textContent = (curso.totalHours || 0) + 'h';
        document.getElementById('totalStudents').textContent = (curso.enrolledStudents || 0).toLocaleString();
        document.getElementById('totalAulas').textContent = curso.totalLessons || 0;

        const badge = document.getElementById('courseBadge');
        badge.className = `course-badge ${curso.type}`;
        badge.textContent = curso.type === 'enem' ? 'ENEM/MACRO' : 'PSC/SIS';

        document.getElementById('courseClasses').textContent = (curso.totalLessons || 0) + ' aulas';
    }

    async function loadUserProgress() {
        try {
            if (currentState.progressoUsuario) {
                updateProgressUI();
                updateDesempenhoInfo();
            }
        } catch (error) {
            console.error('Erro ao carregar progresso:', error);
        }
    }

    function updateProgressUI() {
        const progresso = currentState.progressoUsuario;
        const totalAulas = currentState.cursoInfo?.totalLessons || 1;
        const concluidas = progresso?.completedLessons?.length || 0;
        const progressoPercent = Math.round((concluidas / totalAulas) * 100);

        const circle = document.getElementById('progressCircle');
        if (circle) {
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (progressoPercent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }

        document.getElementById('progressPercent').textContent = progressoPercent + '%';
        document.getElementById('progressText').textContent = `${concluidas} de ${totalAulas} aulas concluídas`;
    }

    function updateDesempenhoInfo() {
        const progresso = currentState.progressoUsuario;

        document.getElementById('completedAulas').textContent = progresso?.completedLessons?.length || 0;

        if (progresso?.lastAccessed) {
            const lastAccess = new Date(progresso.lastAccessed);
            const hoje = new Date();
            const diffTime = Math.abs(hoje - lastAccess);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                document.getElementById('currentStreak').textContent = (progresso.streak || 1) + ' dias';
            } else if (diffDays === 1) {
                document.getElementById('currentStreak').textContent = (progresso.streak || 0) + ' dias';
            } else {
                document.getElementById('currentStreak').textContent = '0 dias';
            }

            document.getElementById('lastAccess').textContent = formatDate(lastAccess);
        } else {
            document.getElementById('currentStreak').textContent = '0 dias';
            document.getElementById('lastAccess').textContent = 'Hoje';
        }
    }

    function formatDate(date) {
        const hoje = new Date();
        const ontem = new Date(hoje);
        ontem.setDate(hoje.getDate() - 1);

        if (date.toDateString() === hoje.toDateString()) {
            return 'Hoje';
        } else if (date.toDateString() === ontem.toDateString()) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    }

    async function loadMaterias() {
        try {
            const materias = currentState.cursoInfo?.subjects || [];
            currentState.materias = [];

            for (const materia of materias) {
                try {
                    const response = await fetch(`${API_BASE_URL}/course/${cursoId}/subject/${materia.id}`);
                    const data = await response.json();

                    if (data.success) {
                        const materiaCompleta = {
                            ...materia,
                            aulas: data.lessons || [],
                            totalAulas: data.lessons.length,
                            progresso: calcularProgressoMateria(data.lessons)
                        };

                        currentState.materias.push(materiaCompleta);
                        currentState.todasAulas.push(...data.lessons.map(a => ({ ...a, materia: materia.id })));
                    }
                } catch (error) {
                    console.error(`Erro ao carregar matéria ${materia.id}:`, error);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar matérias:', error);
        }
    }

    function calcularProgressoMateria(aulas) {
        if (!aulas.length) return 0;

        const progresso = currentState.progressoUsuario;
        if (!progresso?.completedLessons) return 0;

        const completas = aulas.filter(aula =>
            progresso.completedLessons.includes(aula.id)
        ).length;

        return Math.round((completas / aulas.length) * 100);
    }

    function renderSubjects() {
        const subjectsGrid = document.getElementById('subjectsGrid');
        if (!subjectsGrid) return;

        subjectsGrid.innerHTML = '';

        if (currentState.materias.length === 0) {
            subjectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>Nenhuma matéria encontrada</h3>
                    <p>Este curso ainda não possui matérias cadastradas.</p>
                </div>
            `;
            return;
        }

        currentState.materias.forEach(materia => {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';
            subjectCard.dataset.materia = materia.id;

            subjectCard.innerHTML = `
                <div class="subject-header">
                    <div class="subject-icon">
                        <i class="${materia.icon || 'fas fa-book'}"></i>
                    </div>
                    <div class="subject-info">
                        <h3>${materia.name}</h3>
                        <div class="subject-stats">
                            <span><i class="fas fa-video"></i> ${materia.totalAulas} aulas</span>
                            <span><i class="fas fa-clock"></i> ${calcularDuracaoTotal(materia.aulas)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="subject-progress">
                    <div class="progress-label">
                        <span>Progresso </span>
                        <span>${materia.progresso}%</span>
                    </div>
                    <div class="subject-bar">
                        <div class="subject-bar-fill" style="width: ${materia.progresso}%"></div>
                    </div>
                </div>
                
                <div class="subject-actions">
                    <button class="btn-lessons" data-materia-id="${materia.id}">
                        <i class="fas fa-list"></i>
                        <span>Aulas</span>
                    </button>
                    <button class="btn-continue" data-materia-id="${materia.id}">
                        <i class="fas fa-play"></i>
                        <span>Continuar</span>
                    </button>
                </div>
            `;

            const btnLessons = subjectCard.querySelector('.btn-lessons');
            const btnContinue = subjectCard.querySelector('.btn-continue');

            btnLessons.addEventListener('click', function () {
                openLessonsModal(materia);
            });

            btnContinue.addEventListener('click', function () {
                continueSubject(materia);
            });

            subjectsGrid.appendChild(subjectCard);
        });
    }

    function calcularDuracaoTotal(aulas) {
        if (!aulas || !aulas.length) return '0min';

        const totalMinutos = aulas.reduce((total, aula) => total + (aula.duration || 0), 0);

        if (totalMinutos >= 60) {
            const horas = Math.floor(totalMinutos / 60);
            const minutos = totalMinutos % 60;
            return minutos > 0 ? `${horas}h${minutos}min` : `${horas}h`;
        }

        return `${totalMinutos}min`;
    }

    function formatDuration(minutes) {
        if (!minutes) return '--:--';
        if (minutes >= 60) {
            const horas = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${horas}:${mins.toString().padStart(2, '0')}h`;
        }
        return `${minutes}min`;
    }

    async function loadRecentLessons() {
        try {
            const recentLessonsGrid = document.getElementById('recentLessonsGrid');
            if (!recentLessonsGrid) return;

            const aulasOrdenadas = [...currentState.todasAulas]
                .sort((a, b) => a.order - b.order)
                .slice(0, 4);

            recentLessonsGrid.innerHTML = '';

            if (aulasOrdenadas.length === 0) {
                recentLessonsGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-video"></i>
                        <h3>Nenhuma aula disponível</h3>
                        <p>As aulas deste curso ainda não foram publicadas.</p>
                    </div>
                `;
                return;
            }

            aulasOrdenadas.forEach(aula => {
                const materia = currentState.materias.find(m => m.id === aula.materia);

                const lessonCard = document.createElement('div');
                lessonCard.className = 'recent-lesson-card';

                lessonCard.innerHTML = `
                    <div class="recent-lesson-header">
                        <div class="recent-lesson-icon">
                            <i class="${materia?.icon || 'fas fa-video'}"></i>
                        </div>
                        <div class="recent-lesson-title">
                            <h4>${aula.title}</h4>
                            <span>${materia?.name || 'Matéria'} • ${aula.professor || 'Professor'}</span>
                        </div>
                    </div>
                    <div class="recent-lesson-content">
                        <p>${aula.description || 'Sem descrição disponível.'}</p>
                        <div class="recent-lesson-meta">
                            <span class="recent-lesson-date">
                                <i class="fas fa-clock"></i> ${formatDuration(aula.duration)}
                            </span>
                            <button class="btn-watch" data-aula-id="${aula.id}">
                                <i class="fas fa-play"></i>
                                <span>Assistir Aula</span>
                            </button>
                        </div>
                    </div>
                `;

                const watchBtn = lessonCard.querySelector('.btn-watch');
                watchBtn.addEventListener('click', function () {
                    openLessonPage(aula.id);
                });

                recentLessonsGrid.appendChild(lessonCard);
            });
        } catch (error) {
            console.error('Erro ao carregar aulas recentes:', error);
        }
    }

    function openLessonPage(lessonId) {
        window.location.href = `class.html?id=${lessonId}&curso=${cursoId}`;
    }

    function setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (confirm('Tem certeza que deseja sair?')) {
                    Auth.logout(true);
                }
            });
        }

        const searchInput = document.getElementById('searchSubject');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                filterSubjects(this.value.toLowerCase());
            });
        }

        const viewAllBtn = document.getElementById('viewAllLessons');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector('.subjects-section').scrollIntoView({ behavior: 'smooth' });
            });
        }

        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', function () {
                this.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        const modal = document.getElementById('lessonsModal');
        const modalClose = document.getElementById('modalClose');
        
        if (modal) {
            if (modalClose) {
                modalClose.addEventListener('click', closeModal);
            }
            
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });
        }
    }

    function filterSubjects(searchTerm) {
        const subjectCards = document.querySelectorAll('.subject-card');

        subjectCards.forEach(card => {
            const materiaId = card.dataset.materia;
            const materia = currentState.materias.find(m => m.id === materiaId);

            if (!materia) {
                card.style.display = 'none';
                return;
            }

            const materiaName = materia.name.toLowerCase();

            if (searchTerm === '' || materiaName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    window.openLessonsModal = function(materia) {
        const modal = document.getElementById('lessonsModal');
        const modalTitle = document.getElementById('modalSubjectTitle');
        const lessonsList = document.getElementById('modalLessonsList');

        modalTitle.textContent = materia.name;
        lessonsList.innerHTML = '';

        if (!materia.aulas || materia.aulas.length === 0) {
            lessonsList.innerHTML = `
                <div class="modal-empty-state">
                    <i class="fas fa-video-slash"></i>
                    <h4>Nenhuma aula disponível</h4>
                    <p>Esta matéria ainda não possui aulas cadastradas.</p>
                </div>
            `;
        } else {
            const progresso = currentState.progressoUsuario;

            materia.aulas.forEach((aula, index) => {
                const isCompleted = progresso?.completedLessons?.includes(aula.id) || false;

                const lessonItem = document.createElement('div');
                lessonItem.className = 'modal-lesson-item';

                lessonItem.innerHTML = `
                    <div class="modal-lesson-info">
                        <h4>Aula ${index + 1}: ${aula.title}</h4>
                        <div class="modal-lesson-meta">
                            <span><i class="fas fa-user-graduate"></i> ${aula.professor || 'Professor'}</span>
                            <span><i class="fas fa-clock"></i> ${formatDuration(aula.duration)}</span>
                        </div>
                    </div>
                    <div class="modal-lesson-actions">
                        <span class="modal-lesson-duration">${formatDuration(aula.duration)}</span>
                        <button class="btn-watch-lesson ${isCompleted ? 'completed' : ''}" 
                                data-aula-id="${aula.id}"
                                title="${isCompleted ? 'Aula concluída' : 'Assistir aula'}">
                            <i class="fas fa-${isCompleted ? 'check' : 'play'}"></i>
                            <span>${isCompleted ? 'Concluída' : 'Assistir'}</span>
                        </button>
                    </div>
                `;

                const watchBtn = lessonItem.querySelector('.btn-watch-lesson');
                watchBtn.addEventListener('click', function () {
                    openLessonPage(aula.id);
                    closeModal();
                });

                lessonsList.appendChild(lessonItem);
            });
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.continueSubject = function(materia) {
        const progresso = currentState.progressoUsuario;
        const primeiraAulaNaoConcluida = materia.aulas.find(aula =>
            !progresso?.completedLessons?.includes(aula.id)
        );

        if (primeiraAulaNaoConcluida) {
            openLessonPage(primeiraAulaNaoConcluida.id);
        } else if (materia.aulas.length > 0) {
            openLessonPage(materia.aulas[materia.aulas.length - 1].id);
        }
    };

    window.closeModal = function() {
        const modal = document.getElementById('lessonsModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    initPage();
});

document.getElementsByClassName("logo-text")[0]?.addEventListener('click', function () {
    window.location.href = Auth.isAuthenticated() ? Auth.getDefaultRoute() : 'index.html';
});
