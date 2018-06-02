export enum FirestoreError
{
    UnknownUser = "auth/user-not-found",
    WrongPassword = "auth/wrong-password",
    EmailAlreadyExists = "auth/email-already-in-use",
    InvalidEmail = "auth/invalid-email" // The email address is badly formatted
}