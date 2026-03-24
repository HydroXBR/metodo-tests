/**
 * Dashboard com Dados Mockados - Versão para Teste
 * Sem dependência de API externa
 */

// Mock do Auth para simular autenticação
const Auth = {
    isAuthenticated: function() {
        return true;
    },
    isAluno: function() {
        return true;
    },
    getDefaultRoute: function() {
        return 'dashboard.html';
    },
    logout: function(redirect) {
        console.log('Logout simulado');
        if (redirect) {
            window.location.href = 'login.html';
        }
    },
    currentUser: {
        id: 'mock-user-123',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        turma: 2,
        cursos: ['enem-2024', 'psc-2024']
    }
};

// Dados mockados
const MOCK_DATA = {
    // Informações do usuário
    userInfo: {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        turma: 2,
        profilePicture: 'https://ui-avatars.com/api/?background=FE0000&color=fff&name=João+Silva'
    },
    
    // Estatísticas do dashboard
    estatisticas: {
        totalQuestoes: 147,
        questoesCorretas: 98,
        taxaAcerto: 67,
        aulasAssistidas: 24,
        questoesSemana: 23,
        questoesHoje: 5,
        acertosSemana: 15
    },
    
    // Questões recentes
    questoesRecentes: [
        { materia: 'Matemática', answer: 'E', correct: true, date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { materia: 'Português', answer: 'C', correct: true, date: new Date(Date.now() - 5 * 60 * 60 * 1000) },
        { materia: 'Física', answer: 'B', correct: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { materia: 'Química', answer: 'D', correct: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { materia: 'História', answer: 'A', correct: true, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { materia: 'Biologia', answer: 'C', correct: false, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ],
    
    // Cursos do usuário
    cursos: [
        {
            id: 'enem-2024',
            title: 'ENEM 2024',
            type: 'enem',
            totalLessons: 48,
            progress: { completedLessons: [1,2,3,4,5,6,7,8,9,10,11,12] }
        },
        {
            id: 'psc-2024',
            title: 'PSC 2024',
            type: 'psc',
            totalLessons: 36,
            progress: { completedLessons: [1,2,3,4,5,6,7,8] }
        },
        {
            id: 'sis-2024',
            title: 'SIS 2024',
            type: 'sis',
            totalLessons: 42,
            progress: { completedLessons: [1,2,3,4] }
        }
    ],
    
    // Cursos disponíveis para adicionar
    cursosDisponiveis: [
        { id: 'enem-2024', nome: 'ENEM 2024', descricao: 'Preparação completa para o ENEM', preco: 'Gratuito' },
        { id: 'psc-2024', nome: 'PSC 2024', descricao: 'Preparação para o PSC', preco: 'Gratuito' },
        { id: 'sis-2024', nome: 'SIS 2024', descricao: 'Preparação para o SIS', preco: 'Gratuito' },
        { id: 'matematica-basica', nome: 'Matemática Básica', descricao: 'Fundamentos de matemática', preco: 'Gratuito' },
        { id: 'redacao-enem', nome: 'Redação ENEM', descricao: 'Técnicas para redação nota mil', preco: 'Gratuito' }
    ],
    
    // Materiais recentes
    materiaisRecentes: [
        {
            id: '1',
            title: 'Apostila de Matemática - Módulo 1',
            description: 'Conteúdo completo de matemática básica para o ENEM',
            type: 'apostila',
            professorName: 'Prof. Carlos',
            url: '#',
            fileSize: 2500000,
            tags: ['matemática', 'básico', 'enem'],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            id: '2',
            title: 'Lista de Exercícios - Física',
            description: 'Exercícios sobre cinemática e dinâmica',
            type: 'exercicio',
            professorName: 'Profa. Ana',
            url: '#',
            fileSize: 850000,
            tags: ['física', 'exercícios', 'cinemática'],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
            id: '3',
            title: 'Slides - Revolução Francesa',
            description: 'Apresentação sobre a Revolução Francesa',
            type: 'slide',
            professorName: 'Prof. Roberto',
            url: '#',
            fileSize: 3200000,
            tags: ['história', 'revolução', 'slides'],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
            id: '4',
            title: 'PDF - Química Orgânica',
            description: 'Introdução à química orgânica',
            type: 'pdf',
            professorName: 'Profa. Mariana',
            url: '#',
            fileSize: 1800000,
            tags: ['química', 'orgânica', 'pdf'],
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
            id: '5',
            title: 'Vídeo Aula - Funções Matemáticas',
            description: 'Aula completa sobre funções do 1º e 2º grau',
            type: 'video',
            professorName: 'Prof. Carlos',
            url: '#',
            fileSize: null,
            tags: ['matemática', 'funções', 'vídeo'],
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
            id: '6',
            title: 'Link - Simulado ENEM',
            description: 'Simulado online com questões do ENEM',
            type: 'link',
            professorName: 'Equipe Método',
            url: '#',
            fileSize: null,
            tags: ['simulado', 'enem', 'online'],
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
    ],
    
    // Todos os materiais (para o modal)
    todosMateriais: [
        {
            id: '1',
            title: 'Apostila de Matemática - Módulo 1',
            description: 'Conteúdo completo de matemática básica para o ENEM',
            type: 'apostila',
            professorName: 'Prof. Carlos',
            url: '#',
            fileSize: 2500000,
            tags: ['matemática', 'básico', 'enem'],
            views: 245,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            id: '2',
            title: 'Lista de Exercícios - Física',
            description: 'Exercícios sobre cinemática e dinâmica',
            type: 'exercicio',
            professorName: 'Profa. Ana',
            url: '#',
            fileSize: 850000,
            tags: ['física', 'exercícios', 'cinemática'],
            views: 189,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
            id: '3',
            title: 'Slides - Revolução Francesa',
            description: 'Apresentação sobre a Revolução Francesa',
            type: 'slide',
            professorName: 'Prof. Roberto',
            url: '#',
            fileSize: 3200000,
            tags: ['história', 'revolução', 'slides'],
            views: 134,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
            id: '4',
            title: 'PDF - Química Orgânica',
            description: 'Introdução à química orgânica',
            type: 'pdf',
            professorName: 'Profa. Mariana',
            url: '#',
            fileSize: 1800000,
            tags: ['química', 'orgânica', 'pdf'],
            views: 312,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
            id: '5',
            title: 'Vídeo Aula - Funções Matemáticas',
            description: 'Aula completa sobre funções do 1º e 2º grau',
            type: 'video',
            professorName: 'Prof. Carlos',
            url: '#',
            fileSize: null,
            tags: ['matemática', 'funções', 'vídeo'],
            views: 567,
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
            id: '6',
            title: 'Link - Simulado ENEM',
            description: 'Simulado online com questões do ENEM',
            type: 'link',
            professorName: 'Equipe Método',
            url: '#',
            fileSize: null,
            tags: ['simulado', 'enem', 'online'],
            views: 423,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
            id: '7',
            title: 'Apostila de Redação',
            description: 'Guia completo para redação nota mil',
            type: 'apostila',
            professorName: 'Profa. Beatriz',
            url: '#',
            fileSize: 4200000,
            tags: ['redação', 'enem', 'dissertação'],
            views: 678,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
            id: '8',
            title: 'Lista de Exercícios - Matemática',
            description: 'Exercícios de geometria plana e espacial',
            type: 'exercicio',
            professorName: 'Prof. Carlos',
            url: '#',
            fileSize: 1200000,
            tags: ['matemática', 'geometria', 'exercícios'],
            views: 234,
            createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000)
        }
    ],
    
    // Dados do gráfico (desempenho semanal)
    questoesPorDia: [
        { data: 'Seg', total: 12, corretas: 8 },
        { data: 'Ter', total: 15, corretas: 11 },
        { data: 'Qua', total: 8, corretas: 5 },
        { data: 'Qui', total: 20, corretas: 14 },
        { data: 'Sex', total: 10, corretas: 7 },
        { data: 'Sáb', total: 5, corretas: 4 },
        {
