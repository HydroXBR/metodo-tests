// models/user.js
import pkg from "mongoose"
const { Schema, model } = pkg

const simuladosSchema = Schema({
	id: String,
	answers: String
});

const redacaoSchema = Schema({
	titulo: { type: String, required: true },
	estilo: {
		type: String,
		enum: ['enem', 'psc', 'sis', 'macro', 'outro'],
		required: true
	},
	texto: { type: String, required: true },
	observacoes: String,
	dataEnvio: { type: Date, default: Date.now },
	dataCorrecao: Date,
	status: {
		type: String,
		enum: ['pendente', 'corrigido', 'arquivado'],
		default: 'pendente'
	},
	nota: Number,
	competencias: [{
		nome: String,
		nota: Number,
		maxNota: Number,
		comentarios: String
	}],
	comentariosProfessor: String,
	professorCorretor: String,
	feedbacks: [{
		tipo: String,
		comentario: String,
		sugestao: String
	}]
});

const qSchema = Schema({
	questionId: {
		type: Schema.Types.ObjectId,
		ref: 'Question'
	},
	answer: {
		type: String,
		enum: ['A', 'B', 'C', 'D', 'E']
	},
	correct: Boolean,
	date: { type: Date, default: Date.now }
});

const cSchema = Schema({
	classId: String,
	course: String,
	date: { type: Date, default: Date.now }
});

// Schema unificado - todos os usuários têm os mesmos campos básicos
const schema = Schema({
	// Dados básicos para TODOS
	completename: { type: String, required: true },
	cpf: { 
		type: String, 
		required: true,
		unique: true,
		index: true
	},
	email: { 
		type: String, 
		required: true,
		unique: true,
		index: true
	},
	senha: { type: String, required: true },
	profilePicture: { type: String, default: "" },
	permissions: { 
		type: Number, 
		required: true,
		default: 1,
		// 1 - aluno CMPM, 2 - aluno Método, 3 - manager, 4 - professor, 5 - admin basic, 6 - total admin
	},
	registered: { type: Date, default: Date.now },
	status: { 
		type: String,
		enum: ['pendente', 'aprovado', 'suspenso', 'desativado'],
		default: 'pendente'
	},
	
	// Campos COMUNS para todos (alunos e staff podem ter cursos)
	turma: { 
		type: Number,
		default: 0 // 0 para staff, 1-4 para alunos
	},
	cursos: { 
		type: [String], 
		default: []
	},
	
	// Campos OPCIONAIS para staff
	disciplinas: { 
		type: [String],
		default: []
	},
	turmasResponsavel: { 
		type: [Number],
		default: []
	},
	telefone: { type: String },
	
	// Dados de progresso - TODOS podem ter (staff pode querer testar cursos)
	questoes: { 
		type: [qSchema],
		default: []
	},
	aulas: { 
		type: [cSchema],
		default: []
	},
	simulados: { 
		type: [simuladosSchema],
		default: []
	},
	redacoes: { 
		type: [redacaoSchema],
		default: []
	}
});

// Índices
schema.index({ permissions: 1, status: 1 });
schema.index({ email: 1, status: 1 });

const User = model('metodousers', schema);
export default User;
