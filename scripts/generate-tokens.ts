import crypto from 'crypto'

function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

console.log('='.repeat(60))
console.log('🔐 TOKENS SÉCURISÉS POUR REVIEWSPIN')
console.log('='.repeat(60))
console.log('')
console.log('Super Admin Token:')
console.log(generateSecureToken(32))
console.log('')
console.log('Restaurant Admin Tokens (générez un par restaurant):')
for (let i = 1; i <= 5; i++) {
    console.log(`Restaurant ${i}: ${generateSecureToken(32)}`)
}
console.log('')
console.log('⚠️  IMPORTANT: Sauvegardez ces tokens dans un endroit sûr!')
console.log('⚠️  Ne les commitez JAMAIS dans Git!')
console.log('='.repeat(60))
