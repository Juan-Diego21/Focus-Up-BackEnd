import "reflect-metadata";
import { Server } from "http";
declare const app: import("express-serve-static-core").Express;
export declare const startServer: () => Promise<Server>;
export default app;
