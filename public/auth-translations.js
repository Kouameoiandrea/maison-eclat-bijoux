// Additional authentication translations
const authTranslations = {
    es: {
        authSignIn: 'Iniciar sesión',
        authRegister: 'Crear cuenta',
        authEmail: 'Correo electrónico',
        authPassword: 'Contraseña',
        authFullName: 'Nombre completo',
        authPhone: 'Número de teléfono',
        authConfirmPassword: 'Confirmar contraseña',
        authLoginButton: 'Iniciar sesión',
        authRegisterButton: 'Crear cuenta',
        authLoginError: 'Error al iniciar sesión. Verifique sus credenciales.',
        authRegisterError: 'Error en el registro. El correo electrónico puede ya estar en uso.',
        authSuccess: '¡Éxito!',
        authLogout: 'Cerrar sesión',
        authMyAccount: 'Mi cuenta'
    },
    de: {
        authSignIn: 'Anmelden',
        authRegister: 'Konto erstellen',
        authEmail: 'E-Mail',
        authPassword: 'Passwort',
        authFullName: 'Vollständiger Name',
        authPhone: 'Telefonnummer',
        authConfirmPassword: 'Passwort bestätigen',
        authLoginButton: 'Anmelden',
        authRegisterButton: 'Konto erstellen',
        authLoginError: 'Anmeldung fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.',
        authRegisterError: 'Registrierung fehlgeschlagen. E-Mail wird möglicherweise bereits verwendet.',
        authSuccess: 'Erfolg!',
        authLogout: 'Abmelden',
        authMyAccount: 'Mein Konto'
    },
    pt: {
        authSignIn: 'Entrar',
        authRegister: 'Criar conta',
        authEmail: 'Email',
        authPassword: 'Senha',
        authFullName: 'Nome completo',
        authPhone: 'Número de telefone',
        authConfirmPassword: 'Confirmar senha',
        authLoginButton: 'Entrar',
        authRegisterButton: 'Criar conta',
        authLoginError: 'Falha ao entrar. Verifique suas credenciais.',
        authRegisterError: 'Falha no registro. O email pode já estar em uso.',
        authSuccess: 'Sucesso!',
        authLogout: 'Sair',
        authMyAccount: 'Minha conta'
    },
    fr: {
        authSignIn: 'Connexion',
        authRegister: 'Inscription',
        authEmail: 'Email',
        authPassword: 'Mot de passe',
        authFullName: 'Nom complet',
        authPhone: 'Numéro de téléphone',
        authConfirmPassword: 'Confirmer le mot de passe',
        authLoginButton: 'Se connecter',
        authRegisterButton: 'S\'inscrire',
        authLoginError: 'Échec de la connexion. Vérifiez vos identifiants.',
        authRegisterError: 'Échec de l\'inscription. L\'email peut être déjà utilisé.',
        authSuccess: 'Succès!',
        authLogout: 'Se déconnecter',
        authMyAccount: 'Mon compte'
    }
};

// Merge auth translations with existing translations
for (const [lang, trans] of Object.entries(authTranslations)) {
    if (translations[lang]) {
        Object.assign(translations[lang], trans);
    }
}
