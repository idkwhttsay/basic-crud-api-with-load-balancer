import axios from "axios";

const obj = {
    username: "Daniil",
    age: 17,
    hobbies: ["football"],
};

const updatedObj = {
    username: "Tymur",
    age: 20,
    hobbies: ["basketball"],
};

describe("Valid Requests", () => {
    test("should get records with GET api/users request", async () => {
        const response = await axios.get("http://localhost:3000/api/users");

        expect(response.data.data).toStrictEqual([]);
    });

    test("should create a new object by a POST api/users request", async () => {
        const response = await axios.post(
            "http://localhost:3000/api/users",
            obj,
        );

        expect(response.data.age).toBe(obj.age);
        expect(response.data.username).toBe(obj.username);
        expect(response.data.hobbies).toStrictEqual(obj.hobbies);
    });

    test("should return created record by its id with GET api/user/{userId}", async () => {
        const responseCreate = await axios.post(
            "http://localhost:3000/api/users",
            obj,
        );

        const userId = responseCreate.data.id;

        const responseGet = await axios.get(
            `http://localhost:3000/api/users/${userId}`,
        );

        expect(responseGet.data.age).toBe(obj.age);
        expect(responseGet.data.username).toBe(obj.username);
        expect(responseGet.data.hobbies).toStrictEqual(obj.hobbies);
    });

    test("should return updated record by its id with PUT api/user/{userId}", async () => {
        const responseCreate = await axios.post(
            "http://localhost:3000/api/users",
            obj,
        );

        const userId = responseCreate.data.id;

        const responsePut = await axios.put(
            `http://localhost:3000/api/users/${userId}`,
            updatedObj,
        );

        expect(responsePut.data.age).toBe(updatedObj.age);
        expect(responsePut.data.username).toBe(updatedObj.username);
        expect(responsePut.data.hobbies).toStrictEqual(updatedObj.hobbies);
    });

    test("should return delete created record by its id with DELETE api/user/{userId}", async () => {
        const responseCreate = await axios.post(
            "http://localhost:3000/api/users",
            obj,
        );

        const userId = responseCreate.data.id;

        const responseDelete = await axios.delete(
            `http://localhost:3000/api/users/${userId}`,
        );

        expect(responseDelete.status).toBe(204);
    });

    test("should return 'no such object' when getting deleted object with GET api/user/{userId}", async () => {
        const responseCreate = await axios.post(
            "http://localhost:3000/api/users",
            obj,
        );

        const userId = responseCreate.data.id;

        await axios.delete(`http://localhost:3000/api/users/${userId}`);

        const responseGet = await axios
            .get(`http://localhost:3000/api/users/${userId}`)
            .then(() => {
                expect(0).toBe(1);
            })
            .catch((error) => {
                expect(error.status).toBe(404);
            });
    });
});

describe("check endpoints to return invalidId message", () => {
    test("should return invalidId message when GET api/users/{userId}", async () => {
        const responseGet = await axios
            .get(`http://localhost:3000/api/users/invalidId`)
            .then(() => {
                expect(0).toBe(1);
            })
            .catch((error) => {
                expect(error.status).toBe(400);
            });
    });

    test("should return invalidId message when PUT api/users/{userId}", async () => {
        const responseGet = await axios
            .put(`http://localhost:3000/api/users/invalidId`, obj)
            .then(() => {
                expect(0).toBe(1);
            })
            .catch((error) => {
                expect(error.status).toBe(400);
            });
    });

    test("should return invalidId message when DELETE api/users/{userId}", async () => {
        const responseGet = await axios
            .delete(`http://localhost:3000/api/users/invalidId`)
            .then(() => {
                expect(0).toBe(1);
            })
            .catch((error) => {
                expect(error.status).toBe(400);
            });
    });
});
