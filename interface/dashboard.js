document.addEventListener('DOMContentLoaded', function () {
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
    const welcomeNameElement = document.getElementById('welcomeName');
    const userAvatarElement = document.getElementById('userAvatar');

    let currentUser = null;
    let materiaisRecentes = [];
    let todosMateriais = [];
    let currentPage = 1;
    let totalPages = 1;
    let currentFilter = { search: '', type: '' };

    async function loadMateriaisRecentes() {
        try {
            const user = Auth.currentUser;
            if (!user) return;

            const serie = user.turma || 1;

            const response = await fetch(`${API_BASE_URL}/materiais/aluno?serie=${serie}&limit=6`);
            const data = await response.json();

            if (data.success) {
                materiaisRecentes = data.materiais || [];
                renderMateriaisRecentes();
            }
        } catch (error) {
            console.error('Erro ao carregar materiais recentes:', error);
        }
    }

    function renderMateriaisRecentes() {
        const container = document.getElementById('materiaisRecentesList');
        if (!container) return;

        if (!materiaisRecentes || materiaisRecentes.length === 0) {
            container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-file-pdf"></i>
                <p>Nenhum material disponível para sua série</p>
            </div>
        `;
            return;
        }

        container.innerHTML = materiaisRecentes.map(material => createMaterialCard(material)).join('');
    }

    function createMaterialCard(material) {
        const typeNames = {
            'pdf': 'PDF',
            'apostila': 'Apostila',
            'slide': 'Slides',
            'exercicio': 'Lista',
            'video': 'Vídeo',
            'link': 'Link'
        };

        const description = material.description
            ? (material.description.length > 80 ? material.description.substring(0, 80) + '...' : material.description)
            : '';

        const tags = material.tags ? material.tags.slice(0, 3) : [];

        return `
        <div class="material-card">
            <div class="material-header">
                <span class="material-badge ${material.type}">${typeNames[material.type] || material.type}</span>
                <span style="font-size: 0.7rem; color: var(--gray-500);">
                    <i class="far fa-clock"></i> ${formatDate(material.createdAt)}
                </span>
            </div>
            <h4 class="material-title">${material.title}</h4>
            ${description ? `<p class="material-description">${description}</p>` : ''}
            <div class="material-meta">
                <span><i class="fas fa-user"></i> ${material.professorName || 'Professor'}</span>
                <span><i class="fas fa-file"></i> ${material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}</span>
            </div>
            ${tags.length > 0 ? `
                <div class="material-tags">
                    ${tags.map(tag => `<span class="material-tag">${tag}</span>`).join('')}
                    ${material.tags && material.tags.length > 3 ? `<span class="material-tag">+${material.tags.length - 3}</span>` : ''}
                </div>
            ` : ''}
            <div class="material-actions">
                <a href="${material.url}" target="_blank" class="btn-material">
                    <i class="fas fa-external-link-alt"></i> Acessar
                </a>
            </div>
        </div>
    `;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Data desconhecida';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data inválida';

            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data inválida';
        }
    }

    async function carregarTodosMateriais(page = 1) {
        try {
            const user = Auth.currentUser;
            const serie = user.turma || 1;

            const url = new URL(`${API_BASE_URL}/materiais/aluno`);
            url.searchParams.append('serie', serie);
            url.searchParams.append('page', page);
            url.searchParams.append('limit', 10);

            if (currentFilter.type) {
                // não temos filtro por tipo no backend: frontend
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                todosMateriais = data.materiais;
                currentPage = data.pagination.page;
                totalPages = data.pagination.pages;
                aplicarFiltrosLocais();
            }
        } catch (error) {
            console.error('Erro ao carregar todos os materiais:', error);
        }
    }

    function aplicarFiltrosLocais() {
        let materiaisFiltrados = [...todosMateriais];

        if (currentFilter.type) {
            materiaisFiltrados = materiaisFiltrados.filter(m => m.type === currentFilter.type);
        }

        if (currentFilter.search) {
            const searchLower = currentFilter.search.toLowerCase();
            materiaisFiltrados = materiaisFiltrados.filter(m =>
                m.title.toLowerCase().includes(searchLower) ||
                (m.description && m.description.toLowerCase().includes(searchLower)) ||
                (m.tags && m.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        renderMateriaisModal(materiaisFiltrados);
    }

    function renderMateriaisModal(materiais) {
        const container = document.getElementById('materiaisList');
        if (!container) return;

        if (!materiais || materiais.length === 0) {
            container.innerHTML = `
            <div class="empty-state-materiais">
                <i class="fas fa-file-pdf"></i>
                <p>Nenhum material encontrado</p>
            </div>
        `;
            return;
        }

        container.innerHTML = materiais.map(material => `
        <div class="material-item-modal">
            <div class="material-item-header">
                <span class="material-badge ${material.type}">${getTypeName(material.type)}</span>
                <span style="font-size: 0.8rem; color: var(--gray-500);">
                    <i class="far fa-calendar"></i> ${formatDate(material.createdAt)}
                </span>
            </div>
            <div class="material-item-content">
                <h4 class="material-item-title">${material.title}</h4>
                ${material.description ? `<p style="color: var(--gray-600); font-size: 0.9rem;">${material.description}</p>` : ''}
                <div class="material-item-meta">
                    <span><i class="fas fa-user"></i> ${material.professorName || 'Professor'}</span>
                    <span><i class="fas fa-file"></i> ${material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}</span>
                    <span><i class="fas fa-eye"></i> ${material.views || 0} visualizações</span>
                </div>
                ${material.tags && material.tags.length > 0 ? `
                    <div class="material-item-tags">
                        ${material.tags.map(tag => `<span class="material-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="material-item-actions">
                <a href="${material.url}" target="_blank" class="btn-access">
                    <i class="fas fa-external-link-alt"></i> Acessar Material
                </a>
            </div>
        </div>
    `).join('');

        renderPaginacao();
    }

    function renderPaginacao() {
        const container = document.getElementById('materiaisPagination');
        if (!container) return;

        let html = '';

        html += `<button class="pagination-btn" onclick="mudarPagina(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="mudarPagina(${i})">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<span class="pagination-btn disabled">...</span>`;
            }
        }

        html += `<button class="pagination-btn" onclick="mudarPagina(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;

        container.innerHTML = html;
    }

    function mudarPagina(page) {
        if (page < 1 || page > totalPages) return;
        carregarTodosMateriais(page);
    }

    function getTypeName(type) {
        const types = {
            'pdf': 'PDF',
            'apostila': 'Apostila',
            'slide': 'Slides',
            'exercicio': 'Lista',
            'video': 'Vídeo',
            'link': 'Link'
        };
        return types[type] || type;
    }

    function formatFileSize(bytes) {
        if (!bytes) return 'N/A';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function setupMateriaisModal() {
        const modal = document.getElementById('materiaisModal');
        const closeBtn = document.getElementById('closeMateriaisModal');
        const viewAllBtn = document.getElementById('viewAllMaterialsBtn');

        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                if (modal) {
                    modal.classList.add('active');
                    carregarTodosMateriais(1);
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        const searchInput = document.getElementById('searchMaterial');
        const filterType = document.getElementById('filterMaterialType');

        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                currentFilter.search = searchInput.value;
                aplicarFiltrosLocais();
            }, 300));
        }

        if (filterType) {
            filterType.addEventListener('change', () => {
                currentFilter.type = filterType.value;
                aplicarFiltrosLocais();
            });
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async function loadDashboardData() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard?userId=${user.id}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao carregar dashboard');
            }

            const data = result.data;

            const cursosResponse = await fetch(`${API_BASE_URL}/user-cursos?userId=${user.id}`);
            const cursosResult = await cursosResponse.json();

            const cursosDisponiveisResponse = await fetch(`${API_BASE_URL}/cursos-disponiveis`);
            const cursosDisponiveisResult = await cursosDisponiveisResponse.json();

            updateUserInfo(data.userInfo);

            updateEstatisticas(data.estatisticas);

            await renderCursosUsuario(cursosResult);
            renderQuestoesRecentes(data.questoesRecentes);
            renderAulasRecentes(data.aulasRecentes);
            renderGrafico(data.questoesPorDia);
            updateRedacaoStats(data.redacao);

            if (cursosDisponiveisResult.success) {
                renderCursosDisponiveis(cursosDisponiveisResult.cursos);
            }

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            showError('Erro ao carregar dados. Tente novamente.');

            usarDadosMockados();
        }
    }

    function updateUserInfo(userInfo) {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && userInfo.profilePicture) {
            userAvatar.src = userInfo.profilePicture;
        }

        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = userInfo.name.split(" ")[0] || 'Usuário';
        }
    }

    async function renderCursosUsuario(cursosResult) {
        const cursosList = document.getElementById('cursosList');
        const noCourses = document.getElementById('noCourses');

        if (!cursosList) return;

        cursosList.innerHTML = '';

        if (!cursosResult.success || !cursosResult.cursos || cursosResult.cursos.length === 0) {
            if (noCourses) noCourses.style.display = 'flex';
            return;
        }

        if (noCourses) noCourses.style.display = 'none';

        for (const cursoId of cursosResult.cursos) {
            try {
                const response = await fetch(`${API_BASE_URL}/course/${cursoId}?userId=${user.id}`);
                const result = await response.json();

                if (result.success) {
                    const curso = result.course;
                    const progress = result.progress;

                    const cursoElement = createCursoElement(curso, progress);
                    cursosList.appendChild(cursoElement);
                } else {
                    const cursoElement = createCursoElementBasico(cursoId);
                    cursosList.appendChild(cursoElement);
                }
            } catch (error) {
                console.error(`Erro ao carregar curso ${cursoId}:`, error);
                const cursoElement = createCursoElementBasico(cursoId);
                cursosList.appendChild(cursoElement);
            }
        }
    }

    function createCursoElement(curso, progress) {
        const cursoElement = document.createElement('div');
        cursoElement.className = 'curso-item';

        let iconClass = 'psc';
        let icon = 'fas fa-book';
        let tipoTexto = 'Curso';

        if (curso.type === 'enem') {
            iconClass = 'enem';
            icon = 'fas fa-star';
            tipoTexto = 'ENEM/Macro';
        } else if (curso.type === 'sis') {
            iconClass = 'sis';
            icon = 'fas fa-graduation-cap';
            tipoTexto = 'SIS';
        } else if (curso.type === 'psc') {
            iconClass = 'psc';
            icon = 'fas fa-university';
            tipoTexto = 'PSC';
        }

        const totalAulas = curso.totalLessons || 1;
        const aulasConcluidas = progress?.completedLessons?.length || 0;
        const progressoPercent = Math.round((aulasConcluidas / totalAulas) * 100);

        cursoElement.innerHTML = `
            <div class="curso-icon ${iconClass}">
                <i class="${icon}"></i>
            </div>
            <div class="curso-info">
                <h4>${curso.title}</h4>
                <p>${tipoTexto}</p>
                <div class="curso-progress">
                    <div class="curso-progress-bar">
                        <div class="curso-progress-fill" style="width: ${progressoPercent}%"></div>
                    </div>
                    <span class="curso-progress-text">${progressoPercent}% concluído</span>
                </div>
            </div>
            <button class="curso-action" onclick="acessarCurso('${curso.courseId}')">
                <i class="fas fa-play"></i> Continuar
            </button>
        `;

        return cursoElement;
    }

    function createCursoElementBasico(cursoId) {
        const cursoElement = document.createElement('div');
        cursoElement.className = 'curso-item';

        let iconClass = 'psc';
        let icon = 'fas fa-book';
        let cursoNome = cursoId;

        if (cursoId.includes('enem')) {
            iconClass = 'enem';
            icon = 'fas fa-star';
            cursoNome = 'ENEM/Macro';
        } else if (cursoId.includes('sis')) {
            iconClass = 'sis';
            icon = 'fas fa-graduation-cap';
        } else if (cursoId.includes('psc')) {
            iconClass = 'psc';
            icon = 'fas fa-university';
        }

        cursoElement.innerHTML = `
            <div class="curso-icon ${iconClass}">
                <i class="${icon}"></i>
            </div>
            <div class="curso-info">
                <h4>${cursoNome}</h4>
                <p>Curso ativo</p>
                <div class="curso-progress">
                    <div class="curso-progress-bar">
                        <div class="curso-progress-fill" style="width: 0%"></div>
                    </div>
                    <span class="curso-progress-text">0% concluído</span>
                </div>
            </div>
            <button class="curso-action" onclick="acessarCurso('${cursoId}')">
                <i class="fas fa-play"></i> Acessar
            </button>
        `;

        return cursoElement;
    }

    function renderCursosDisponiveis(cursosDisponiveis) {
        const courseOptions = document.querySelector('.course-options');
        if (!courseOptions) return;

        courseOptions.innerHTML = '';

        cursosDisponiveis.forEach(curso => {
            const isEnrolled = user.cursos?.includes(curso.id);

            const courseOption = document.createElement('div');
            courseOption.className = 'course-option';
            courseOption.innerHTML = `
                <div class="option-header">
                    <i class="fas fa-book"></i>
                    <h4>${curso.nome}</h4>
                    ${isEnrolled ? '<span class="course-badge">Matriculado</span>' : ''}
                </div>
                <p>${curso.descricao}</p>
                <ul>
                    <li>${curso.preco}</li>
                    <li>Acesso imediato</li>
                    <li>Suporte 24h</li>
                </ul>
                <button class="btn-add-course ${isEnrolled ? 'disabled' : ''}" 
                        data-curso-id="${curso.id}"
                        ${isEnrolled ? 'disabled' : ''}>
                    <span>${isEnrolled ? 'Matriculado' : 'Adicionar'}</span>
                    <i class="fas fa-${isEnrolled ? 'check' : 'shopping-cart'}"></i>
                </button>
            `;

            courseOptions.appendChild(courseOption);
        });

        document.querySelectorAll('.btn-add-course:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', async function () {
                const cursoId = this.dataset.cursoId;
                await adicionarCurso(cursoId, this);
            });
        });
    }

    async function adicionarCurso(cursoId, buttonElement) {
        try {
            const originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
            buttonElement.disabled = true;

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
                if (!user.cursos) user.cursos = [];
                user.cursos.push(cursoId);
                localStorage.setItem('user', JSON.stringify(user));

                showSuccess('Curso adicionado com sucesso!');

                buttonElement.innerHTML = '<span>Matriculado</span><i class="fas fa-check"></i>';
                buttonElement.className = 'btn-add-course disabled';
                buttonElement.disabled = true;

                setTimeout(() => {
                    const courseModal = document.getElementById('courseModal');
                    if (courseModal) courseModal.classList.remove('active');
                    loadCursosUsuario();
                }, 1500);

            } else {
                alert('Erro ao adicionar curso: ' + result.message);
                buttonElement.innerHTML = originalText;
                buttonElement.disabled = false;
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao adicionar curso');
            buttonElement.innerHTML = originalText;
            buttonElement.disabled = false;
        }
    }

    async function loadCursosUsuario() {
        try {
            const response = await fetch(`${API_BASE_URL}/user-cursos?userId=${user.id}`);
            const result = await response.json();

            if (result.success) {
                await renderCursosUsuario(result);
            }
        } catch (error) {
            console.error('Erro ao carregar cursos do usuário:', error);
        }
    }

    function updateEstatisticas(estatisticas) {
        const elements = {
            'correctQuestions': estatisticas.questoesCorretas,
            'totalQuestions': estatisticas.totalQuestoes,
            'watchedClasses': estatisticas.aulasAssistidas,
            'accuracyRate': estatisticas.taxaAcerto + '%',
            'todayQuestions': estatisticas.questoesHoje,
            'weekQuestions': estatisticas.questoesSemana
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        const acertosSemana = estatisticas.acertosSemana || 0;
        const percentualAcertos = estatisticas.questoesSemana > 0 ?
            Math.round((acertosSemana / estatisticas.questoesSemana) * 100) : 0;

        const weekCorrectElement = document.getElementById('weekCorrect');
        if (weekCorrectElement) weekCorrectElement.textContent = percentualAcertos + '%';
    }

    function renderQuestoesRecentes(questoes) {
        const recentQuestions = document.getElementById('recentQuestions');
        if (!recentQuestions) return;

        recentQuestions.innerHTML = '';

        if (!questoes || questoes.length === 0) {
            recentQuestions.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <p>Nenhuma questão respondida ainda</p>
                    <button class="btn-small" onclick="iniciarPratica()">Começar a praticar</button>
                </div>
            `;
            return;
        }

        const questoesRecentes = questoes.slice(0, 5);

        questoesRecentes.forEach((q, index) => {
            const date = new Date(q.date);
            const timeAgo = getTimeAgo(date);

            const questionElement = document.createElement('div');
            questionElement.className = 'question-item';
            questionElement.innerHTML = `
                <div class="question-status ${q.correct ? 'correct' : 'incorrect'}"></div>
                <div class="question-content">
                    <h4>${q.materia || 'Questão'} - Resposta ${q.answer}</h4>
                    <span>${timeAgo} • ${q.correct ? 'Acertou' : 'Errou'}</span>
                </div>
            `;

            recentQuestions.appendChild(questionElement);
        });
    }

    function renderAulasRecentes(aulas) {
        const upcomingClasses = document.getElementById('upcomingClasses');
        const noClasses = document.getElementById('noClasses');

        if (!upcomingClasses) return;

        upcomingClasses.innerHTML = '';

        if (!aulas || aulas.length === 0) {
            if (noClasses) noClasses.style.display = 'flex';
            return;
        }

        if (noClasses) noClasses.style.display = 'none';

        const aulasOrdenadas = aulas
            .sort((a, b) => b.date - a.date)
            .slice(0, 3);

        aulasOrdenadas.forEach(aula => {
            const date = new Date(aula.date);
            const day = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
            const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const aulaElement = document.createElement('div');
            aulaElement.className = 'aula-item';
            aulaElement.innerHTML = `
                <div class="aula-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="aula-info">
                    <h4>${aula.course || 'Curso'}</h4>
                    <p>Aula ${aula.classId || 'Recente'}</p>
                </div>
                <div class="aula-time">
                    ${day}<br>${time}
                </div>
            `;

            upcomingClasses.appendChild(aulaElement);
        });
    }

    function renderGrafico(questoesPorDia) {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        const chartCanvas = ctx.getContext('2d');

        if (window.performanceChartInstance) {
            window.performanceChartInstance.destroy();
        }

        if (!questoesPorDia || questoesPorDia.length === 0) {
            const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const hoje = new Date();
            const diaSemana = hoje.getDay();

            questoesPorDia = diasSemana.map((dia, index) => ({
                data: dia,
                total: Math.floor(Math.random() * 20) + 5,
                corretas: Math.floor(Math.random() * 15) + 3
            }));

            const rotated = [...questoesPorDia.slice(diaSemana), ...questoesPorDia.slice(0, diaSemana)];
            questoesPorDia = rotated;
        }

        window.performanceChartInstance = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: questoesPorDia.map(d => d.data),
                datasets: [
                    {
                        label: 'Questões Feitas',
                        data: questoesPorDia.map(d => d.total),
                        borderColor: '#070738',
                        backgroundColor: 'rgba(7, 7, 56, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Questões Corretas',
                        data: questoesPorDia.map(d => d.corretas),
                        borderColor: '#FE0000',
                        backgroundColor: 'rgba(254, 0, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#343A40',
                            font: {
                                size: 12
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#343A40',
                            stepSize: 5
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#343A40'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }

    function updateRedacaoStats(redacao) {
        document.getElementById('redacoesCount').textContent = redacao.total || 0;
        document.getElementById('avgGrade').textContent = redacao.mediaNota || '0.0';

        const correcoesRestantes = redacao.correcoesRestantes || 0;
        const totalCorrecoes = 4;
        const progress = totalCorrecoes > 0 ?
            Math.round(((totalCorrecoes - correcoesRestantes) / totalCorrecoes) * 100) : 0;

        document.getElementById('correctionsLeft').textContent =
            `${correcoesRestantes}/${totalCorrecoes}`;

        const progressFill = document.getElementById('correctionsProgress');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora mesmo';
        if (minutes < 60) return `${minutes} min atrás`;
        if (hours < 24) return `${hours} h atrás`;
        return `${days} dias atrás`;
    }

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

    function usarDadosMockados() {
        const mockData = {
            userInfo: {
                name: user.name || 'Estudante',
                email: user.email || '',
                turma: user.turma || 1,
                cursos: user.cursos || []
            },
            estatisticas: {
                totalQuestoes: 0,
                questoesCorretas: 0,
                taxaAcerto: 0,
                aulasAssistidas: 0,
                questoesSemana: 0,
                questoesHoje: 0,
                acertosSemana: 0
            },
            questoesRecentes: [],
            aulasRecentes: [],
            questoesPorDia: [],
            redacao: {
                total: 0,
                mediaNota: 0,
                correcoesRestantes: 4
            }
        };

        updateUserInfo(mockData.userInfo);
        updateEstatisticas(mockData.estatisticas);
        renderCursosUsuario({ success: true, cursos: mockData.userInfo.cursos });
        renderQuestoesRecentes(mockData.questoesRecentes);
        renderAulasRecentes(mockData.aulasRecentes);
        renderGrafico(mockData.questoesPorDia);
        updateRedacaoStats(mockData.redacao);
    }

    window.acessarCurso = function (cursoId) {
        window.location.href = `course.html?curso=${cursoId}`;
    };

    window.iniciarPratica = function () {
        window.location.href = 'question.html';
    };

    function setupEventListeners() {
        const courseModal = document.getElementById('courseModal');
        const addCourseBtn = document.getElementById('addCourseBtn');
        const modalClose = document.querySelector('.modal-close');

        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => {
                if (courseModal) courseModal.classList.add('active');
            });
        }

        if (modalClose && courseModal) {
            modalClose.addEventListener('click', () => {
                courseModal.classList.remove('active');
            });
        }

        if (courseModal) {
            courseModal.addEventListener('click', (e) => {
                if (e.target === courseModal) {
                    courseModal.classList.remove('active');
                }
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', logoutBtn.click);
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (confirm('Tem certeza que deseja sair?')) {
                    Auth.logout(true);
                }
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

        const chartFilter = document.getElementById('chartFilter');
        if (chartFilter) {
            chartFilter.addEventListener('change', function () {
                console.log('Filtro alterado para:', this.value);
            });
        }

        const practiceMoreBtn = document.getElementById('practiceMoreBtn');
        if (practiceMoreBtn) {
            practiceMoreBtn.addEventListener('click', () => {
                window.location.href = 'questoes.html';
            });
        }

        const newRedacaoBtn = document.getElementById('newRedacaoBtn');
        if (newRedacaoBtn) {
            newRedacaoBtn.addEventListener('click', () => {
                window.location.href = 'redacao.html';
            });
        }

        const viewAllClassesBtn = document.getElementById('viewAllClassesBtn');
        if (viewAllClassesBtn) {
            viewAllClassesBtn.addEventListener('click', () => {
                window.location.href = 'course.html';
            });
        }

        const btnRedacao = document.querySelector('.btn-redacao');
        if (btnRedacao) {
            btnRedacao.addEventListener('click', () => {
                window.location.href = 'redacao.html';
            });
        }
    }

    setupEventListeners();
    loadDashboardData();

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
        
        .curso-progress {
            margin-top: 8px;
        }
        
        .curso-progress-bar {
            height: 4px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 4px;
        }
        
        .curso-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--vermelho), #FF4444);
            border-radius: 2px;
            transition: width 0.5s ease;
        }
        
        .curso-progress-text {
            font-size: 11px;
            color: var(--cinza-escuro);
            opacity: 0.7;
        }
        
        .course-badge {
            background: var(--verde);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .btn-add-course.disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            color: var(--cinza-escuro);
        }
        
        .empty-state i {
            font-size: 3rem;
            color: var(--cinza-medio);
            margin-bottom: 1rem;
        }
        
        .empty-state p {
            margin-bottom: 1rem;
            opacity: 0.8;
        }
        
        .btn-small {
            padding: 8px 16px;
            background: var(--vermelho);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
    loadMateriaisRecentes();
    setupMateriaisModal();
});
