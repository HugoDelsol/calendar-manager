async function envoyerRappelEmail(email, clientNom, serviceNom, dateHeure) {
    const date = new Date(dateHeure);
    const dateFormatee = date.toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });

    const emailData = {
        sender: {
            name: process.env.BREVO_SENDER_NAME,
            email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: email }],
        subject: `Rappel de votre rendez-vous - ${serviceNom}`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Rappel de rendez-vous</h2>
                <p>Bonjour <strong>${clientNom}</strong>,</p>
                <p>Nous vous rappelons votre rendez-vous :</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Service :</strong> ${serviceNom}</p>
                    <p><strong>Date :</strong> ${dateFormatee}</p>
                </div>
                <p>En cas d'empêchement, merci de nous contacter le plus tôt possible.</p>
                <p>À bientôt !</p>
            </div>
        `
    };

    try {
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

        const result = await response.json();
        console.log(`Email envoyé à ${email} - MessageId: ${result.messageId}`);
        return result;
    } catch (err) {
        console.error(`Erreur envoi email à ${email}:`, err.message);
        throw err;
    }
}

async function envoyerConfirmation(email, clientNom, serviceNom, dateHeure, entrepriseNom) {
    const date = new Date(dateHeure);
    const dateFormatee = date.toLocaleString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long',
        hour: '2-digit', minute: '2-digit'
    });

    await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
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
        })
    });
}

module.exports = { envoyerRappelEmail, envoyerConfirmation };