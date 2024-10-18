export class DatabaseErrorID extends Error {
    constructor(message: string = 'The id parameter is not correct') {
        super(message);
    }
}
