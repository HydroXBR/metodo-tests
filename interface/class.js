/**
 * Class Page com Dados Mockados - Versão para Teste
 * Sem dependência de API externa
 */

// Mock do usuário
const MOCK_USER = {
    id: 'mock-user-123',
    name: 'João Silva',
    completename: 'João Silva',
    email: 'joao@exemplo.com',
    turma: 2,
    profilePicture: 'https://ui-avatars.com/api/?background=FE0000&color=fff&name=João+Silva'
};

// Mock de cursos
const MOCK_COURSES = {
    'enem-2024': {
        id: 'enem-2024',
        title: 'ENEM 2024',
        type: 'enem',
        description: 'Preparação completa para o ENEM',
        totalLessons: 48,
        subjects: [
            { id: 'math', name: 'Matemática', icon: 'fas fa-calculator' },
            { id: 'port', name: 'Português', icon: 'fas fa-book' },
            { id: 'phys', name: 'Física', icon: 'fas fa-atom' },
            { id: 'chem', name: 'Química', icon: 'fas fa-flask' },
            { id: 'bio', name: 'Biologia', icon: 'fas fa-dna' },
            { id: 'hist', name: 'História', icon: 'fas fa-landmark' },
            { id: 'geo', name: 'Geografia', icon: 'fas fa-globe' }
        ]
    },
    'psc-2024': {
        id: 'psc-2024',
        title: 'PSC 2024',
        type: 'psc',
        description: 'Preparação para o Processo Seletivo Contínuo',
        totalLessons: 36,
        subjects: [
            { id: 'math', name: 'Matemática', icon: 'fas fa-calculator' },
            { id: 'port', name: 'Português', icon: 'fas fa-book' },
            { id: 'phys', name: 'Física', icon: 'fas fa-atom' },
            { id: 'hist', name: 'História', icon: 'fas fa-landmark' }
        ]
    }
};

// Mock de aulas
const MOCK_LESSONS = {
    // Aulas de Matemática
    'math-1': {
        id: 'math-1',
        title: 'Funções do 1º Grau',
        professor: 'Prof. Carlos Mendes',
        duration: 45,
        description: 'Nesta aula, vamos explorar os conceitos fundamentais das funções afins, também conhecidas como funções do primeiro grau. Veremos como identificar, interpretar e resolver problemas envolvendo esse tipo de função.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resources: [
            { type: 'pdf', title: 'Material de Apoio', description: 'PDF com resumo da aula', url: '#' },
            { type: 'quiz', title: 'Exercícios', description: '10 questões para fixar o conteúdo', url: '#' },
            { type: 'link', title: 'Simulador', description: 'Ferramenta interativa', url: '#' }
        ],
        comments: [
            { authorName: 'Maria Santos', comment: 'Excelente aula! Consegui entender tudo.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { authorName: 'Pedro Oliveira', comment: 'Professor, poderia fazer mais exemplos práticos?', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        ],
        level: 'Básico',
        difficulty: 'Fácil',
        order: 1,
        materiaId: 'math',
        materiaNome: 'Matemática'
    },
    'math-2': {
        id: 'math-2',
        title: 'Funções do 2º Grau',
        professor: 'Prof. Carlos Mendes',
        duration: 52,
        description: 'Aprofundando nos conceitos de funções quadráticas. Veremos vértice, raízes, concavidade e aplicações práticas.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resources: [
            { type: 'pdf', title: 'Material de Apoio', description: 'PDF com resumo da aula', url: '#' },
            { type: 'quiz', title: 'Lista de Exercícios', description: '20 questões', url: '#' }
        ],
        comments: [],
        level: 'Intermediário',
        difficulty: 'Média',
        order: 2,
        materiaId: 'math',
        materiaNome: 'Matemática'
    },
    'math-3': {
        id: 'math-3',
        title: 'Funções Exponenciais e Logarítmicas',
        professor: 'Prof. Carlos Mendes',
        duration: 58,
        description: 'Estudo das funções exponenciais e logarítmicas, suas propriedades e aplicações em problemas do ENEM.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resources: [],
        comments: [],
        level: 'Avançado',
        difficulty: 'Difícil',
        order: 3,
        materiaId: 'math',
        materiaNome: 'Matemática'
    },
    // Aulas de Português
    'port-1': {
        id: 'port-1',
        title: 'Interpretação de Texto',
        professor: 'Profa. Ana Beatriz',
        duration: 40,
        description: 'Técnicas essenciais para interpretar textos de forma eficiente e identificar ideias principais.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resources: [
            { type: 'pdf', title: 'Guia de Interpretação', description: 'Material complementar', url: '#' }
        ],
        comments: [
            { authorName: 'João Silva', comment: 'Muito útil para o ENEM!', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        level: 'Básico',
        difficulty: 'Fácil',
        order: 1,
        materiaId: 'port',
        materiaNome: 'Português'
    },
    'port-2': {
        id: 'port-2',
        title: 'Figuras de Linguagem',
        professor: 'Profa. Ana Beatriz',
        duration: 48,
        description: 'Principais figuras de linguagem e como identificá-las em textos literários e não literários.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resources: [
            { type: 'pdf', title: 'Mapa Mental', description: 'Resumo das figuras', url: '#' },
            { type: 'quiz', title: 'Exercícios', description: 'Identifique as figuras', url: '#' }
        ],
        comments: [],
        level: 'Intermediário',
        difficulty: 'Média',
        order: 2,
        materiaId: 'port',
        materiaNome: 'Português'
    },
    // Aulas de Física
    'phys-1': {
        id: 'phys-1',
        title: 'Cinemática - Movimento Uniforme',
        professor: 'Prof. Roberto Alves',
        duration: 55,
        description: 'Introdução à cinemática: posição, velocidade, aceleração e movimento retilíneo uniforme.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resources: [
            { type: 'pdf', title: 'Fórmulas', description: 'Resumo das fórmulas', url: '#' }
        ],
        comments: [],
        level: 'Básico',
        difficulty: 'Fácil',
        order: 1,
        materiaId: 'phys',
        materiaNome: 'Física'
    }
};

// Progresso do usuário (aulas concluídas)
let MOCK_PROGRESS = {
    'enem-2024': {
        completedLessons: ['math-1', 'port-1']
    },
    'psc-2024': {
        completedLessons: []
    }
};

// Comentários adicionados durante a sessão
let MOCK_NEW_COMMENTS = [];

document.addEventListener('DOMContentLoaded', function() {
    // Verificar usuário (mock)
    let user = JSON.parse(localStorage.getItem('user')) || MOCK_USER;
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Obter parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const aulaId = urlParams.get('id');
    const cursoId = urlParams.get('curso');
    
    if (!aulaId || !cursoId) {
        window.location.href = 'courses.html';
        return;
    }

    // Estado atual
    let currentState = {
        aulaId: aulaId,
        cursoId: cursoId,
        aula: null,
        curso: null,
        materias: [],
        aulasDoCurso: []
    };

    // Atualizar informações do usuário
    function updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.getElementById('userAvatar');
        
        if (userNameElement) {
            userNameElement.textContent = user.name?.split(' ')[0] || 'Estudante';
        }
        
        if (userAvatarElement && user.profilePicture) {
            userAvatarElement.src = user.profilePicture;
        }
    }

    // Carregar informações do curso
    function loadCursoInfo() {
        const curso = MOCK_COURSES[cursoId];
        
        if (!curso) {
            console.error('Curso não encontrado');
            window.location.href = 'courses.html';
            return;
        }
        
        currentState.curso = curso;
        
        // Atualizar breadcrumb
        const courseTitleNav = document.getElementById('courseTitleNav');
        if (courseTitleNav) {
            courseTitleNav.textContent = curso.title;
        }
        
        const backToCourse = document.getElementById('backToCourse');
        if (backToCourse) {
            backToCourse.href = `course.html?curso=${cursoId}`;
        }
    }

    // Carregar matérias e aulas
    function loadMateriasEAulas() {
        const materias = currentState.curso?.subjects || [];
        currentState.materias = [];
        currentState.aulasDoCurso = [];
        
        for (const materia of materias) {
            // Encontrar aulas desta matéria
            const aulasDaMateria = Object.values(MOCK_LESSONS).filter(
                lesson => lesson.materiaId === materia.id
            );
            
            const materiaCompleta = {
                ...materia,
                aulas: aulasDaMateria
            };
            
            currentState.materias.push(materiaCompleta);
            
            // Adicionar todas as aulas com referência à matéria
            aulasDaMateria.forEach(aula => {
                currentState.aulasDoCurso.push({
                    ...aula,
                    materiaId: materia.id,
                    materiaNome: materia.name,
                    materiaIcon: materia.icon
                });
            });
        }
        
        // Ordenar aulas por ordem
        currentState.aulasDoCurso.sort((a, b) => a.order - b.order);
    }

    // Carregar aula específica
    function loadAula() {
        // Buscar aula específica
        const aula = MOCK_LESSONS[currentState.aulaId];
        
        if (!aula) {
            console.error('Aula não encontrada');
            showError('Aula não encontrada. Redirecionando...');
            setTimeout(() => {
                window.location.href = `course.html?curso=${cursoId}`;
            }, 2000);
            return;
        }
        
        currentState.aula = aula;
        
        // Atualizar UI com informações da aula
        updateAulaUI();
        
        // Carregar vídeo
        loadVideoPlayer();
        
        // Carregar recursos
        loadRecursos();
        
        // Carregar comentários
        loadComentarios();
        
        // Registrar visual
