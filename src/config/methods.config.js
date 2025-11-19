// Externalized study methods configuration
// This file contains all method definitions, states, and processes
// Add new methods here to automatically enable them in the backend

const studyMethodRegistry = {
  pomodoro: {
    validCreationProgress: [0, 20],
    validUpdateProgress: [0, 20, 40, 50, 60, 80, 100],
    validResumeProgress: [0, 20, 40, 50, 60, 80],
    statusMap: {
      0: "en_progreso",
      20: "en_progreso",
      40: "en_progreso",
      50: "en_progreso",
      60: "en_progreso",
      80: "en_progreso",
      100: "completado",
    },
  },
  mapas_mentales: {
    validCreationProgress: [20],
    validUpdateProgress: [20, 40, 60, 80, 100],
    validResumeProgress: [20, 40, 60, 80],
    statusMap: {
      20: "En_proceso",
      40: "En_proceso",
      60: "Casi_terminando",
      80: "Casi_terminando",
      100: "Terminado",
    },
  },
  repaso_espaciado: {
    validCreationProgress: [20],
    validUpdateProgress: [20, 40, 60, 80, 100],
    validResumeProgress: [20, 40, 60, 80],
    statusMap: {
      20: "En_proceso",
      40: "En_proceso",
      60: "Casi_terminando",
      80: "Casi_terminando",
      100: "Terminado",
    },
  },
  practica_activa: {
    validCreationProgress: [0, 20, 40, 60, 80, 100],
    validUpdateProgress: [0, 20, 40, 50, 60, 80, 100],
    validResumeProgress: [0, 20, 40, 50, 60, 80],
    statusMap: {
      0: "en_proceso",
      20: "en_proceso",
      40: "en_proceso",
      50: "en_proceso",
      60: "en_proceso",
      80: "en_proceso",
      100: "completado",
    },
  },
  cornell: {
    validCreationProgress: [20],
    validUpdateProgress: [20, 40, 60, 80, 100],
    validResumeProgress: [20, 40, 60, 80, 100],
    statusMap: {
      0: "En_proceso",
      20: "En_proceso",
      40: "En_proceso",
      60: "Casi_terminando",
      80: "Casi_terminando",
      100: "Terminado",
    },
  },
  feynman: {
    validCreationProgress: [0, 20],
    validUpdateProgress: [20, 40, 60, 80, 100],
    validResumeProgress: [20, 40, 60, 80, 100],
    statusMap: {
      20: "en_proceso",
      40: "avanzando",
      60: "casi_terminando",
      80: "casi_terminando",
      100: "finalizado",
    },
    // Feynman-specific configuration
    processes: [
      "paso_1_comprension",
      "paso_2_explicacion_simple",
      "paso_3_detectar_brechas",
      "paso_4_simplificar_y_repetir",
    ],
    states: ["no_iniciado", "en_proceso", "pausado", "completado"],
    // Progress calculation: (completedSteps / totalSteps) * 100
    totalSteps: 4,
    routePrefix: "/metodos/feynman/ejecucion",
  },
};

// Method name aliases for recognition
const methodAliases = {
  // Pomodoro
  pomodoro: "pomodoro",
  "metodo pomodoro": "pomodoro",
  "método pomodoro": "pomodoro",
  "Método Pomodoro": "pomodoro",
  "pomodoro technique": "pomodoro",

  // Mapas Mentales
  "mapas mentales": "mapas_mentales",
  "mapa mental": "mapas_mentales",
  "mind maps": "mapas_mentales",
  "mind map": "mapas_mentales",
  "método mapas mentales": "mapas_mentales",

  // Repaso Espaciado
  "repaso espaciado": "repaso_espaciado",
  "spaced repetition": "repaso_espaciado",

  // Práctica Activa
  "práctica activa": "practica_activa",
  "practica activa": "practica_activa",
  práctica_activa: "practica_activa",
  practica_activa: "practica_activa",
  "método práctica activa": "practica_activa",
  "metodo practica activa": "practica_activa",

  // Cornell
  cornell: "cornell",
  "cornell notes": "cornell",
  "notas cornell": "cornell",
  "método cornell": "cornell",
  "metodo cornell": "cornell",
  "Método Cornell": "cornell",
  cornell_notes: "cornell",

  // Feynman
  feynman: "feynman",
  "metodo feynman": "feynman",
  "método feynman": "feynman",
  metodo_feynman: "feynman",
  método_feynman: "feynman",
  "feynman technique": "feynman",
  "tecnica feynman": "feynman",
  "técnica feynman": "feynman",
  tecnica_feynman: "feynman",
  técnica_feynman: "feynman",
};

module.exports = {
  studyMethodRegistry,
  methodAliases,
};
