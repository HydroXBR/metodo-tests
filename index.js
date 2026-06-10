app.get('/api/dashboard', async function (req, res) {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.json({
                success: false,
                message: 'ID do usuário necessário'
            });
        }

        const foundUser = await user.findById(userId);

        if (!foundUser || foundUser.status !== 'aprovado') {
            return res.json({
                success: false,
                message: 'Usuário não encontrado ou não aprovado'
            });
        }

        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - 7);

        const questoesSemana = foundUser.questoes.filter(q =>
            q.date >= inicioSemana.getTime()
        );

        const aulasSemana = foundUser.aulas.filter(a =>
            a.date >= inicioSemana.getTime()
        );

        const totalQuestoes = foundUser.questoes.length;
        const questoesCorretas = foundUser.questoes.filter(q => q.correct).length;
        const taxaAcerto = totalQuestoes > 0 ?
            Math.round((questoesCorretas / totalQuestoes) * 100) : 0;

        const questoesPorDia = [];
        for (let i = 6; i >= 0; i--) {
            const data = new Date();
            data.setDate(data.getDate() - i);
            data.setHours(0, 0, 0, 0);

            const questoesDia = foundUser.questoes.filter(q => {
                const qDate = new Date(q.date);
                qDate.setHours(0, 0, 0, 0);
                return qDate.getTime() === data.getTime();
            });

            const corretasDia = questoesDia.filter(q => q.correct).length;

            questoesPorDia.push({
                data: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
                total: questoesDia.length,
                corretas: corretasDia
            });
        }

        const redacoes = foundUser.redacoes || [];
        const redacoesCorrigidas = redacoes.filter(r => r.status === 'corrigido' && r.nota);

        let mediaNota = 0;
        if (redacoesCorrigidas.length > 0) {
            const somaNotas = redacoesCorrigidas.reduce((acc, r) => acc + (r.nota || 0), 0);
            mediaNota = (somaNotas / redacoesCorrigidas.length).toFixed(1);
        }

        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const redacoesEsteMes = redacoes.filter(r =>
            r.dataEnvio && new Date(r.dataEnvio) >= inicioMes && r.status !== 'arquivado'
        ).length;

        const correcoesRestantes = Math.max(0, 4 - redacoesEsteMes);

        res.json({
            success: true,
            data: {
                userInfo: {
                    name: foundUser.completename,
                    email: foundUser.email,
                    turma: foundUser.turma,
                    profilePicture: foundUser.profilePicture,
                    cursos: foundUser.cursos || [],
                    registered: foundUser.registered,
                    permissions: foundUser.permissions,
                    // Campos extras para staff
                    disciplinas: foundUser.disciplinas || [],
                    turmasResponsavel: foundUser.turmasResponsavel || [],
                    telefone: foundUser.telefone || ''
                },
                estatisticas: {
                    totalQuestoes: totalQuestoes,
                    questoesCorretas: questoesCorretas,
                    taxaAcerto: taxaAcerto,
                    aulasAssistidas: foundUser.aulas.length,
                    questoesSemana: questoesSemana.length,
                    questoesHoje: foundUser.questoes.filter(q => {
                        const hoje = new Date();
                        const qDate = new Date(q.date);
                        return qDate.toDateString() === hoje.toDateString();
                    }).length,
                    acertosSemana: questoesSemana.filter(q => q.correct).length
                },
                questoesRecentes: foundUser.questoes
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 10)
                    .map(q => ({
                        answer: q.answer,
                        correct: q.correct,
                        date: q.date,
                        materia: getMateriaPorQuestao(q.answer)
                    })),
                aulasRecentes: foundUser.aulas
                    .sort((a, b) => a.date - b.date)
                    .slice(0, 5)
                    .map(a => ({
                        classId: a.classId,
                        course: a.course,
                        date: a.date
                    })),
                questoesPorDia: questoesPorDia,
                redacao: {
                    total: redacoes.length,
                    mediaNota: mediaNota,
                    correcoesRestantes: correcoesRestantes
                }
            }
        });

    } catch (error) {
        console.error('Erro no dashboard:', error);
        res.json({
            success: false,
            message: 'Erro ao carregar dashboard'
        });
    }
});

app.post('/api/aula', async (req, res) => {
    try {
        const { userId, classId, course } = req.body;

        const novaAula = {
            classId: classId,
            course: course,
            date: new Date().getTime()
        };

        await user.findByIdAndUpdate(userId, {
            $push: { aulas: novaAula }
        });

        res.json({
            success: true,
            message: 'Aula registrada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao registrar aula:', error);
        res.json({ success: false, message: 'Erro ao registrar aula' });
    }
});

app.post('/api/adicionar-curso', async (req, res) => {
    try {
        const { userId, curso } = req.body;

        await user.findByIdAndUpdate(userId, {
            $addToSet: { cursos: curso }
        });

        res.json({
            success: true,
            message: 'Curso adicionado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao adicionar curso:', error);
        res.json({ success: false, message: 'Erro ao adicionar curso' });
    }
});

app.get('/api/cursos-disponiveis', (req, res) => {
    const cursos = [
        { id: 'psc1', nome: 'PSC I', descricao: '1º Ano - Processo Seletivo Contínuo', preco: 'R$ 350/mês' },
        { id: 'psc2', nome: 'PSC II', descricao: '2º Ano - Processo Seletivo Contínuo', preco: 'R$ 350/mês' },
        { id: 'psc3', nome: 'PSC III', descricao: '3º Ano - Processo Seletivo Contínuo', preco: 'R$ 350/mês' },
        { id: 'sis1', nome: 'SIS I', descricao: '1º Ano - Sistema de Ingresso Seriado', preco: 'R$ 350/mês' },
        { id: 'sis2', nome: 'SIS II', descricao: '2º Ano - Sistema de Ingresso Seriado', preco: 'R$ 350/mês' },
        { id: 'sis3', nome: 'SIS III', descricao: '3º Ano - Sistema de Ingresso Seriado', preco: 'R$ 350/mês' },
        { id: 'enem', nome: 'ENEM/Macro', descricao: 'ENEM e vestibulares gerais', preco: 'R$ 400/mês' }
    ];

    res.json({ success: true, cursos: cursos });
});

app.get('/api/user-cursos', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.json({ success: false, message: 'ID do usuário necessário' });
        }

        const foundUser = await user.findById(userId).select('cursos');

        if (!foundUser) {
            return res.json({ success: false, message: 'Usuário não encontrado' });
        }

        res.json({
            success: true,
            cursos: foundUser.cursos || []
        });

    } catch (error) {
        console.error('Erro ao obter cursos:', error);
        res.json({ success: false, message: 'Erro ao carregar cursos' });
    }
});

app.get('/api/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.json({ success: false, message: 'Curso não encontrado' });
        }

        const subjects = await Lesson.distinct('subject', { courseId });

        const progress = await UserProgress.findOne({
            userId: req.query.userId,
            courseId
        });

        res.json({
            success: true,
            course: {
                ...course._doc,
                subjects: subjects.map(subject => ({
                    id: subject,
                    name: getSubjectName(subject),
                    icon: getSubjectIcon(subject)
                }))
            },
            progress: progress || {
                completedLessons: [],
                totalTime: 0,
                streak: 0
            }
        });

    } catch (error) {
        console.error('Erro ao carregar curso:', error);
        res.json({ success: false, message: 'Erro ao carregar curso' });
    }
});

app.get('/api/course/:courseId/subject/:subject', async (req, res) => {
    try {
        const { courseId, subject } = req.params;

        const lessons = await Lesson.find({
            courseId,
            subject
        }).sort('order');

        res.json({
            success: true,
            lessons: lessons.map(lesson => ({
                id: lesson._id,
                title: lesson.title,
                description: lesson.description,
                duration: lesson.duration,
                professor: lesson.professor,
                resources: lesson.resources,
                videoUrl: lesson.videoUrl
            }))
        });

    } catch (error) {
        console.error('Erro ao carregar aulas:', error);
        res.json({ success: false, message: 'Erro ao carregar aulas' });
    }
});

app.post('/api/course/progress', async (req, res) => {
    try {
        const { userId, courseId, lessonId } = req.body;

        await UserProgress.findOneAndUpdate(
            { userId, courseId },
            {
                $addToSet: { completedLessons: lessonId },
                $set: { lastAccessed: new Date() }
            },
            { upsert: true, new: true }
        );

        await user.findByIdAndUpdate(userId, {
            $push: {
                aulas: {
                    classId: lessonId,
                    course: courseId,
                    date: new Date().getTime()
                }
            }
        });

        res.json({ success: true, message: 'Progresso atualizado' });

    } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
        res.json({ success: false, message: 'Erro ao atualizar progresso' });
    }
});

app.post('/api/course/comment', async (req, res) => {
    try {
        const { userId, lessonId, comment } = req.body;

        const user = await user.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'Usuário não encontrado' });
        }

        await Lesson.findByIdAndUpdate(lessonId, {
            $push: {
                comments: {
                    authorId: userId,
                    authorName: user.completename,
                    comment: comment
                }
            }
        });

        res.json({ success: true, message: 'Comentário adicionado' });

    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.json({ success: false, message: 'Erro ao adicionar comentário' });
    }
});

app.get('/api/user-cursos', async function (req, res) {
    try {
        const { userId } = req.query;

        const foundUser = await user.findById(userId)
            .select('cursos permissions');

        if (!foundUser) {
            return res.json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            cursos: foundUser.cursos || [],
            permissions: foundUser.permissions
        });

    } catch (error) {
        console.error('Erro ao buscar cursos do usuário:', error);
        res.json({
            success: false,
            message: 'Erro ao buscar cursos'
        });
    }
});

app.get('/api/adicionar-curso', async function (req, res) {
    try {
        const { userId, cursoId } = req.query;

        const updatedUser = await user.findByIdAndUpdate(
            userId,
            { $addToSet: { cursos: cursoId } },
            { new: true }
        ).select('cursos');

        if (!updatedUser) {
            return res.json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Curso adicionado com sucesso',
            cursos: updatedUser.cursos
        });

    } catch (error) {
        console.error('Erro ao adicionar curso:', error);
        res.json({
            success: false,
            message: 'Erro ao adicionar curso'
        });
    }
});

app.get('/api/admin/courses', async (req, res) => {
    try {
        const courses = await Course.find({})
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            courses: courses.map(course => ({
                courseId: course.courseId,
                title: course.title,
                description: course.description,
                type: course.type,
                professors: course.professors || [],
                totalLessons: course.totalLessons || 0,
                totalHours: course.totalHours || 0,
                enrolledStudents: course.enrolledStudents || 0,
                rating: course.rating || 0,
                createdAt: course.createdAt
            }))
        });

    } catch (error) {
        console.error('Erro ao listar cursos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar cursos'
        });
    }
});

app.get('/api/admin/course/:courseId/detail', isAdmin, async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.json({ success: false, message: 'Curso não encontrado' });
        }

        const lessons = await Lesson.find({ courseId });
        const progress = await UserProgress.find({ courseId });

        res.json({
            success: true,
            course,
            lessons,
            enrolledStudents: progress.length,
            averageProgress: progress.length > 0 ?
                progress.reduce((acc, p) => acc + (p.completedLessons.length || 0), 0) / (lessons.length * progress.length) : 0
        });

    } catch (error) {
        res.json({ success: false, message: 'Erro ao carregar detalhes' });
    }
});

// DELETE - Excluir curso
app.delete('/api/admin/course/:courseId', isAdmin, async (req, res) => {
    try {
        const { courseId } = req.params;

        const progress = await UserProgress.findOne({ courseId });
        if (progress) {
            return res.json({
                success: false,
                message: 'Não é possível excluir curso com alunos inscritos'
            });
        }

        await Course.findOneAndDelete({ courseId });
        await Lesson.deleteMany({ courseId });

        res.json({ success: true, message: 'Curso excluído com sucesso' });

    } catch (error) {
        res.json({ success: false, message: 'Erro ao excluir curso' });
    }
});
