/// Get the userID  from Cognito
/// check the status of the request to become seller (pending|success|fail)
/// request API to endpoint "/api/seller/register/checkStatusOfRegister?user_id=....." for get the status
/// handle click oke by make request to  "/api/seller/registerStage/handle(Fail|Success)?user_id=....."
