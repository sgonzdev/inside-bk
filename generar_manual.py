"""
Manual de Usuario InsideOut Expressions - APA 7ma edicion
- Times New Roman 12pt, interlineado doble, margenes 2.54 cm
- Sangria primera linea 1.27 cm, numeracion arriba derecha
- Sin portada elaborada: solo titulo al inicio
"""

from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


def add_page_number(paragraph):
    run = paragraph.add_run()
    f1 = OxmlElement('w:fldChar'); f1.set(qn('w:fldCharType'), 'begin')
    it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = 'PAGE'
    f2 = OxmlElement('w:fldChar'); f2.set(qn('w:fldCharType'), 'end')
    run._r.append(f1); run._r.append(it); run._r.append(f2)


def base(doc):
    style = doc.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(12)
    rpr = style.element.get_or_add_rPr()
    rF = OxmlElement('w:rFonts')
    rF.set(qn('w:ascii'), 'Times New Roman')
    rF.set(qn('w:hAnsi'), 'Times New Roman')
    rF.set(qn('w:cs'), 'Times New Roman')
    rpr.append(rF)
    style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    style.paragraph_format.space_before = Pt(0)
    style.paragraph_format.space_after = Pt(0)
    for s in doc.sections:
        s.top_margin = Cm(2.54); s.bottom_margin = Cm(2.54)
        s.left_margin = Cm(2.54); s.right_margin = Cm(2.54)
        p = s.header.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        add_page_number(p)
        for r in p.runs:
            r.font.name = 'Times New Roman'; r.font.size = Pt(12)


def parr(doc, texto, sangria=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if sangria:
        p.paragraph_format.first_line_indent = Cm(1.27)
    r = p.add_run(texto)
    r.font.name = 'Times New Roman'; r.font.size = Pt(12)
    return p


def h1(doc, texto):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    r = p.add_run(texto)
    r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.bold = True


def h2(doc, texto):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(12)
    r = p.add_run(texto)
    r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.bold = True


def h3(doc, texto):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(6)
    r = p.add_run(texto)
    r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.bold = True; r.italic = True


def num(doc, items):
    for i, it in enumerate(items, 1):
        p = doc.add_paragraph()
        p.paragraph_format.first_line_indent = Cm(1.27)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(f"{i}. {it}")
        r.font.name = 'Times New Roman'; r.font.size = Pt(12)


def vin(doc, items):
    for it in items:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(1.27)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(f"• {it}")
        r.font.name = 'Times New Roman'; r.font.size = Pt(12)


def ref(doc, texto):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.left_indent = Cm(1.27)
    p.paragraph_format.first_line_indent = Cm(-1.27)
    r = p.add_run(texto)
    r.font.name = 'Times New Roman'; r.font.size = Pt(12)


# ========================================================
doc = Document()
base(doc)

# Titulo simple inicial (reemplaza portada)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("Manual de Usuario de InsideOutExpressions")
r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.bold = True
doc.add_paragraph()

# 1. Introduccion
h1(doc, "Introduccion")
parr(doc,
    "InsideOutExpressions es una plataforma digital multiplataforma (web, Android e iOS) "
    "disenada para acompanar a estudiantes universitarios en el cuidado de su salud mental. "
    "La aplicacion integra diarios emocionales con soporte multimedia, una rueda interactiva "
    "de emociones, retroalimentacion generada con inteligencia artificial, chat seguro en "
    "tiempo real con profesionales de psicologia, estadisticas visuales del estado emocional, "
    "predicciones emocionales diarias, notificaciones centralizadas y mecanismos de "
    "consentimiento informado con validez legal para mayores y menores de edad.")
parr(doc,
    "Este manual describe, paso a paso, todas las funciones del aplicativo, los flujos de "
    "interaccion para los roles Estudiante y Profesional, las pantallas visibles, los "
    "botones disponibles, las restricciones tecnicas y los criterios eticos que rigen el "
    "uso de la inteligencia artificial en contextos de salud mental.")

# 2. Objetivo
h1(doc, "Objetivo del Manual")
parr(doc,
    "Ofrecer una guia clara y exhaustiva que permita a estudiantes, profesionales y "
    "personal de bienestar universitario comprender, instalar y utilizar InsideOutExpressions "
    "de manera autonoma, aprovechando todas sus funcionalidades sin requerir soporte "
    "tecnico adicional.")

# 3. Descripcion general
h1(doc, "Descripcion General del Aplicativo")
parr(doc,
    "InsideOutExpressions se compone de una aplicacion cliente (web, Android e iOS) "
    "construida con Ionic 8, React 19 y TypeScript, y un servidor desarrollado en Node.js "
    "con Express, Prisma, PostgreSQL, Redis y Socket.io. La plataforma admite dos roles: "
    "Estudiante (STUDENT) y Profesional (PROFESSIONAL), cada uno con funciones especificas.")

h2(doc, "Programas Academicos Disponibles")
parr(doc,
    "Durante el registro, el estudiante debe seleccionar uno de los programas academicos "
    "asociados a la Facultad. Los programas disponibles son los siguientes:")
vin(doc, [
    "Ingenieria de Software.",
    "Ingenieria Ambiental.",
    "Ingenieria en Salud Ocupacional.",
    "Ingenieria de Alimentos.",
    "Ingenieria Electrica.",
    "Administracion Digital.",
])

h2(doc, "Roles de Usuario")
vin(doc, [
    "Estudiante (STUDENT): registra diarios, emociones, conversa con el profesional asignado, firma el consentimiento informado y consulta sus estadisticas personales.",
    "Profesional (PROFESSIONAL): crea salas de chat, da seguimiento a los diarios de los estudiantes, consulta estadisticas agregadas, revisa consentimientos y recibe alertas automaticas generadas por la inteligencia artificial ante indicadores de riesgo.",
])

# 4. Requisitos
h1(doc, "Requisitos Tecnicos")
vin(doc, [
    "Conexion estable a internet.",
    "Navegador actualizado (Google Chrome, Mozilla Firefox, Microsoft Edge o Safari) para la version web.",
    "Dispositivo Android 8.0 o superior.",
    "Dispositivo iOS 13 o superior.",
    "Correo electronico valido para el proceso de verificacion.",
    "Camara y microfono opcionales para adjuntar multimedia al diario y al chat, y para grabar notas de voz.",
    "Permisos del sistema operativo para almacenamiento, camara y microfono cuando la aplicacion los solicite.",
])

# 5. Registro
h1(doc, "Registro de Usuario")
parr(doc,
    "Para crear una cuenta el usuario debe presionar la opcion Registrarse en la pantalla "
    "inicial. El formulario solicita los siguientes datos: nombre, apellido, correo "
    "electronico, contrasena, confirmacion de contrasena, programa academico y fecha de "
    "nacimiento. La contrasena debe cumplir con criterios de seguridad y no puede ser "
    "identica a la contrasena actual en caso de reinicio posterior. Una vez enviado el "
    "formulario, el sistema genera un token de verificacion con vigencia de veinticuatro "
    "horas y lo envia al correo registrado.")

h2(doc, "Pasos Detallados")
num(doc, [
    "Abrir la aplicacion e ingresar a la pantalla de autenticacion.",
    "Seleccionar la opcion Registrarse.",
    "Completar nombre, apellido, correo, contrasena y su confirmacion.",
    "Seleccionar el programa academico desde la lista desplegable.",
    "Indicar la fecha de nacimiento. Si el usuario es menor de edad, el sistema lo detectara automaticamente y solicitara posteriormente los datos del acudiente.",
    "Presionar el boton Registrarse.",
    "Revisar el correo electronico recibido y hacer clic en el enlace de verificacion.",
    "Regresar a la aplicacion e iniciar sesion con las credenciales creadas.",
])

# 6. Verificacion correo
h1(doc, "Verificacion del Correo Electronico")
parr(doc,
    "El enlace enviado al correo redirige al usuario a la pantalla de verificacion. Durante "
    "la verificacion se muestra un indicador de carga. Si el token es valido y no ha "
    "expirado, el sistema activa la cuenta y redirige automaticamente al flujo de "
    "consentimiento informado. Si el token es invalido o ha expirado, se presenta un "
    "mensaje de error y la opcion de volver a la pantalla de inicio de sesion.")
parr(doc,
    "Una vez verificado el correo, el sistema crea automaticamente salas de chat con los "
    "profesionales asignados, de modo que el estudiante podra establecer contacto con "
    "ellos desde su primer ingreso.")

# 7. Consentimiento
h1(doc, "Consentimiento Informado")
parr(doc,
    "La firma del consentimiento es obligatoria antes de utilizar las funciones principales. "
    "La pantalla se divide en dos columnas. En la columna izquierda se presenta el texto "
    "legal completo (cubre terapia, confidencialidad, tratamiento de datos personales, uso "
    "de inteligencia artificial y protocolo de emergencias) y los datos del firmante: "
    "nombre, documento, programa, correo y fecha. En la columna derecha se ubica el panel "
    "de firma digital, compuesto por un lienzo blanco donde el usuario dibuja su firma con "
    "el dedo o el raton, y el boton Firmar documento.")

h2(doc, "Flujo para Mayores de Edad")
num(doc, [
    "Leer el texto legal presentado en la columna izquierda.",
    "Verificar que los datos del firmante sean correctos.",
    "Trazar la firma en el lienzo blanco de la columna derecha.",
    "Presionar Firmar documento.",
    "Esperar la confirmacion. El sistema genera un PDF con la firma incrustada y lo almacena en servidor.",
])

h2(doc, "Flujo para Menores de Edad")
parr(doc,
    "Si el sistema detecta que el usuario es menor de dieciocho anos, aparece una alerta "
    "naranja que indica que se requiere autorizacion de un acudiente. Adicional a los pasos "
    "anteriores, el formulario solicita el nombre completo del padre, madre o tutor legal y "
    "un numero de telefono de diez digitos. La firma digital en este caso representa el "
    "consentimiento tanto del menor como de su acudiente.")

# 8. Inicio de sesion
h1(doc, "Inicio de Sesion")
parr(doc,
    "Desde la pantalla de autenticacion, el usuario ingresa su correo y contrasena y "
    "presiona Iniciar sesion. Junto al campo de contrasena se encuentra un boton que "
    "permite alternar la visibilidad del texto. Si las credenciales son incorrectas, se "
    "muestra un mensaje de error. Tras varios intentos fallidos consecutivos el sistema "
    "bloquea temporalmente la cuenta durante un periodo predefinido para prevenir accesos "
    "no autorizados. El sistema tambien mantiene un historial de los inicios de sesion con "
    "direccion IP, navegador y hora, como medida de auditoria.")

h2(doc, "Recuperacion de Contrasena")
parr(doc,
    "Si el usuario olvida su contrasena, debe seleccionar la opcion ?Olvidaste tu contrasena? "
    "Ingresar el correo registrado y presionar Enviar enlace. El sistema envia un correo con "
    "un enlace de vigencia limitada. Al abrirlo, el usuario define la nueva contrasena y la "
    "confirma. El sistema no permite reutilizar la contrasena actual.")

# 9. Interfaz principal
h1(doc, "Interfaz Principal y Navegacion")
parr(doc,
    "Despues del inicio de sesion, la aplicacion muestra el panel principal. En dispositivos "
    "de escritorio la navegacion se realiza a traves de una barra lateral fija de 260 "
    "pixeles que se puede colapsar a 78 pixeles mediante un boton flotante; en dispositivos "
    "moviles la barra lateral se abre como panel deslizable desde un boton de menu ubicado "
    "en la parte superior. La barra lateral contiene: el logo, una tarjeta con el avatar, "
    "nombre y correo del usuario, los accesos a las secciones principales, el conmutador de "
    "tema y de idioma, y el boton de cierre de sesion en color rojo.")

h2(doc, "Accesos para Estudiante")
vin(doc, [
    "Inicio: panel personal con saludo, retroalimentacion o prediccion emocional y rueda de emociones.",
    "Diario: listado y creacion de entradas de diario.",
    "Chat: conversaciones con el profesional asignado.",
    "Preferencias: tema e idioma.",
])

h2(doc, "Accesos para Profesional")
vin(doc, [
    "Inicio: panel con los diarios recientes de los estudiantes asignados.",
    "Chat: salas de conversacion con estudiantes.",
    "Estadisticas: analisis agregado de emociones con filtros por programa, rango de edad y fechas.",
    "Consentimientos: listado de consentimientos firmados por los estudiantes.",
    "Preferencias: tema e idioma.",
])

# 10. Home estudiante
h1(doc, "Panel de Inicio del Estudiante")
parr(doc,
    "Al ingresar, el estudiante encuentra un saludo personalizado con la pregunta ?Como te "
    "sientes hoy? Debajo aparece una tarjeta de insight que muestra, segun el caso, la "
    "retroalimentacion generada por la inteligencia artificial tras el ultimo registro "
    "emocional o una prediccion emocional del dia basada en el historial.")
parr(doc,
    "Seguidamente se muestra la rueda de emociones, un componente circular con ocho o mas "
    "emociones ordenadas radialmente, cada una con un color caracteristico. Al presionar "
    "una emocion el sistema registra el evento y genera una retroalimentacion empatica de "
    "dos o tres oraciones por medio del modelo de inteligencia artificial configurado. La "
    "aplicacion aplica un tiempo de espera minimo entre registros consecutivos de la misma "
    "emocion para evitar duplicados; durante este periodo el boton permanece deshabilitado.")
parr(doc,
    "Debajo de la rueda se encuentra el boton Ir a diario, que permite al estudiante "
    "continuar escribiendo en su diario personal.")

# 11. Diario
h1(doc, "Diario Emocional")
parr(doc,
    "El modulo de diario permite al estudiante llevar un registro privado de sus "
    "pensamientos, emociones y experiencias. Cada entrada puede incluir titulo, contenido "
    "textual extenso, un estado de animo seleccionado desde una lista y archivos "
    "multimedia (imagenes, audio y video). El contenido se almacena en el servidor de "
    "forma cifrada y los archivos se entregan mediante enlaces firmados con duracion "
    "limitada.")

h2(doc, "Listado de Diarios")
parr(doc,
    "La pantalla Mis Diarios muestra todas las entradas del estudiante en orden cronologico "
    "inverso. En la parte superior derecha se ubica el boton Nuevo Diario. Una barra de "
    "busqueda permite filtrar por titulo o contenido con un retardo de cuatrocientos "
    "milisegundos para evitar llamadas innecesarias al servidor. El listado usa carga "
    "progresiva: al llegar al final, mas entradas se cargan automaticamente. Cada tarjeta "
    "presenta avatar del usuario, titulo, vista previa del contenido, fecha formateada en "
    "el idioma configurado y el estado de animo asociado. Si no existen diarios, se "
    "muestra una pantalla vacia con un boton de accion para crear el primero.")

h2(doc, "Crear una Entrada de Diario")
num(doc, [
    "Ingresar a Diario y presionar Nuevo Diario.",
    "Escribir un titulo de al menos tres caracteres.",
    "Redactar el contenido (minimo diez caracteres).",
    "Seleccionar el estado de animo desde la lista desplegable.",
    "Opcionalmente, presionar Agregar medios para adjuntar imagenes o videos mediante el selector de archivos o arrastrando elementos.",
    "Eliminar cualquier archivo adjuntado mediante el boton con forma de equis que aparece al pasar el cursor sobre su miniatura.",
    "Presionar Publicar diario. La entrada se guarda y, en segundo plano, el sistema ejecuta un analisis de riesgo sobre el contenido.",
])

h2(doc, "Detalle, Edicion y Eliminacion de Diarios")
parr(doc,
    "Al presionar una tarjeta del listado se abre el detalle de la entrada. En la esquina "
    "superior derecha aparecen los botones Editar (icono de lapiz) y Eliminar (icono de "
    "papelera), visibles unicamente para el autor. El boton Editar activa un formulario "
    "identico al de creacion con los campos precargados; el boton Eliminar solicita "
    "confirmacion antes de borrar la entrada y sus archivos asociados. La galeria "
    "multimedia admite vista en pantalla completa para imagenes y un reproductor "
    "incorporado para videos.")

# 12. Emociones
h1(doc, "Rueda de Emociones y Retroalimentacion por IA")
parr(doc,
    "La rueda de emociones se inspira en los modelos de Plutchik (1980) y Ekman (1992). "
    "Cada emocion tiene un color distintivo e intensidad visual asociada. Al registrar una "
    "emocion el sistema solicita una breve descripcion del contexto y, con esa informacion, "
    "genera retroalimentacion empatica mediante el proveedor de inteligencia artificial "
    "configurado (OpenAI, Anthropic o Deepseek). La respuesta se entrega en el idioma "
    "seleccionado por el usuario.")

h2(doc, "Limites Operativos del Registro de Emociones")
vin(doc, [
    "Maximo diez registros por hora por usuario (proteccion de consumo de inteligencia artificial).",
    "Tiempo de espera minimo de sesenta segundos entre registros consecutivos.",
    "Maximo diez registros por dia por usuario.",
    "Memoria cache: si se registra la misma emocion durante la ultima hora, el sistema reutiliza la retroalimentacion previa.",
])

h2(doc, "Prediccion Emocional")
parr(doc,
    "Cada dia, el sistema genera una prediccion del estado emocional basada en el historial "
    "reciente del usuario. La prediccion se almacena con una restriccion de unicidad por dia "
    "y por usuario, y se muestra en el panel de inicio como tarjeta de insight. Su "
    "proposito es informativo y de autoconocimiento; no constituye un diagnostico clinico.")

# 13. Chat
h1(doc, "Chat con Profesionales")
parr(doc,
    "El modulo de chat permite comunicacion bidireccional en tiempo real entre el estudiante "
    "y el profesional asignado. Las salas son creadas por el profesional y pueden ser de "
    "uno a uno o grupales. Los mensajes se transmiten mediante websockets (Socket.io) y se "
    "persisten en la base de datos.")

h2(doc, "Listado de Salas")
parr(doc,
    "La pantalla muestra todas las salas disponibles para el usuario. Cada elemento "
    "presenta avatar, nombre de la sala (o nombre del interlocutor en salas uno a uno), un "
    "rotulo que indica el rol del contacto, una vista previa del ultimo mensaje y un "
    "contador de mensajes no leidos representado en un circulo rojo. Cuando el numero "
    "supera nueve se muestra el indicador 9+. Una barra de busqueda permite filtrar salas "
    "por nombre con el mismo retardo de cuatrocientos milisegundos.")

h2(doc, "Conversacion en una Sala")
parr(doc,
    "Al abrir una sala, el usuario encuentra el historial completo de mensajes con "
    "separadores por dia (Hoy, Ayer o la fecha correspondiente). Los mensajes propios se "
    "alinean a la derecha con color primario y los del interlocutor se alinean a la "
    "izquierda con fondo gris claro. Cada burbuja muestra el contenido, la hora de envio "
    "y un indicador de lectura (un paloteo simple para enviado y doble para leido). "
    "Cuando el interlocutor escribe, aparece una burbuja con tres puntos animados. Si el "
    "usuario desplaza la conversacion hacia arriba y llegan mensajes nuevos, se muestra un "
    "boton flotante que permite regresar al ultimo mensaje rapidamente.")

h2(doc, "Opciones del Mensaje")
parr(doc,
    "Al presionar una burbuja se despliega un menu contextual con las opciones Responder, "
    "Copiar y Eliminar. La opcion Responder activa una vista previa compacta en el area de "
    "entrada, que puede descartarse con un boton de cancelacion. El usuario puede tambien "
    "abrir un selector de fecha en la cabecera para buscar mensajes de un dia especifico.")

h2(doc, "Area de Entrada y Envio de Contenido")
vin(doc, [
    "Caja de texto multilinea con soporte para salto de linea mediante Shift+Enter.",
    "Boton de clip para adjuntar hasta diez archivos (imagenes, videos, audios o documentos) en un solo mensaje.",
    "Boton de imagen para abrir directamente el selector de fotografias.",
    "Boton de microfono para grabar notas de voz dentro del navegador, con temporizador visible y opciones de detener o cancelar.",
    "Boton de envio en forma de avion de papel que despacha texto y adjuntos.",
    "Barra de progreso durante la subida de medios.",
])

h2(doc, "Eventos en Tiempo Real")
vin(doc, [
    "chat:new-message: nuevo mensaje recibido.",
    "chat:delivered: confirmacion de entrega al servidor.",
    "chat:read: confirmacion de lectura por el destinatario.",
    "chat:open-room: el usuario abrio la sala y todos los mensajes previos quedan marcados como leidos.",
])

# 14. Estadisticas
h1(doc, "Estadisticas y Analisis Emocional")
parr(doc,
    "El modulo de estadisticas, disponible para el profesional, presenta un panel con "
    "filtros y tres tipos de graficos. El panel de filtros permite seleccionar el programa "
    "academico, el rango de edad minima y maxima, y las fechas desde y hasta. Los botones "
    "Aplicar filtros y Limpiar filtros recargan la informacion. Adicionalmente se muestra "
    "una tarjeta con el total de registros emocionales.")

h2(doc, "Graficos Disponibles")
vin(doc, [
    "Grafico de barras horizontales: emociones ordenadas por frecuencia.",
    "Grafico de linea: evolucion temporal de registros emocionales.",
    "Grafico de dona: distribucion proporcional de emociones.",
    "Tabla de desglose con punto de color, nombre de la emocion, numero de registros, barra de progreso y porcentaje.",
])

# 15. Consentimientos (profesional)
h1(doc, "Consulta de Consentimientos")
parr(doc,
    "El profesional puede consultar la lista completa de consentimientos firmados por los "
    "estudiantes. Cada registro muestra el nombre del estudiante, el documento, la fecha de "
    "firma y un enlace para visualizar el PDF generado. El PDF incluye encabezado "
    "institucional, texto legal, datos del firmante, datos del acudiente cuando "
    "corresponda, la firma digital incrustada y la marca de tiempo en zona horaria America "
    "Bogota.")

# 16. Perfil y avatar
h1(doc, "Perfil de Usuario")
parr(doc,
    "Desde la tarjeta de usuario ubicada en la barra lateral, o desde el menu de perfil, "
    "el usuario puede consultar y editar sus datos personales: nombre, apellido, fecha de "
    "nacimiento, documento de identidad, programa academico y sexo. Tambien puede cambiar "
    "su avatar mediante el boton de carga, que admite archivos JPEG, PNG, WebP o GIF con "
    "un tamano maximo de cinco megabytes. Al subir un nuevo avatar, el anterior se elimina "
    "automaticamente del almacenamiento.")

# 17. Notificaciones
h1(doc, "Notificaciones")
parr(doc,
    "La campana de notificaciones, visible en la barra lateral, muestra un distintivo rojo "
    "con el numero de notificaciones no leidas. Al presionarla se despliega un panel con "
    "encabezado que indica la cantidad de no leidas y presenta los botones Marcar todo "
    "leido y Eliminar todo. Debajo se muestran pestanas para filtrar por estado: Todas, "
    "No leidas y Leidas, y una caja de busqueda para encontrar notificaciones por texto.")

h2(doc, "Tipos de Notificacion")
vin(doc, [
    "Nuevo mensaje en chat (CHAT_NEW_MESSAGE): informa al usuario sobre mensajes recientes; al presionarla se abre la sala correspondiente.",
    "Alerta de riesgo en diario (DIARY_RISK_ALERT): se envia unicamente al profesional cuando la inteligencia artificial detecta indicadores de riesgo en la escritura de un estudiante.",
])

# 18. Preferencias
h1(doc, "Preferencias de la Aplicacion")
parr(doc,
    "En la pantalla de preferencias el usuario puede ajustar dos aspectos:")
vin(doc, [
    "Apariencia: tres botones permiten seleccionar el tema Claro, Oscuro o Sistema. El tema se aplica de forma inmediata sin recargar la aplicacion y se sincroniza entre dispositivos.",
    "Idioma: dos botones permiten elegir Espanol o Ingles. El cambio recarga las traducciones en tiempo real y actualiza las claves de error provenientes del servidor.",
])
parr(doc,
    "Las preferencias incluyen tambien el control para habilitar o deshabilitar las "
    "notificaciones del sistema, que por defecto estan activas.")

# 19. Panel profesional
h1(doc, "Panel y Flujo del Profesional")
parr(doc,
    "El profesional accede a un panel de inicio diferente, titulado Diarios de tus "
    "estudiantes. En la parte superior se encuentra una barra de busqueda que permite "
    "filtrar por nombre del estudiante o por contenido del diario. Debajo se muestra una "
    "lista paginada con las entradas recientes de todos los estudiantes. Al presionar una "
    "tarjeta se abre el detalle del diario en modo solo lectura, sin opciones de edicion o "
    "eliminacion.")
parr(doc,
    "El profesional tambien puede crear nuevas salas de chat con los estudiantes que "
    "requieran seguimiento, visualizar las estadisticas agregadas, consultar los "
    "consentimientos firmados y recibir en tiempo real las notificaciones de alerta "
    "generadas por la inteligencia artificial.")

# 20. IA
h1(doc, "Inteligencia Artificial en el Apoyo a la Salud Mental")
parr(doc,
    "InsideOutExpressions integra modelos de lenguaje de gran escala a traves de tres "
    "proveedores configurables: OpenAI, Anthropic y Deepseek. La configuracion del "
    "proveedor se realiza en el servidor y es transparente para el usuario final. La "
    "inteligencia artificial cumple funciones especificas y limitadas, orientadas al "
    "acompanamiento emocional y a la deteccion temprana de riesgos.")

h2(doc, "Funciones de la Inteligencia Artificial")

h3(doc, "Retroalimentacion empatica en registros emocionales.")
parr(doc,
    "Cuando el estudiante registra una emocion, el sistema envia al proveedor una solicitud "
    "con la emocion seleccionada y el idioma del usuario. El modelo retorna una respuesta "
    "empatica de dos o tres oraciones, no directiva, que valida la emocion y sugiere, "
    "cuando es apropiado, estrategias de afrontamiento o la conveniencia de buscar apoyo "
    "profesional.")

h3(doc, "Analisis de riesgo en entradas de diario.")
parr(doc,
    "Cada vez que el estudiante publica una entrada de diario, el sistema ejecuta, en "
    "segundo plano, un analisis sobre los primeros quinientos caracteres del contenido. El "
    "modelo recibe un prompt especifico que indica detectar indicadores de suicidio, "
    "autolesion, violencia, depresion severa, consumo problematico de sustancias o "
    "trastornos de la conducta alimentaria. La respuesta se limita a YES o NO, con "
    "temperatura cero y un maximo de cinco tokens, lo que garantiza rapidez y deterministicos. "
    "Si el resultado es afirmativo, el servidor emite una notificacion del tipo "
    "DIARY_RISK_ALERT a todos los profesionales, con un extracto del contenido y la "
    "referencia al estudiante.")

h3(doc, "Prediccion emocional.")
parr(doc,
    "A partir del historial emocional reciente, el sistema genera una prediccion del estado "
    "emocional para el dia en curso. Esta prediccion se almacena una sola vez al dia por "
    "usuario y se presenta en el panel de inicio como un elemento informativo, que no "
    "sustituye el juicio clinico de un profesional.")

h2(doc, "Apoyo ante Crisis")
parr(doc,
    "El aplicativo entiende por crisis cualquier situacion en la que el estudiante presenta "
    "signos de ideacion suicida, autolesion o angustia severa. En esos casos, la "
    "inteligencia artificial contribuye al cuidado del usuario de las siguientes formas:")
vin(doc, [
    "Detecta automaticamente indicadores linguisticos de riesgo en los diarios y alerta al profesional asignado, permitiendo una intervencion oportuna.",
    "Muestra al usuario recursos de ayuda inmediata, como lineas telefonicas de atencion en crisis, cuando el contenido asi lo sugiere.",
    "Sugiere estrategias breves de contencion (respiracion, anclaje y busqueda de apoyo humano) entre sesiones profesionales.",
    "Preserva la privacidad del usuario, evitando compartir el texto completo del diario y ofreciendo unicamente un extracto al profesional.",
])

h2(doc, "Limitaciones Eticas")
parr(doc,
    "La inteligencia artificial no emite diagnosticos clinicos, no prescribe tratamientos y "
    "no reemplaza la intervencion humana. Ante cualquier emergencia, el usuario debe "
    "contactar inmediatamente los canales de ayuda oficiales o a su profesional de "
    "referencia. El sistema se rige por los principios eticos de la American Psychological "
    "Association (2017) y por la normativa colombiana de proteccion de datos (Congreso de "
    "la Republica, 2012).")

# 21. Seguridad
h1(doc, "Seguridad y Proteccion de Datos")
vin(doc, [
    "Contrasenas almacenadas con bcrypt y sal unica por usuario.",
    "Autenticacion mediante tokens JWT de corta duracion y rotacion automatica del token de refresco; la deteccion de reutilizacion fraudulenta revoca todas las sesiones activas.",
    "Registro de historial de inicio de sesion con direccion IP, navegador y fecha.",
    "Bloqueo temporal de la cuenta tras multiples intentos fallidos.",
    "Limitacion de solicitudes (rate limiting) diferenciada para endpoints generales y sensibles.",
    "Archivos multimedia entregados mediante enlaces firmados de vigencia limitada.",
    "Consentimiento informado firmado digitalmente y almacenado como PDF cifrado.",
    "Cifrado en transito (HTTPS/WSS) y politica estricta de acceso para los profesionales.",
])

# 22. Buenas practicas
h1(doc, "Recomendaciones de Uso Responsable")
vin(doc, [
    "Utilizar la aplicacion como complemento, no como sustituto, del acompanamiento profesional.",
    "Registrar emociones y diarios con regularidad para obtener estadisticas y predicciones mas precisas.",
    "No compartir credenciales con terceros y cerrar sesion en dispositivos compartidos.",
    "Ante ideas de autolesion o crisis, contactar de inmediato los canales de emergencia.",
    "Respetar la confidencialidad de las conversaciones y abstenerse de difundir capturas sin autorizacion.",
    "Mantener la aplicacion y el sistema operativo actualizados para recibir parches de seguridad.",
])

# 23. FAQ
h1(doc, "Preguntas Frecuentes")

h3(doc, "?Es gratuita la aplicacion?")
parr(doc,
    "Si. Se trata de un servicio institucional disponible para los estudiantes activos y "
    "los profesionales vinculados al programa de bienestar universitario.")

h3(doc, "?Puede el profesional leer mi diario sin permiso?")
parr(doc,
    "Las entradas del diario son privadas. El profesional unicamente puede consultarlas "
    "cuando el estudiante otorga acceso explicitamente o cuando la inteligencia artificial "
    "detecta un indicador de riesgo, en cuyo caso el profesional recibe una alerta con un "
    "extracto del texto.")

h3(doc, "?Que ocurre si pierdo mi contrasena?")
parr(doc,
    "Puede solicitar un enlace de recuperacion a traves de la opcion ?Olvidaste tu contrasena? "
    "El enlace llega al correo registrado y permite definir una nueva contrasena, siempre "
    "que no coincida con la actual.")

h3(doc, "?La inteligencia artificial reemplaza a mi profesional?")
parr(doc,
    "No. La inteligencia artificial es una herramienta complementaria que ofrece "
    "retroalimentacion, deteccion temprana de riesgos y sugerencias generales. Ante "
    "cualquier crisis se debe contactar siempre a un profesional humano.")

h3(doc, "?Puedo usar la aplicacion sin verificar mi correo?")
parr(doc,
    "No. La verificacion del correo electronico es obligatoria para acceder a las funciones "
    "principales, ya que protege la identidad del usuario y previene el registro de "
    "cuentas falsas.")

h3(doc, "?Como se manejan mis datos si soy menor de edad?")
parr(doc,
    "El consentimiento requiere los datos del padre, madre o tutor legal, incluyendo "
    "nombre completo y telefono de contacto de diez digitos. La firma digital representa "
    "el consentimiento compartido entre el menor y su acudiente.")

# 24. Glosario
h1(doc, "Glosario de Terminos")
vin(doc, [
    "Autenticacion: proceso de verificacion de identidad mediante correo y contrasena.",
    "Consentimiento informado: documento legal que autoriza el tratamiento de datos y el uso de la aplicacion.",
    "Rueda de emociones: interfaz visual que representa las emociones basicas mediante colores e intensidades.",
    "Inteligencia artificial: conjunto de modelos de lenguaje que generan retroalimentacion, predicciones y analisis de riesgo.",
    "Retroalimentacion empatica: respuesta breve y validante generada por la inteligencia artificial.",
    "Prediccion emocional: estimacion del estado de animo futuro basada en el historial del usuario.",
    "Sala de chat: espacio de conversacion privado entre estudiante y profesional.",
    "Token de verificacion: cadena temporal utilizada para confirmar el correo o restablecer la contrasena.",
    "Rate limiting: mecanismo que limita el numero de solicitudes por unidad de tiempo.",
])

# 25. Referencias
h1(doc, "Referencias")
ref(doc, "American Psychological Association. (2017). Ethical principles of psychologists and code of conduct. https://www.apa.org/ethics/code")
ref(doc, "American Psychological Association. (2020). Publication manual of the American Psychological Association (7a ed.). https://doi.org/10.1037/0000165-000")
ref(doc, "Congreso de la Republica de Colombia. (2012). Ley 1581 de 2012, por la cual se dictan disposiciones generales para la proteccion de datos personales. Diario Oficial No. 48.587.")
ref(doc, "Ekman, P. (1992). An argument for basic emotions. Cognition and Emotion, 6(3-4), 169-200. https://doi.org/10.1080/02699939208411068")
ref(doc, "Organizacion Mundial de la Salud. (2022). Informe mundial sobre salud mental: transformar la salud mental para todos. https://www.who.int/es/publications/i/item/9789240050860")
ref(doc, "Plutchik, R. (1980). A general psychoevolutionary theory of emotion. En R. Plutchik y H. Kellerman (Eds.), Theories of emotion (pp. 3-33). Academic Press.")
ref(doc, "Torous, J., Bucci, S., Bell, I. H., Kessing, L. V., Faurholt-Jepsen, M., Whelan, P., Carvalho, A. F., Keshavan, M., Linardon, J. y Firth, J. (2021). The growing field of digital psychiatry: Current evidence and the future of apps, social media, chatbots, and virtual reality. World Psychiatry, 20(3), 318-335. https://doi.org/10.1002/wps.20883")

out = '/home/santiagogo/Documentos/InsideOutExpressions/inside-bk/Manual_Usuario_InsideOut_Expressions.docx'
doc.save(out)
print(f"Generado: {out}")
