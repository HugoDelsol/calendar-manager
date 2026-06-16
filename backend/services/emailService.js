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

module.exports = { envoyerRappelEmail };