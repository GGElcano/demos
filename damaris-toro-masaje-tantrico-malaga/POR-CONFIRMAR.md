# Dámaris Toro · lo que falta confirmar con ella

Demo hecha el 19-oct-2026 con su Instagram público (@superdama79) como única fuente.
**21-oct-2026:** rehecha según sus dos audios de WhatsApp (varias páginas, sin precios, blog,
vídeo, TikTok, minimalista y en tonos pastel). Lo que sigue pendiente de ella:

| Dato | Dónde sale en la web | Qué hay ahora |
|---|---|---|
| Su presentación («quién soy») | Sobre mí | Sus textos de Instagram, marcados «Texto provisional» |
| Propósito, visión y misión | Sobre mí | Frases suyas de Instagram, marcadas «Texto provisional» |
| Fotos nuevas («las fotos me gustaría que fueran otras») | Todas las páginas | Sus 12 fotos de Instagram (640 px) |
| Vídeo corto | Inicio, «Un minuto conmigo» | Su reel de la sala con velas (se abre de Instagram) |
| Usuario de TikTok | Icono en portada y pie de todas las páginas | Enlace a tiktok.com sin usuario: cambiar `https://www.tiktok.com/` en las 8 páginas |
| Fechas de talleres, retiros y agenda en Barcelona y Madrid | Blog y Servicios | «Retiros en la naturaleza» y «Agenda en Barcelona y Madrid», fechas por anunciar |
| Su trayectoria (formación, años de experiencia) | Sobre mí, «Mi trayectoria» | Solo lo que sabemos: Málaga, Barcelona y Madrid, retiros, Instagram |
| Dirección o zona exacta de Málaga | Preguntas, legales | «Te la paso al confirmar la cita» |
| Si atiende en inglés | Toda la parte /en/ | Se da por hecho al tener versión inglesa |
| Titular, NIF y email | Aviso legal y privacidad | [Pendiente de facilitar por el titular] |

**22-oct-2026: carta de servicios = la SUYA** (su PDF «masajes dama 2» + su audio de las 10:56):
Despertar solar (masculino, 1 h), Despertar lunar (femenino, 1 h), Apertura de corazón (45 min,
pecho, brazos, cara y cráneo), Alquimia de dos (pareja, con uno o dos masajistas), Olas en
sincronía (cuatro manos, masajista hombre y mujer), Talleres y retiros. Más «Un espacio de
confianza» y «Para personas que…». Quitada la tarjeta «Sexualidad holística» (no está en su lista).

**Precios: PUESTOS (audio 22-oct 10:59):** individuales (Despertar solar y lunar) 100 € / 1 h; pareja 200 € / 1 h
(ella suele alargarla en el gabinete); cuatro manos 200 € / 1 h; Apertura de corazón 60 € / 45 min.

Pendiente también: texto propio de «Apertura de corazón» (dijo que lo manda escrito),
duración de pareja y cuatro manos, si añade un masaje relajante NO tántrico (lo pregunta ella),
y cuál de los dos nombres quiere en cada servicio (en el PDF pone dos: «Despertar solar o
inmersión masculina»; se usa el primero como título y el segundo de subtítulo).

**Blog:** en la demo las entradas van escritas a mano. Ella quiere «ir subiendo reflexiones,
talleres, eventos especiales»: en la web definitiva necesita un panel para subirlas sola.

Al tenerlo todo: quitar el `<aside class="aviso-maqueta">` de las 8 páginas, las etiquetas
«Texto provisional» y la línea `<meta name="robots" content="noindex">`, y cambiar las URLs
ggelcano.github.io por su dominio.

**22-oct-2026, material recibido por WhatsApp (18 fotos + 11 vídeos):** guardado fuera del repo en
`~/Documents/damaris-material-22oct/` (buenas / dudosas / descartadas / videos). Su TikTok es
**@damaris_arte_del_tacto** (sale en la marca de agua de sus vídeos): cambiar `https://www.tiktok.com/`.
Sus vídeos V2 y V3 anuncian **agenda abierta en Madrid del 2 al 4 de noviembre** (para el blog/agenda).

**22-oct-2026 (tarde), aplicado y publicado:** fotos suyas nuevas en servicios, Sobre mí y portada;
«Sobre mí» reescrito con su documento de marca (deporte profesional, cambio vital, formación,
referentes, promesa); «El Ritual de Bienvenida» en cómo es una sesión; pregunta de desnudez
(«no es un servicio sexual», criterio de Sergio: es tantra, se da a entender sin ofrecer servicio
sexual); TikTok @damaris_arte_del_tacto en las 8 páginas; Madrid 2 al 4 de noviembre en el blog;
fuera «sexualidad holística» de la portada. Falta de ella: que revise su historia en «Sobre mí»,
texto propio de Apertura de corazón y fechas de Barcelona.

**22-oct-2026 (noche), portada:** vídeo de fondo (montaje de sus vídeos y fotos:
`assets/portada-video.mp4` 16:9 para ordenador y `portada-video-movil.mp4` 9:16, con póster cada
uno). Se rehace con `~/Documents/damaris-material-22oct/montar_video_portada.py <carpeta assets>`.
Arco de la portada: el abrazo recortado en su cara (`damaris-toro-abrazo-portada.jpg`); el selfie y
la foto vieja de las manos en el pecho ya no se usan (no le gustaban). Sobre mí: ella dando el masaje.

**22-oct-2026 (noche), repaso de encaje de textos:** la sección del dibujo (loto y chakras) se
cortaba por abajo en el ordenador (heredaba el relleno general de `section`: 112 px); ahora el
dibujo se encaja midiendo los textos (ordenador: textos a la izquierda y dibujo a la derecha;
móvil: entre el título y la frase), nombres de los chakras fuera de los pétalos y modo estático
con la figura terminada. Además: capa más oscura tras «Un rincón de paz te espera», tabla de
cookies en fichas en el móvil y cortes de línea equilibrados (`text-wrap`) en toda la web.
