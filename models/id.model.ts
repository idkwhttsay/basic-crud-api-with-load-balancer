import { v4 as uuid } from "uuid";

export default interface ModelInterface {
    id: typeof uuid | undefined;
}
