export enum firestoreError
{
    unknownUser = "auth/user-not-found",
    wrongPassword = "auth/wrong-password",
    emailAlreadyExists = "auth/email-already-in-use",
    invalidEmail = "auth/invalid-email" // The email address is badly formatted
}