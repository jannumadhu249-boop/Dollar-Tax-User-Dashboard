const base_url = "http://187.127.143.141:4000/"

export const URLS = {

    Base_Url : base_url,
    ImageUrl : base_url,

    //Authentication
    Registration : base_url + "v1/minimumTax/user/auth/register",
    GenerateEmailOtp : base_url + "v1/minimumTax/user/auth/sendEmailOtp",
    VerificationEmailOtp : base_url + "v1/minimumTax/user/auth/verifyEmailOtp",
    Login : base_url + "v1/minimumTax/user/auth/login",
    ChangePassword : base_url + "v1/minimumTax/user/auth/changePassword",

    //Forgot Password
    GenerateOtp : base_url + "v1/minimumTax/user/auth/generateForgotPasswordOtp",
    VerifyOtp : base_url + "v1/minimumTax/user/auth/verifyForgotPasswordOtp",
    ResetPassword : base_url + "v1/minimumTax/user/auth/resetPassword",
}