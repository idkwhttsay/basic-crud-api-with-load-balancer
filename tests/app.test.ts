import axios from "axios";

describe("Valid Requests", () => {
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
            .catch((error) => {
                expect(error.status).toBe(404);
            });
    });
});
