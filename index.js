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
                        materia: getMateriaPorQuestao(q.answer) // Você já tem esta função
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

