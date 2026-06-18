const { body, validationResult } = require('express-validator');

// Middleware générique qui vérifie les erreurs de validation
function valider(req, res, next) {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
        return res.status(400).json({ error: erreurs.array()[0].msg });
    }
    next();
}

const reglesTemplate = [
    body('titre').trim().notEmpty().withMessage('Titre requis').isLength({ max: 255 }).stripLow(),
    body('message').optional().trim().isLength({ max: 1000 }).stripLow(),
    body('delai_jours').isInt({ min: 1 }).withMessage('Délai invalide'),
    body('service_id').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('actif').optional().isBoolean()
];

const reglesInscription = [
    body('nom').trim().notEmpty().withMessage('Nom requis').isLength({ max: 150 }),
    body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail({ gmail_remove_dots: false }),
    body('mot_de_passe')
        .isLength({ min: 8 }).withMessage('8 caractères minimum')
        .isLength({ max: 128 }).withMessage('128 caractères maximum')
        .matches(/[A-Z]/).withMessage('Au moins une majuscule requise')
        .matches(/[a-z]/).withMessage('Au moins une minuscule requise')
        .matches(/[0-9]/).withMessage('Au moins un chiffre requis')
        .matches(/[@$!%*?&_\-#]/).withMessage('Au moins un caractère spécial requis (@$!%*?&_-#)'),
    body('telephone').optional().trim().isMobilePhone().withMessage('Téléphone invalide'),
    body('secteur').trim().notEmpty().withMessage('Secteur requis')
];

const reglesLogin = [
    body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail({ gmail_remove_dots: false }),
    body('mot_de_passe').notEmpty().withMessage('Mot de passe requis')
];

const reglesService = [
    body('nom').trim().notEmpty().withMessage('Nom requis').isLength({ max: 100 }).stripLow(),
    body('duree_minutes').isInt({ min: 5, max: 480 }).withMessage('Durée invalide (5-480 min)'),
    body('prix').isFloat({ min: 0 }).withMessage('Prix invalide'),
    body('description').optional().trim().isLength({ max: 500 }).stripLow()
];

const reglesClient = [
    body('nom').trim().notEmpty().withMessage('Nom requis').isLength({ max: 100 }).stripLow(),
    body('telephone').trim().notEmpty().withMessage('Téléphone requis').isLength({ max: 20 }),
    body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail({ gmail_remove_dots: false }),
    body('informations').optional().trim().isLength({ max: 1000 }).stripLow(),
    body('adresse').optional().trim().isLength({ max: 255 }).stripLow()
];

const reglesRdv = [
    body('client_id').optional().isInt({ min: 1 }).withMessage('Client invalide'),
    body('service_id').optional().isInt({ min: 1 }).withMessage('Service invalide'),
    body('date_heure').notEmpty().withMessage('Date requise').isISO8601().withMessage('Format de date invalide'),
    body('statut').optional().isIn(['confirme', 'annule', 'termine']).withMessage('Statut invalide')
];

const reglesHoraire = [
    body('jour_semaine').isInt({ min: 0, max: 6 }).withMessage('Jour invalide'),
    body('heure_debut').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure début invalide'),
    body('heure_fin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure fin invalide')
];

const reglesFermeture = [
    body('date_debut').isDate().withMessage('Date début invalide'),
    body('date_fin').isDate().withMessage('Date fin invalide'),
    body('motif').optional().trim().isLength({ max: 255 }).stripLow()
];

const reglesEntreprise = [
    body('nom').trim().notEmpty().withMessage('Nom requis').isLength({ max: 150 }).stripLow(),
    body('telephone').optional().trim().isLength({ max: 20 }),
    body('secteur').trim().notEmpty().withMessage('Secteur requis').stripLow(),
    body('delai_rappel_heures').isInt({ min: 1 }).withMessage('Délai invalide')
];

module.exports = {
    valider,
    reglesService,
    reglesClient,
    reglesRdv,
    reglesHoraire,
    reglesFermeture,
    reglesEntreprise,
    reglesInscription,
    reglesLogin,
    reglesTemplate
};