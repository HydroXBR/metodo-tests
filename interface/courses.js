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

    const userNameElement = document.getElementById('userName');
    const userAvatarElement = document.getElementById('userAvatar');
    const coursesGrid = document.getElementById('coursesGrid');
    const noCourses = document.getElementById('noCourses');

    if (userNameElement) userNameElement.textContent = Auth.getUserDisplayName();
    if (userAvatarElement && user.profilePicture) {
        userAvatarElement.src = user.profilePicture;
    }

    let userCourses = user.cursos || [];
    let availableCourses = [];
    let userStats = {};

    async function loadPageData() {
        try {
            const dashboardResponse = await fetch(`${API_BASE_URL}/dashboard?userId=${user.id}`);
            const dashboardResult = await dashboardResponse.json();

            if (dashboardResult.success) {
                userStats = dashboardResult.data.estatisticas || {};
                updateGeneralStats(userStats);

                if (dashboardResult.data.userInfo?.name && userNameElement) {
                    userNameElement.textContent = dashboardResult.data.userInfo.name.split(" ")[0];
                }
                if (dashboardResult.data.userInfo?.profilePicture && userAvatarElement) {
                    userAvatarElement.src = dashboardResult.data.userInfo.profilePicture;
                }
            }

            await loadUserCourses();
            await loadAvailableCourses();
            await loadCourseProgressDetails();

        } catch (error) {
            console.error('Erro ao carregar dados da página:', error);
            showError('Erro ao carregar dados. Tente novamente.');

            renderUserCourses(user.cursos || []);
        }
    }

    async function loadUserCourses() {
        try {
            const response = await fetch(`${API_BASE_URL}/user-cursos?userId=${user.id}`);
            const result = await response.json();

            if (result.success) {
                userCourses = result.cursos || [];
                user.cursos = userCourses;
                Auth.saveUserToStorage();
                
                renderUserCourses(userCourses);
            } else {
                throw new Error(result.message || 'Erro ao carregar cursos');
            }

        } catch (error) {
            console.error('Erro ao carregar cursos do usuário:', error);
            renderUserCourses(user.cursos || []);
        }
    }

    async function loadAvailableCourses() {
        try {
            const response = await fetch(`${API_BASE_URL}/cursos-disponiveis`);
            const result = await response.json();

            if (result.success) {
                availableCourses = result.cursos || [];
                renderAvailableCourses(availableCourses);
            }
        } catch (error) {
            console.error('Erro ao carregar cursos disponíveis:', error);
        }
    }

    async function loadCourseProgressDetails() {
        try {
            for (const cursoId of userCourses) {
                await loadCourseProgress(cursoId);
            }
        } catch (error) {
            console.error('Erro ao carregar progresso dos cursos:', error);
        }
    }

    async function loadCourseProgress(cursoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/course/${cursoId}?userId=${user.id}`);
            const result = await response.json();

            if (result.success) {
                updateCourseCard(cursoId, result.course, result.progress);
            }
        } catch (error) {
            console.error(`Erro ao carregar progresso do curso ${cursoId}:`, error);
        }
    }

    function renderUserCourses(cursosIds) {
        if (!coursesGrid) return;

        coursesGrid.innerHTML = '';

        if (!cursosIds || cursosIds.length === 0) {
            if (noCourses) noCourses.style.display = 'flex';
            return;
        }

        if (noCourses) noCourses.style.display = 'none';

        cursosIds.forEach(cursoId => {
            const loadingCard = createLoadingCard(cursoId);
            coursesGrid.appendChild(loadingCard);
        });
    }

    function updateCourseCard(cursoId, cursoData, progressData) {
        const cardId = `course-card-${cursoId}`;
        let card = document.getElementById(cardId);

        if (!card) {
            card = createCourseCard(cursoId, cursoData, progressData);
            coursesGrid.appendChild(card);
        } else {
            updateExistingCard(card, cursoData, progressData);
        }
    }

    function createCourseCard(cursoId, cursoData, progressData) {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.id = `course-card-${cursoId}`;

        const cursoInfo = getCourseInfo(cursoData);
        const progress = calculateProgress(progressData, cursoData);
        const stats = calculateCourseStats(progressData, cursoData);

        card.innerHTML = `
            <div class="course-header">
                <div class="course-icon ${cursoInfo.colorClass}">
                    <i class="${cursoInfo.icon}"></i>
                </div>
                <h3 class="course-title">${cursoData.title || cursoInfo.name}</h3>
                <p class="course-subtitle">${cursoInfo.description}</p>
                
                <div class="course-progress">
                    <div class="progress-label">
                        <span class="lbl">Progresso</span>
                        <span>${progress.percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                </div>
                
                <div class="course-stats">
                    <div class="stat-item">
                        <span>Aulas</span>
                        <strong>${stats.completedLessons}/${stats.totalLessons}</strong>
                    </div>
                    <div class="stat-item">
                        <span>Tempo</span>
                        <strong>${stats.totalHours}h</strong>
                    </div>
                    <div class="stat-item">
                        <span>Concluído</span>
                        <strong>${progress.percentage}%</strong>
                    </div>
                </div>
            </div>
            
            <div class="course-actions">
                <button class="btn-course primary" onclick="acessarCurso('${cursoId}')">
                    <i class="fas fa-play"></i>
                    <span>${progress.percentage === 100 ? 'Revisar' : 'Continuar'}</span>
                </button>
                <button class="btn-course secondary" onclick="verDetalhesCurso('${cursoId}')">
                    <i class="fas fa-info-circle"></i>
                    <span>Detalhes</span>
                </button>
            </div>
        `;

        return card;
    }

    function createLoadingCard(cursoId) {
        const card = document.createElement('div');
        card.className = 'course-card loading';
        card.id = `course-card-${cursoId}`;

        card.innerHTML = `
            <div class="course-header">
                <div class="course-icon loading">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <h3 class="course-title loading">Carregando...</h3>
                <p class="course-subtitle loading">Buscando informações do curso</p>
                
                <div class="course-progress">
                    <div class="progress-label">
                        <span>Progresso</span>
                        <span>0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill loading" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="course-stats">
                    <div class="stat-item">
                        <span>Aulas</span>
                        <strong>0/0</strong>
                    </div>
                    <div class="stat-item">
                        <span>Tempo</span>
                        <strong>0h</strong>
                    </div>
                    <div class="stat-item">
                        <span>Concluído</span>
                        <strong>0%</strong>
                    </div>
                </div>
            </div>
            
            <div class="course-actions">
                <button class="btn-course primary disabled">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Carregando...</span>
                </button>
                <button class="btn-course secondary disabled">
                    <i class="fas fa-info-circle"></i>
                    <span>Detalhes</span>
                </button>
            </div>
        `;

        return card;
    }

    function updateExistingCard(card, cursoData, progressData) {
        card.classList.remove('loading');

        const cursoInfo = getCourseInfo(cursoData);
        const progress = calculateProgress(progressData, cursoData);
        const stats = calculateCourseStats(progressData, cursoData);

        const title = card.querySelector('.course-title');
        if (title) {
            title.textContent = cursoData.title || cursoInfo.name;
            title.classList.remove('loading');
        }

        const subtitle = card.querySelector('.course-subtitle');
        if (subtitle) {
            subtitle.textContent = cursoInfo.description;
            subtitle.classList.remove('loading');
        }

        const icon = card.querySelector('.course-icon');
        if (icon) {
            icon.className = `course-icon ${cursoInfo.colorClass}`;
            icon.innerHTML = `<i class="${cursoInfo.icon}"></i>`;
        }

        const progressLabel = card.querySelector('.progress-label span:last-child');
        if (progressLabel) progressLabel.textContent = `${progress.percentage}%`;

        const progressFill = card.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress.percentage}%`;
            progressFill.classList.remove('loading');
        }

        const statItems = card.querySelectorAll('.stat-item strong');
        if (statItems.length >= 3) {
            statItems[0].textContent = `${stats.completedLessons}/${stats.totalLessons}`;
            statItems[1].textContent = `${stats.totalHours}h`;
            statItems[2].textContent = `${progress.percentage}%`;
        }

        const continueBtn = card.querySelector('.btn-course.primary');
        if (continueBtn) {
            continueBtn.className = 'btn-course primary';
            continueBtn.innerHTML = `<i class="fas fa-play"></i><span>${progress.percentage === 100 ? 'Revisar' : 'Continuar'}</span>`;
            continueBtn.onclick = () => acessarCurso(cursoData.courseId);
            continueBtn.disabled = false;
        }

        const detailsBtn = card.querySelector('.btn-course.secondary');
        if (detailsBtn) {
            detailsBtn.className = 'btn-course secondary';
            detailsBtn.onclick = () => verDetalhesCurso(cursoData.courseId);
            detailsBtn.disabled = false;
        }
    }

    function getCourseInfo(cursoData) {
        const baseInfo = {
            name: cursoData.title || 'Curso',
            description: cursoData.description || 'Sem descrição',
            icon: 'fas fa-book',
            colorClass: 'default'
        };

        if (cursoData.type === 'enem') {
            return {
                ...baseInfo,
                icon: 'fas fa-star',
                colorClass: 'enem',
                description: 'ENEM e vestibulares de todo o Brasil'
            };
        } else if (cursoData.type === 'psc') {
            return {
                ...baseInfo,
                icon: 'fas fa-university',
                colorClass: 'psc',
                description: 'Processo Seletivo Contínuo'
            };
        } else if (cursoData.type === 'sis') {
            return {
                ...baseInfo,
                icon: 'fas fa-graduation-cap',
                colorClass: 'sis',
                description: 'Sistema de Ingresso Seriado'
            };
        }

        return baseInfo;
    }

    function calculateProgress(progressData, cursoData) {
        const totalLessons = cursoData.totalLessons || 1;
        const completedLessons = progressData?.completedLessons?.length || 0;
        const percentage = Math.round((completedLessons / totalLessons) * 100);

        return {
            percentage,
            completedLessons,
            totalLessons
        };
    }

    function calculateCourseStats(progressData, cursoData) {
        const progress = calculateProgress(progressData, cursoData);
        const totalHours = Math.round((progress.completedLessons * 45) / 60);

        return {
            completedLessons: progress.completedLessons,
            totalLessons: progress.totalLessons,
            totalHours: totalHours || 0
        };
    }

    function updateGeneralStats(stats) {
        const elements = {
            'totalAulas': stats.aulasAssistidas || 0,
            'totalQuestoes': stats.totalQuestoes || 0,
            'taxaAcerto': (stats.taxaAcerto || 0) + '%',
            'totalCursos': userCourses.length || 0,
            'progressoGeral': calcularProgressoGeral() + '%',
            'diasSequencia': stats.diasSequencia || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        const questionTime = ((stats.totalQuestoes || 0) * 2) / 60;
        const classTime = ((stats.aulasAssistidas || 0) * 45) / 60;
        const totalTime = Math.round(questionTime + classTime);

        const tempoElement = document.getElementById('tempoEstudo');
        if (tempoElement) tempoElement.textContent = totalTime + 'h';
    }

    function calcularProgressoGeral() {
        if (userCourses.length === 0) return 0;
        return 0;
    }

    function renderAvailableCourses(cursos) {
        const availableGrid = document.getElementById('availableCourses');
        if (!availableGrid) return;

        availableGrid.innerHTML = '';

        if (!cursos || cursos.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-state';
            emptyMsg.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3>Parabéns!</h3>
                <p>Você já adquiriu todos os cursos disponíveis.</p>
            `;
            availableGrid.appendChild(emptyMsg);
            return;
        }

        cursos.forEach(curso => {
            const cursoElement = createAvailableCard(curso);
            availableGrid.appendChild(cursoElement);
        });
    }

    function createAvailableCard(curso) {
        const card = document.createElement('div');
        card.className = 'available-card';

        let icon = 'fas fa-book';
        let colorClass = '';

        if (curso.id?.includes('enem')) {
            icon = 'fas fa-star';
            colorClass = 'enem';
        } else if (curso.id?.includes('sis')) {
            icon = 'fas fa-graduation-cap';
            colorClass = 'sis';
        } else if (curso.id?.includes('psc')) {
            icon = 'fas fa-university';
            colorClass = 'psc';
        }

        card.innerHTML = `
            <i class="${icon} ${colorClass}"></i>
            <h4>${curso.nome}</h4>
            <p>${curso.descricao}</p>
            <div class="available-price">${curso.preco}</div>
            <button class="btn-available" onclick="adquirirCurso('${curso.id}')">
                <i class="fas fa-shopping-cart"></i>
                Adquirir Curso
            </button>
        `;

        return card;
    }

    window.acessarCurso = function (cursoId) {
        window.location.href = `course.html?curso=${cursoId}`;
    };

    window.verDetalhesCurso = async function (cursoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/course/${cursoId}?userId=${user.id}`);
            const result = await response.json();

            if (result.success) {
                const curso = result.course;
                const progress = result.progress;

                const completedLessons = progress?.completedLessons?.length || 0;
                const totalLessons = curso.totalLessons || 1;
                const progressPercent = Math.round((completedLessons / totalLessons) * 100);

                const message = `
                    Curso: ${curso.title}
                    Professor: ${curso.professors?.join(', ') || 'Não informado'}
                    Total de Aulas: ${totalLessons}
                    Aulas Concluídas: ${completedLessons}
                    Progresso: ${progressPercent}%
                    Duração Total: ${curso.totalHours || 0}h
                    Alunos: ${curso.enrolledStudents || 0}

                    Descrição: ${curso.description || 'Sem descrição disponível.'}
                `;

                alert(message);
            } else {
                alert('Não foi possível carregar os detalhes do curso.');
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do curso:', error);
            alert('Erro ao carregar detalhes do curso.');
        }
    };

    window.adquirirCurso = async function (cursoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/adicionar-curso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    curso: cursoId
                })
            });

            const result = await response.json();

            if (result.success) {
                showSuccess('Curso adicionado com sucesso!');

                user.cursos.push(cursoId);
                Auth.saveUserToStorage();

                setTimeout(() => {
                    loadPageData();
                }, 1500);
            } else {
                alert('Erro ao adicionar curso: ' + result.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao adicionar curso. Tente novamente.');
        }
    };

    function showError(message) {
        showNotification(message, 'error');
    }

    function showSuccess(message) {
        showNotification(message, 'success');
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f8d7da' : '#d4edda'};
            color: ${type === 'error' ? '#721c24' : '#155724'};
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    document.getElementById('exploreMoreBtn')?.addEventListener('click', () => {
        alert('Funcionalidade de explorar mais cursos em desenvolvimento.');
    });

    document.getElementById('getStartedBtn')?.addEventListener('click', () => {
        window.location.href = 'pricing.html';
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                Auth.logout(true);
            }
        });
    }

    // Menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            navMenu?.classList.toggle('active');
        });
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
        .course-card.loading { opacity: 0.7; }
        .course-card.loading .course-icon.loading { background: rgba(0,0,0,0.1); }
        .course-card.loading .course-title.loading,
        .course-card.loading .course-subtitle.loading {
            background: rgba(0,0,0,0.1);
            color: transparent;
            border-radius: 4px;
        }
        .course-card.loading .progress-fill.loading { animation: pulse 1.5s infinite; }
        .course-icon.enem { background: rgba(255,193,7,0.1); color: #FFC107; }
        .course-icon.psc { background: rgba(76,175,80,0.1); color: #4CAF50; }
        .course-icon.sis { background: rgba(33,150,243,0.1); color: #2196F3; }
        .course-icon.default { background: rgba(158,158,158,0.1); color: #9E9E9E; }
        .btn-course.disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
        .available-card .enem { color: #FFC107; }
        .available-card .psc { color: #4CAF50; }
        .available-card .sis { color: #2196F3; }
    `;
    document.head.appendChild(style);

    loadPageData();
});

document.getElementsByClassName("logo-text")[0]?.addEventListener('click', function () {
    window.location.href = Auth.isAuthenticated() ? Auth.getDefaultRoute() : 'index.html';
});
