import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: "http://localhost:4001/graphql", token: "b46c6cb7e6c89c10414ef7d6c4bda0386ebbbf2d", queries,  });
export default client;
  