from fastapi import Request
from fastapi.responses import JSONResponse

class UrbanTransitException(Exception):
    pass

class AuthenticationError(UrbanTransitException):
    pass

class AuthorizationError(UrbanTransitException):
    pass

class DataNotFoundError(UrbanTransitException):
    pass

class ValidationError(UrbanTransitException):
    pass

class SparkJobError(UrbanTransitException):
    pass

class ModelNotFoundError(UrbanTransitException):
    pass

def setup_exception_handlers(app):
    @app.exception_handler(UrbanTransitException)
    async def base_exception_handler(request: Request, exc: UrbanTransitException):
        return JSONResponse(status_code=400, content={"message": str(exc)})

    @app.exception_handler(AuthenticationError)
    async def auth_exception_handler(request: Request, exc: AuthenticationError):
        return JSONResponse(status_code=401, content={"message": str(exc)})
