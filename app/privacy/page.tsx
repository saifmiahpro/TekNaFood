export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>

                <div className="prose prose-sm text-gray-600 space-y-6">
                    <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Collecte des données</h2>
                        <p>
                            Dans le cadre de l'utilisation de notre jeu concours, nous collectons les informations suivantes :
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Prénom</li>
                            <li>Adresse email</li>
                            <li>Preuve d'achat (optionnel)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Utilisation des données</h2>
                        <p>Vos données sont utilisées uniquement pour :</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Gérer votre participation au jeu concours</li>
                            <li>Vous envoyer votre gain par email</li>
                            <li>Vérifier l'unicité de votre participation (lutte contre la fraude)</li>
                        </ul>
                        <p className="mt-2 font-medium">Nous ne vendons ni ne louons vos données à des tiers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Conservation des données</h2>
                        <p>
                            Vos données sont conservées pour une durée nécessaire à la gestion du jeu et des gains,
                            puis archivées ou supprimées conformément aux obligations légales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Vos droits</h2>
                        <p>
                            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                            Pour exercer ce droit, veuillez contacter l'établissement organisateur du jeu.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Cookies</h2>
                        <p>
                            Nous utilisons uniquement des cookies techniques essentiels au bon fonctionnement du jeu
                            (maintien de votre session de jeu). Aucun cookie publicitaire tiers n'est utilisé.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
