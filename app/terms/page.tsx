export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Règlement du Jeu Concours</h1>

                <div className="prose prose-sm text-gray-600 space-y-6">
                    <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Organisation</h2>
                        <p>
                            Ce jeu gratuit et sans obligation d'achat est organisé par l'établissement commerçant (ci-après "l'Organisateur")
                            dans lequel le QR code a été scanné.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Participants</h2>
                        <p>
                            Ce jeu est ouvert à toute personne physique majeure résidant en France métropolitaine,
                            à l'exclusion du personnel de l'Organisateur.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Modalités de participation</h2>
                        <p>
                            Pour participer, le joueur doit :
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Scanner le QR code du jeu.</li>
                            <li>Réaliser l'une des actions proposées (ex: laisser un avis, s'abonner).</li>
                            <li>Remplir le formulaire de participation.</li>
                            <li>Lancer la roue virtuelle.</li>
                        </ul>
                        <p className="mt-2">
                            La participation est limitée à une par action validée (ex: 1 avis = 1 participation, 1 abonnement = 1 participation).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Dotations</h2>
                        <p>
                            Les lots sont indiqués sur la roue virtuelle au moment du jeu.
                            Ils ne peuvent donner lieu à aucune contestation, ni à leur contre-valeur en argent, ni à un échange.
                            Les lots sont valables uniquement lors d'une prochaine visite et pour une durée limitée indiquée dans l'email de gain.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Désignation des gagnants</h2>
                        <p>
                            Le gain est déterminé immédiatement par un algorithme aléatoire au moment où le participant lance la roue.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Données personnelles</h2>
                        <p>
                            Les informations collectées sont nécessaires pour la prise en compte de votre participation.
                            Conformément à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de modification et de suppression de vos données.
                            Voir notre <a href="/privacy" className="underline text-blue-600">Politique de Confidentialité</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
