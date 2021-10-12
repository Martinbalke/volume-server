"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get('/', (_, res) => {
    res.send('hello');
});
// tslint:disable-next-line:no-console
app.listen(8080, () => console.log('App live on 8080'));
//# sourceMappingURL=index.js.map