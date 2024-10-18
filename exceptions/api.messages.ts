const messages = {
    invalidId: {
        status: 400,
        message: "UserId is invalid (not uuid).",
    },
    invalidBody: {
        status: 400,
        message:
            "Request body doesn't contain required fields or has non-required fields.",
    },
    recordNotFound: {
        status: 404,
        message: "Record with given UserId doesn't exist.",
    },
    userDeleted: {
        status: 204,
        message: "User was successfully deleted.",
    },
    endpointNotFound: {
        status: 404,
        message: "Given endpoint doesn't exist.",
    },
};

export default messages;
