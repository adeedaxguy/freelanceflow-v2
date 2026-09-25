import type { SupportedLocale } from "@/lib/i18n";

export type LocalizedPageKey = "home" | "web-design-leads" | "client-acquisition-system";

type LocalizedPage = {
  path: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  directAnswer: string;
  primaryCta: string;
  secondaryCta: string;
  benefitsTitle: string;
  benefits: { title: string; text: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
};

export const localizedMarketing: Record<SupportedLocale, Record<LocalizedPageKey, LocalizedPage>> = {
  es: {
    home: {
      path: "",
      title: "iCloseLeads en español | Leads y captación de clientes para freelancers",
      description: "Encuentra leads locales y remotos, identifica señales de compra y prepara propuestas y seguimientos desde un solo espacio de trabajo.",
      heading: "Consigue mejores clientes sin depender de listas genéricas",
      intro: "iCloseLeads ayuda a freelancers y pequeñas agencias a encontrar oportunidades locales, empleos remotos y señales de demanda, evaluar cada lead y mantener el seguimiento organizado.",
      directAnswer: "Empieza con una búsqueda concreta por servicio, nicho o ciudad. Guarda solo los prospectos con una necesidad visible y convierte esa señal en una propuesta breve y relevante.",
      primaryCta: "Probar gratis durante 3 días",
      secondaryCta: "Ver leads de diseño web",
      benefitsTitle: "De la señal de compra al siguiente paso",
      benefits: [
        { title: "Leads con contexto", text: "Busca empresas locales, oportunidades remotas y demanda reciente con una razón clara para contactar." },
        { title: "Investigación práctica", text: "Comprueba la empresa, la persona adecuada y el canal de contacto antes de preparar tu mensaje." },
        { title: "Seguimiento visible", text: "Guarda notas, propuestas y próximas acciones en un CRM ligero pensado para freelancers." },
      ],
      stepsTitle: "Un sistema sencillo de captación",
      steps: [
        { title: "Define un mercado", text: "Elige un servicio, un nicho y una zona en los que puedas aportar un resultado concreto." },
        { title: "Detecta la necesidad", text: "Prioriza sitios web débiles, contrataciones recientes y solicitudes públicas de ayuda." },
        { title: "Verifica y presenta", text: "Confirma el contexto y prepara una propuesta específica antes de contactar." },
      ],
      faqTitle: "Preguntas frecuentes",
      faqs: [
        { question: "¿iCloseLeads sirve para autónomos?", answer: "Sí. Está diseñado para freelancers, consultores y agencias pequeñas que necesitan un flujo de captación repetible." },
        { question: "¿Puedo empezar gratis?", answer: "Sí. La prueba gratuita de 3 días permite explorar hasta 600 resultados de leads sin tarjeta de crédito." },
        { question: "¿La IA envía mensajes automáticamente?", answer: "No. La IA ayuda a preparar un borrador, pero tú revisas y decides qué se envía." },
      ],
    },
    "web-design-leads": {
      path: "/lead-generation/web-design-leads",
      title: "Leads de diseño web | Encuentra clientes para páginas web",
      description: "Encuentra empresas que necesitan una página web, una mejora móvil, reservas más claras o una mejor conversión y prepara un contacto relevante.",
      heading: "Encuentra clientes de diseño web con una necesidad visible",
      intro: "Busca empresas sin web, con una experiencia móvil deficiente o con un proceso de reserva confuso. Verifica la oportunidad y presenta una mejora concreta.",
      directAnswer: "Los mejores leads de diseño web no son listas de empresas al azar: muestran una brecha pública que puedes explicar, verificar y convertir en una propuesta útil.",
      primaryCta: "Buscar leads gratis",
      secondaryCta: "Conocer iCloseLeads",
      benefitsTitle: "Señales que justifican una propuesta",
      benefits: [
        { title: "Sin web verificada", text: "Localiza negocios con teléfono y ficha pública, pero sin una web clara o actualizada." },
        { title: "Conversión y reservas", text: "Prioriza clínicas y servicios locales cuyo recorrido móvil o de reserva dificulta la acción." },
        { title: "Demanda reciente", text: "Combina señales locales con ofertas remotas de WordPress, Webflow, Shopify y landing pages." },
      ],
      stepsTitle: "Cómo trabajar cada lead",
      steps: [
        { title: "Busca un nicho y una ciudad", text: "Mantén la lista pequeña y relevante para poder investigar cada oportunidad." },
        { title: "Comprueba la brecha", text: "Abre la web, la ficha y el contacto público antes de decidir si merece una propuesta." },
        { title: "Presenta un resultado", text: "Habla de llamadas, reservas, confianza o conversión; no envíes solo tu portfolio." },
      ],
      faqTitle: "Preguntas sobre leads de diseño web",
      faqs: [
        { question: "¿Qué es un lead de diseño web?", answer: "Es una empresa o señal de contratación donde una nueva web, landing page o mejora de conversión puede resolver un problema visible." },
        { question: "¿Puedo buscar empresas sin página web?", answer: "Sí. Puedes priorizar perfiles con web desconocida o no verificada y confirmar la información antes de contactar." },
        { question: "¿Qué hago después de encontrar un lead?", answer: "Verifica el negocio, guarda la evidencia, identifica a la persona adecuada y prepara un mensaje breve basado en esa señal." },
      ],
    },
    "client-acquisition-system": {
      path: "/blog/freelance-client-acquisition-system",
      title: "Sistema de captación de clientes freelance paso a paso",
      description: "Crea un sistema semanal para encontrar prospectos, verificar señales, enviar propuestas relevantes y hacer seguimiento sin perder contexto.",
      heading: "Un sistema de captación de clientes para freelancers que puedes repetir cada semana",
      intro: "La captación mejora cuando separas búsqueda, cualificación, contacto y seguimiento. Este método convierte la prospección en una rutina medible.",
      directAnswer: "Reserva bloques semanales para encontrar señales, descartar prospectos débiles, preparar mensajes específicos y revisar cada seguimiento pendiente.",
      primaryCta: "Probar el sistema con leads reales",
      secondaryCta: "Ver la plataforma",
      benefitsTitle: "Qué debe incluir el sistema",
      benefits: [
        { title: "Una fuente de demanda", text: "Combina negocios locales, empleos remotos y solicitudes recientes en lugar de depender de un solo canal." },
        { title: "Criterios de calidad", text: "Puntúa necesidad, encaje, urgencia y ruta de contacto antes de dedicar tiempo a una propuesta." },
        { title: "Seguimiento programado", text: "Define una próxima acción para cada lead y mide respuestas, reuniones y oportunidades ganadas." },
      ],
      stepsTitle: "Rutina semanal recomendada",
      steps: [
        { title: "Lunes: investigar", text: "Busca un mercado concreto y crea una lista corta de oportunidades con evidencia." },
        { title: "Martes a jueves: contactar", text: "Personaliza el mensaje, registra el envío y prepara el siguiente seguimiento." },
        { title: "Viernes: aprender", text: "Revisa qué nichos, señales y mensajes generaron respuestas y ajusta la semana siguiente." },
      ],
      faqTitle: "Preguntas sobre captación freelance",
      faqs: [
        { question: "¿Cuántos prospectos necesito?", answer: "Empieza con una lista pequeña que puedas investigar bien. Diez oportunidades relevantes suelen aportar más aprendizaje que cien contactos genéricos." },
        { question: "¿Debo usar varios canales?", answer: "Sí, cuando el contexto lo justifique. Correo, teléfono y perfiles públicos funcionan mejor cuando cada contacto parte de una necesidad real." },
        { question: "¿Qué métrica importa más?", answer: "Mide conversaciones y oportunidades cualificadas, no solo el número de mensajes enviados." },
      ],
    },
  },
  fr: {
    home: {
      path: "",
      title: "iCloseLeads en français | Prospection et acquisition client freelance",
      description: "Trouvez des prospects locaux et à distance, qualifiez les signaux d'achat, préparez vos propositions et suivez chaque relance au même endroit.",
      heading: "Trouvez de meilleurs clients sans dépendre de listes génériques",
      intro: "iCloseLeads aide les freelances et petites agences à repérer des opportunités locales, des missions à distance et des demandes récentes, puis à organiser la prospection et le suivi.",
      directAnswer: "Commencez par un service, un secteur ou une ville précis. Gardez uniquement les prospects qui présentent un besoin visible et transformez ce signal en proposition utile.",
      primaryCta: "Essayer gratuitement pendant 3 jours",
      secondaryCta: "Voir les prospects web",
      benefitsTitle: "Du signal d'achat à la prochaine action",
      benefits: [
        { title: "Prospects contextualisés", text: "Recherchez des entreprises locales, des missions à distance et des demandes récentes avec une raison claire de les contacter." },
        { title: "Recherche vérifiable", text: "Contrôlez l'entreprise, le décideur probable et le meilleur canal avant de préparer votre message." },
        { title: "Suivi organisé", text: "Conservez notes, propositions et prochaines actions dans un CRM léger conçu pour les freelances." },
      ],
      stepsTitle: "Un système d'acquisition simple",
      steps: [
        { title: "Choisissez un marché", text: "Ciblez un service, un secteur et une zone où vous pouvez apporter un résultat précis." },
        { title: "Repérez le besoin", text: "Priorisez les sites faibles, recrutements récents et demandes publiques d'aide." },
        { title: "Vérifiez et proposez", text: "Confirmez le contexte puis préparez une proposition spécifique avant tout contact." },
      ],
      faqTitle: "Questions fréquentes",
      faqs: [
        { question: "iCloseLeads convient-il aux indépendants ?", answer: "Oui. La plateforme est conçue pour les freelances, consultants et petites agences qui veulent une prospection reproductible." },
        { question: "Puis-je commencer gratuitement ?", answer: "Oui. L'essai gratuit de 3 jours permet d'explorer jusqu'à 600 résultats de prospects sans carte bancaire." },
        { question: "L'IA envoie-t-elle les messages automatiquement ?", answer: "Non. Elle aide à préparer un brouillon, mais vous gardez le contrôle de chaque envoi." },
      ],
    },
    "web-design-leads": {
      path: "/lead-generation/web-design-leads",
      title: "Prospects création de site web | Trouver des clients web",
      description: "Trouvez des entreprises qui ont besoin d'un site, d'une meilleure expérience mobile, d'un parcours de réservation plus clair ou d'une conversion améliorée.",
      heading: "Trouvez des prospects web qui ont un besoin visible",
      intro: "Repérez les entreprises sans site fiable, avec une expérience mobile faible ou un parcours de réservation confus, puis proposez une amélioration concrète.",
      directAnswer: "Un bon prospect web n'est pas un nom pris au hasard : il présente un problème public que vous pouvez vérifier, expliquer et relier à un résultat utile.",
      primaryCta: "Rechercher des prospects gratuitement",
      secondaryCta: "Découvrir iCloseLeads",
      benefitsTitle: "Des signaux qui justifient votre approche",
      benefits: [
        { title: "Aucun site fiable", text: "Repérez les entreprises avec téléphone et fiche publique, mais sans site clair ou à jour." },
        { title: "Conversion et réservation", text: "Priorisez les parcours mobiles ou de réservation qui empêchent l'utilisateur de passer à l'action." },
        { title: "Demande récente", text: "Ajoutez les missions WordPress, Webflow, Shopify et landing page publiées récemment." },
      ],
      stepsTitle: "Comment traiter chaque prospect",
      steps: [
        { title: "Ciblez un secteur et une ville", text: "Gardez une liste courte afin de pouvoir étudier chaque opportunité sérieusement." },
        { title: "Vérifiez le problème", text: "Consultez le site, la fiche et les coordonnées publiques avant de qualifier le prospect." },
        { title: "Proposez un résultat", text: "Parlez d'appels, de réservations, de confiance ou de conversion, pas uniquement de votre portfolio." },
      ],
      faqTitle: "Questions sur les prospects web",
      faqs: [
        { question: "Qu'est-ce qu'un prospect en création de site ?", answer: "C'est une entreprise ou une offre où un nouveau site, une landing page ou une amélioration de conversion répond à un besoin visible." },
        { question: "Puis-je trouver des entreprises sans site ?", answer: "Oui. Vous pouvez cibler les profils dont le site est absent ou non vérifié, puis contrôler l'information avant contact." },
        { question: "Que faire après avoir trouvé un prospect ?", answer: "Vérifiez l'entreprise, conservez la preuve, identifiez le bon interlocuteur et préparez un message bref fondé sur ce signal." },
      ],
    },
    "client-acquisition-system": {
      path: "/blog/freelance-client-acquisition-system",
      title: "Système d'acquisition client freelance : méthode hebdomadaire",
      description: "Mettez en place une routine pour trouver des prospects, vérifier les signaux, envoyer des propositions pertinentes et suivre les relances.",
      heading: "Un système d'acquisition client freelance à répéter chaque semaine",
      intro: "La prospection devient plus fiable lorsque la recherche, la qualification, le contact et la relance sont des étapes séparées et mesurables.",
      directAnswer: "Planifiez chaque semaine des créneaux pour trouver des signaux, écarter les prospects faibles, préparer des messages précis et revoir toutes les relances en attente.",
      primaryCta: "Tester le système sur de vrais prospects",
      secondaryCta: "Voir la plateforme",
      benefitsTitle: "Les éléments indispensables",
      benefits: [
        { title: "Plusieurs sources de demande", text: "Combinez entreprises locales, missions à distance et demandes récentes au lieu de dépendre d'un seul canal." },
        { title: "Des critères de qualité", text: "Évaluez le besoin, l'adéquation, l'urgence et la voie de contact avant d'écrire." },
        { title: "Des relances planifiées", text: "Attribuez une prochaine action à chaque prospect et suivez réponses, rendez-vous et opportunités gagnées." },
      ],
      stepsTitle: "Routine hebdomadaire recommandée",
      steps: [
        { title: "Lundi : rechercher", text: "Choisissez un marché précis et créez une courte liste d'opportunités étayées." },
        { title: "Mardi à jeudi : contacter", text: "Personnalisez le message, enregistrez l'envoi et programmez la prochaine relance." },
        { title: "Vendredi : apprendre", text: "Analysez les secteurs, signaux et messages qui ont généré des réponses." },
      ],
      faqTitle: "Questions sur l'acquisition freelance",
      faqs: [
        { question: "Combien de prospects faut-il ?", answer: "Commencez par une liste courte que vous pouvez réellement étudier. Dix opportunités pertinentes apportent souvent plus que cent contacts génériques." },
        { question: "Faut-il utiliser plusieurs canaux ?", answer: "Oui, lorsque le contexte le justifie. E-mail, téléphone et profils publics fonctionnent mieux à partir d'un besoin réel." },
        { question: "Quelle métrique suivre ?", answer: "Mesurez les conversations et opportunités qualifiées, pas seulement le nombre de messages envoyés." },
      ],
    },
  },
  it: {
    home: {
      path: "",
      title: "iCloseLeads in italiano | Lead generation per freelance",
      description: "Trova lead locali e da remoto, valuta i segnali di acquisto, prepara proposte mirate e organizza ogni follow-up in un unico spazio.",
      heading: "Trova clienti migliori senza dipendere da elenchi generici",
      intro: "iCloseLeads aiuta freelance e piccole agenzie a trovare opportunità locali, lavori da remoto e richieste recenti, quindi a qualificare i lead e gestire il follow-up.",
      directAnswer: "Parti da un servizio, una nicchia o una città precisi. Salva solo i potenziali clienti con un bisogno visibile e trasforma quel segnale in una proposta utile.",
      primaryCta: "Prova gratis per 3 giorni",
      secondaryCta: "Scopri i lead per siti web",
      benefitsTitle: "Dal segnale di acquisto alla prossima azione",
      benefits: [
        { title: "Lead con contesto", text: "Cerca aziende locali, lavori da remoto e richieste recenti con un motivo chiaro per contattare." },
        { title: "Ricerca verificabile", text: "Controlla l'azienda, il possibile decisore e il canale migliore prima di preparare il messaggio." },
        { title: "Follow-up organizzato", text: "Mantieni note, proposte e prossime azioni in un CRM leggero pensato per freelance." },
      ],
      stepsTitle: "Un sistema semplice di acquisizione",
      steps: [
        { title: "Scegli un mercato", text: "Definisci un servizio, una nicchia e una zona in cui puoi offrire un risultato concreto." },
        { title: "Trova il bisogno", text: "Dai priorità a siti deboli, assunzioni recenti e richieste pubbliche di aiuto." },
        { title: "Verifica e proponi", text: "Conferma il contesto e prepara una proposta specifica prima di contattare." },
      ],
      faqTitle: "Domande frequenti",
      faqs: [
        { question: "iCloseLeads è adatto ai freelance?", answer: "Sì. È progettato per freelance, consulenti e piccole agenzie che vogliono un processo ripetibile." },
        { question: "Posso iniziare gratuitamente?", answer: "Sì. La prova gratuita di 3 giorni consente di esplorare fino a 600 risultati senza carta di credito." },
        { question: "L'IA invia messaggi automaticamente?", answer: "No. Aiuta a preparare una bozza, ma sei tu a controllare ogni invio." },
      ],
    },
    "web-design-leads": {
      path: "/lead-generation/web-design-leads",
      title: "Lead per web design | Trova clienti per siti web",
      description: "Trova aziende che hanno bisogno di un sito, di una migliore esperienza mobile, di prenotazioni più chiare o di una conversione più efficace.",
      heading: "Trova clienti per siti web con un bisogno visibile",
      intro: "Individua aziende senza un sito affidabile, con un'esperienza mobile debole o un percorso di prenotazione confuso, poi proponi un miglioramento concreto.",
      directAnswer: "Un buon lead per il web design non è un nome casuale: mostra un problema pubblico che puoi verificare, spiegare e collegare a un risultato utile.",
      primaryCta: "Cerca lead gratuitamente",
      secondaryCta: "Scopri iCloseLeads",
      benefitsTitle: "Segnali che rendono utile la proposta",
      benefits: [
        { title: "Nessun sito verificato", text: "Trova attività con telefono e scheda pubblica, ma senza un sito chiaro o aggiornato." },
        { title: "Conversione e prenotazioni", text: "Dai priorità ai percorsi mobile o di prenotazione che rendono difficile agire." },
        { title: "Domanda recente", text: "Aggiungi lavori recenti per WordPress, Webflow, Shopify e landing page." },
      ],
      stepsTitle: "Come lavorare ogni lead",
      steps: [
        { title: "Scegli nicchia e città", text: "Mantieni l'elenco breve per poter studiare ogni opportunità con attenzione." },
        { title: "Verifica il problema", text: "Apri sito, scheda e contatti pubblici prima di qualificare l'azienda." },
        { title: "Proponi un risultato", text: "Parla di chiamate, prenotazioni, fiducia o conversione, non soltanto del portfolio." },
      ],
      faqTitle: "Domande sui lead per web design",
      faqs: [
        { question: "Cos'è un lead per web design?", answer: "È un'azienda o un segnale di assunzione in cui un nuovo sito, una landing page o un miglioramento di conversione può risolvere un problema visibile." },
        { question: "Posso trovare aziende senza sito?", answer: "Sì. Puoi dare priorità ai profili con sito assente o non verificato e controllare le informazioni prima del contatto." },
        { question: "Cosa faccio dopo aver trovato un lead?", answer: "Verifica l'attività, salva la prova, individua la persona giusta e prepara un messaggio breve basato sul segnale." },
      ],
    },
    "client-acquisition-system": {
      path: "/blog/freelance-client-acquisition-system",
      title: "Sistema di acquisizione clienti freelance: metodo settimanale",
      description: "Crea una routine per trovare prospect, verificare segnali, inviare proposte pertinenti e seguire ogni contatto senza perdere il contesto.",
      heading: "Un sistema di acquisizione clienti per freelance da ripetere ogni settimana",
      intro: "La ricerca di clienti diventa più affidabile quando ricerca, qualificazione, contatto e follow-up sono fasi separate e misurabili.",
      directAnswer: "Pianifica ogni settimana blocchi per trovare segnali, eliminare i prospect deboli, preparare messaggi specifici e rivedere tutti i follow-up aperti.",
      primaryCta: "Prova il sistema con lead reali",
      secondaryCta: "Scopri la piattaforma",
      benefitsTitle: "Cosa deve includere il sistema",
      benefits: [
        { title: "Più fonti di domanda", text: "Combina attività locali, lavori da remoto e richieste recenti invece di dipendere da un solo canale." },
        { title: "Criteri di qualità", text: "Valuta bisogno, compatibilità, urgenza e percorso di contatto prima di scrivere." },
        { title: "Follow-up pianificato", text: "Assegna una prossima azione a ogni lead e misura risposte, incontri e opportunità vinte." },
      ],
      stepsTitle: "Routine settimanale consigliata",
      steps: [
        { title: "Lunedì: ricerca", text: "Scegli un mercato preciso e crea un breve elenco di opportunità supportate da prove." },
        { title: "Da martedì a giovedì: contatto", text: "Personalizza il messaggio, registra l'invio e pianifica il prossimo follow-up." },
        { title: "Venerdì: analisi", text: "Controlla quali nicchie, segnali e messaggi hanno generato risposte." },
      ],
      faqTitle: "Domande sull'acquisizione freelance",
      faqs: [
        { question: "Quanti prospect servono?", answer: "Inizia con un elenco breve che puoi studiare bene. Dieci opportunità pertinenti insegnano spesso più di cento contatti generici." },
        { question: "Devo usare più canali?", answer: "Sì, quando il contesto lo giustifica. Email, telefono e profili pubblici funzionano meglio se partono da un bisogno reale." },
        { question: "Quale metrica conta di più?", answer: "Misura conversazioni e opportunità qualificate, non solo il numero di messaggi inviati." },
      ],
    },
  },
};
