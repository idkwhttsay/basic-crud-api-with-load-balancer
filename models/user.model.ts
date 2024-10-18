import ModelInterface from "./id.model";

export default interface UserInterface extends ModelInterface {
    name: string;
    age: number;
    hobbies: string[];
}
