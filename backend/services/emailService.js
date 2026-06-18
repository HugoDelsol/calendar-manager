async function envoyerEmail(emailData) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify(emailData)
    });

    if (!response.ok) {
        const erreur = await response.json();
        throw new Error(erreur.message);
    }

    return await response.json();
}

// Rappel RDV (avant le rendez-vous)
async function envoyerRappelEmail(email, clientNom, serviceNom, dateHeure) {
    const dateFormatee = new Date(dateHeure).toLocaleString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long',
        hour: '2-digit', minute: '2-digit'
    });

    return envoyerEmail({
        sender: { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: `Rappel de votre rendez-vous - ${serviceNom}`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">Rappel de rendez-vous</h2>
                <p>Bonjour <strong>${clientNom}</strong>,</p>
                <p>Nous vous rappelons votre rendez-vous :</p>
                <div style="background: #f8f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                    <p><strong>Service :</strong> ${serviceNom}</p>
                    <p><strong>Date :</strong> ${dateFormatee}</p>
                </div>
                <p>En cas d'empêchement, merci de nous contacter.</p>
                <p>À bientôt !</p>
            </div>
        `
    });
}

// Confirmation de réservation (après la prise de RDV)
async function envoyerConfirmationEmail(email, clientNom, serviceNom, dateHeure, entrepriseNom) {
    const dateFormatee = new Date(dateHeure).toLocaleString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long',
        hour: '2-digit', minute: '2-digit'
    });

    return envoyerEmail({
        sender: { name: entrepriseNom, email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: `Confirmation de votre rendez-vous - ${entrepriseNom}`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">Rendez-vous confirmé ✅</h2>
                <p>Bonjour <strong>${clientNom}</strong>,</p>
                <p>Votre rendez-vous a bien été enregistré :</p>
                <div style="background: #f8f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                    <p><strong>📍 Établissement :</strong> ${entrepriseNom}</p>
                    <p><strong>✂️ Service :</strong> ${serviceNom}</p>
                    <p><strong>📅 Date :</strong> ${dateFormatee}</p>
                </div>
                <p>Un rappel vous sera envoyé automatiquement avant votre rendez-vous.</p>
                <p>À bientôt !</p>
                <p style="color: #888; font-size: 12px;">— ${entrepriseNom}</p>
            </div>
        `
    });
}

// Rappel post-RDV (template configurable par l'entreprise)
async function envoyerRappelPostRdv(email, clientNom, titre, message, entrepriseNom, entrepriseId) {
    return envoyerEmail({
        sender: { name: entrepriseNom, email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: `${titre} - ${entrepriseNom}`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">${titre}</h2>
                <p>Bonjour <strong>${clientNom}</strong>,</p>
                <p>${message}</p>
                <div style="margin: 24px 0;">
                    <a href="${process.env.FRONTEND_URL}/booking/${entrepriseId}"
                       style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Reprendre rendez-vous
                    </a>
                </div>
                <p style="color: #888; font-size: 12px;">— ${entrepriseNom}</p>
            </div>
        `
    });
}

async function envoyerResetMotDePasse(email, entrepriseNom, token) {
    const lien = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe?token=${token}`;

    return envoyerEmail({
        sender: { name: 'Calendar-Manager', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: 'Réinitialisation de votre mot de passe',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">Réinitialisation du mot de passe</h2>
                <p>Bonjour <strong>${entrepriseNom}</strong>,</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
                <div style="margin: 24px 0;">
                    <a href="${lien}"
                       style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                <p style="color: #888; font-size: 13px;">Ce lien expire dans 1 heure.</p>
                <p style="color: #888; font-size: 13px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
        `
    });
}

module.exports = {
    envoyerRappelEmail,
    envoyerConfirmationEmail,
    envoyerRappelPostRdv,
    envoyerResetMotDePasse,
};