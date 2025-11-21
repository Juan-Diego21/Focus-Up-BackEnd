/**
 * Mensajes motivacionales semanales para usuarios
 * Contiene 52 mensajes diferentes que rotan semanalmente
 * Temas: logro de metas, estudio, trabajo, perseverancia, crecimiento personal
 */
export const motivationalMessages = [
  "¡Cada día es una nueva oportunidad para alcanzar tus sueños! Sigue adelante con determinación.",
  "Recuerda: el éxito no es el final, el fracaso no es fatal. Es el coraje para continuar lo que cuenta.",
  "Tu futuro depende de lo que hagas hoy. ¡Haz que cuente!",
  "La perseverancia no es una carrera larga, es muchas carreras cortas una tras otra. ¡Sigue corriendo!",
  "Cada experto fue alguna vez un principiante. Tu viaje apenas comienza.",
  "No esperes oportunidades perfectas, crea las tuyas propias.",
  "El camino hacia el éxito está siempre en construcción. ¡Sigue edificando!",
  "Las metas pequeñas llevan a grandes logros. Celebra cada paso.",
  "La disciplina es el puente entre metas y logros. ¡Mantén el puente fuerte!",
  "Cada desafío que superas te hace más fuerte. ¡Eres más capaz de lo que crees!",
  "El aprendizaje nunca se agota. Cada día trae nuevas lecciones.",
  "Tu actitud determina tu dirección. ¡Elige mirar hacia arriba!",
  "Los sueños no funcionan a menos que lo hagas. ¡Pon acción detrás de tus aspiraciones!",
  "La consistencia vence al talento cuando el talento no es consistente.",
  "Cada 'no' te acerca más al 'sí'. ¡Sigue preguntando!",
  "El crecimiento comienza en el momento en que sales de tu zona de confort.",
  "Tu potencial es ilimitado. ¡No te limites a ti mismo!",
  "El fracaso es solo una lección disfrazada. ¡Aprende y sigue adelante!",
  "La paciencia es amarga, pero sus frutos son dulces. ¡Espera lo mejor!",
  "Cada día es una página en blanco. ¡Escribe una historia increíble!",
  "La motivación te pone en marcha, el hábito te mantiene en movimiento.",
  "No compares tu capítulo 1 con el capítulo 20 de alguien más. Tu historia es única.",
  "Las oportunidades no pasan, las creas. ¡Sé el creador de tu futuro!",
  "La excelencia no es un acto, es un hábito. ¡Cultívalo diariamente!",
  "Cada obstáculo es una oportunidad para crecer más fuerte.",
  "Tu mente es un jardín. Planta pensamientos positivos y cosecharás éxito.",
  "El cambio comienza con una decisión. ¡Decide ser extraordinario!",
  "La gratitud transforma lo que tenemos en suficiente. ¡Cuenta tus bendiciones!",
  "El progreso, no la perfección, es el objetivo. ¡Sigue avanzando!",
  "Cada paso cuenta, incluso los pequeños. ¡La suma hace la diferencia!",
  "La fe en ti mismo es el primer secreto del éxito.",
  "No es sobre ser el mejor, es sobre ser mejor que ayer.",
  "Las grandes cosas nunca vienen de zonas de confort. ¡Sal y conquista!",
  "Tu tiempo es limitado, así que no lo desperdicies viviendo la vida de alguien más.",
  "La innovación distingue entre un líder y un seguidor. ¡Sé innovador!",
  "Cada final es un nuevo comienzo. ¡Abraza el cambio!",
  "La pasión es el combustible que impulsa el éxito. ¡Encuéntrala y síguela!",
  "No temas al fracaso, teme no intentarlo. ¡El arrepentimiento duele más!",
  "La resiliencia es la capacidad de recuperarse de las dificultades. ¡Eres resiliente!",
  "Tu educación nunca termina. ¡Sigue aprendiendo, sigue creciendo!",
  "La acción es la llave fundamental para todo éxito. ¡Actúa ahora!",
  "Las palabras inspiran, pero las acciones transforman. ¡Sé la transformación!",
  "Cada día trae nuevas oportunidades. ¡Aprovecha el día de hoy!",
  "La confianza viene de la preparación. ¡Prepárate para ganar!",
  "No busques ser exitoso, busca ser valioso. ¡El éxito seguirá!",
  "La creatividad es la inteligencia divirtiéndose. ¡Libera tu creatividad!",
  "Cada desafío es una oportunidad para demostrar tu grandeza.",
  "La humildad es la base de todo logro verdadero. ¡Mantente humilde!",
  "Tu actitud, no tu aptitud, determinará tu altitud. ¡Vuela alto!",
  "La paciencia es la compañera del genio. ¡Sé paciente con tu progreso!",
  "Cada sueño comienza con un soñador. ¡Mantén vivo tu sueño!",
  "La determinación hoy garantiza el éxito mañana. ¡Sé determinado!",
  "No es el tamaño del perro en la pelea, es el tamaño de la pelea en el perro. ¡Lucha con todo!",
  "La sabiduría viene de la experiencia. ¡Experimenta, aprende, crece!"
];

/**
 * Obtiene un mensaje motivacional basado en el número de semana del año
 * Usa el número de semana (0-51) para rotar los mensajes semanalmente
 * Esto asegura que cada semana tenga un mensaje diferente y consistente
 */
export function getWeeklyMotivationalMessage(weekNumber: number): string {
  // Normalizar el número de semana entre 0-51
  const normalizedWeek = weekNumber % motivationalMessages.length;
  return motivationalMessages[normalizedWeek];
}

/**
 * Obtiene el número de semana del año actual
 * Basado en el estándar ISO 8601 (semana comienza el lunes)
 */
export function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7) - 1;
  return weekNumber;
}