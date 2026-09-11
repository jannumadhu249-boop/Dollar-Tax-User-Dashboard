const base_url = "http://187.127.143.141:4000/"

export const URLS = {

    Base_Url : base_url,
    ImageUrl : base_url,

    //Authentication
    Registration : base_url + "v1/minimumTax/user/auth/register",
    GenerateEmailOtp : base_url + "v1/minimumTax/user/auth/sendEmailOtp",
    VerificationEmailOtp : base_url + "v1/minimumTax/user/auth/verifyEmailOtp",
    Login : base_url + "v1/minimumTax/user/auth/login",
    GetProfile : base_url + "v1/minimumTax/user/auth/getMemberProfile",
    ChangePassword : base_url + "v1/minimumTax/user/auth/changePassword",

    //Forgot Password
    GenerateOtp : base_url + "v1/minimumTax/user/auth/generateForgotPasswordOtp",
    VerifyOtp : base_url + "v1/minimumTax/user/auth/verifyForgotPasswordOtp",
    ResetPassword : base_url + "v1/minimumTax/user/auth/resetPassword",

    // TaxPayer
    GetTaxPayer : base_url + "v1/minimumTax/user/taxpayer/getTaxpayer",
    UpdateTaxPayer : base_url + "v1/minimumTax/user/taxpayer/updateTaxpayer",

    // Spouse 
    GetSpouse : base_url + "v1/minimumTax/user/spouse/getSpouse",
    UpdateSpouse : base_url + "v1/minimumTax/user/spouse/updateSpouse",

    // Dependent
    GetDependent : base_url  + "v1/minimumTax/user/dependent/getDependents",
    CreateDependent : base_url + "v1/minimumTax/user/dependent/createDependent",
    GetByIdDenpendent : base_url + "v1/minimumTax/user/dependent/getDependentById/",
    UpdateDependent : base_url + "v1/minimumTax/user/dependent/updateDependent/",
    DeleteDependent : base_url + "v1/minimumTax/user/dependent/deleteDependent/",

    // Address Tax Payer
    GetAddressTaxPayer : base_url + "v1/minimumTax/user/address/getAddress",
    GetStates : base_url + "v1/minimumTax/user/address/getStates",
    CreateAddressTaxPayer : base_url + "v1/minimumTax/user/address/createAddress", 
    GetByIdAddressTaxPayer : base_url + "v1/minimumTax/user/address/getAddressById/",
    UpdateAddressTaxPayer : base_url + "v1/minimumTax/user/address/updateAddress/",
    DeleteAddressTaxPayer : base_url + "v1/minimumTax/user/address/deleteAddress/",

    // Bank Details
    GetBankDetails : base_url + "v1/minimumTax/user/bankDetails/getBankDetails",
    UpdateBankDetails : base_url + "v1/minimumTax/user/bankDetails/updateBankDetails",

    // Document Uploads
    GetDocumentType : base_url + "v1/minimumTax/user/uploadDoc/getDocumentTypes",
    GetDocuments : base_url + "v1/minimumTax/user/uploadDoc/getDocuments",
    UploadDocuments : base_url + "v1/minimumTax/user/uploadDoc/uploadDocument",
    GetByIdDouments : base_url + "v1/minimumTax/user/uploadDoc/getDocument/",
    DeleteDocument : base_url + "v1/minimumTax/user/uploadDoc/deleteDocument/",

    // Schedule Tax Note
    GetScheduleTaxNote : base_url + "v1/minimumTax/user/scheduleTaxNote/getScheduleTaxNote",
    GetTimeSlote : base_url + "v1/minimumTax/user/scheduleTaxNote/getTimeSlots",
    ScheduleTaxNote : base_url + "v1/minimumTax/user/scheduleTaxNote/scheduleTaxNote",

    // Download Tax Return
    GetDownloadTaxReturn : base_url + "v1/minimumTax/user/taxReturns/getDownloadTaxReturns",

    // Refer Friend
    GetReferrals : base_url + "v1/minimumTax/user/refer/getMyReferrals",
    ReferFriend : base_url + "v1/minimumTax/user/refer/referFriend",
    GetReferralCode : base_url + "v1/minimumTax/user/refer/getReferralCode",

    // Send Query
    SendQuery : base_url + "v1/minimumTax/user/query/sendQuery",
    GetQueries : base_url + "v1/minimumTax/user/query/getMyQueries",

    // Notifications
    GetNotificationCount : base_url + "v1/minimumTax/user/query/getNotificationCount",
    GetNotificationsList : base_url + "v1/minimumTax/user/query/getNotifications",
    MarkNotificationRead : base_url + "v1/minimumTax/user/query/markNotificationAsRead/",

    // Dashboard
    GetDashboard : base_url + "v1/minimumTax/user/userDashboard/get",
    SendMessage : base_url + "v1/minimumTax/user/userDashboard/sendDashboardMessage",
    
    // Tax Organizer year
    GetTaxOrganizerYear : base_url + "v1/minimumTax/admin/years/getCurrentYear",

    // My Tax Summary
    GetMyTaxSummary : base_url + "v1/minimumTax/user/taxReturns/getMyTaxSummary",
    

}