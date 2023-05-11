"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootHandler = void 0;
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const db_1 = require("../utils/db");
const RESPONSE_VERS = "1.0";
// This is the router for the root route
const router = express_1.default.Router();
function retrieveAllWordsWithRoot(root) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        //   let collection = await db.collection("definitions");
        // perform the lookup
        //   const results = collection.find({ root: root }).hint("rootsIndex");
        const results = yield (0, db_1.lookupRoot)(root);
        let response = [];
        try {
            for (var _d = true, results_1 = __asyncValues(results), results_1_1; results_1_1 = yield results_1.next(), _a = results_1_1.done, !_a;) {
                _c = results_1_1.value;
                _d = false;
                try {
                    const doc = _c;
                    console.log(doc);
                    let form_definitions = [];
                    // process the forms
                    for (let index in doc.forms) {
                        const word = doc.forms[index];
                        console.log(JSON.stringify(word));
                        const simplified_def = {
                            id: word.id,
                            text: word.text,
                            form: word.form,
                            transliteration: word.transliteration,
                            translation: {
                                id: word.translation.id,
                                text: word.translation.text,
                                short: word.translation.short,
                            },
                        };
                        form_definitions.push(simplified_def);
                    }
                    var noun_definitions = [];
                    // process the nouns
                    for (let index in doc.nouns) {
                        const word = doc.nouns[index];
                        const simplified_def = {
                            id: word.id,
                            text: word.text,
                            transliteration: word.transliteration,
                            plural: word.plural,
                            translation: {
                                id: word.translation.id,
                                text: word.translation.text,
                                short: word.translation.short,
                            },
                        };
                        noun_definitions.push(simplified_def);
                    }
                    const entry = {
                        word: root,
                        rootInfo: doc.forms[0].root,
                        definitions: form_definitions,
                        nouns: noun_definitions,
                        responseVersion: RESPONSE_VERS,
                    };
                    response.push(entry);
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = results_1.return)) yield _b.call(results_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return response;
    });
}
// root lookup route
router.get("/", (req, res) => {
    logger_1.logger.debug("ROOT: ", JSON.stringify(req.query));
    if (!req.query.root) {
        return res.send(`No root provided`);
    }
    retrieveAllWordsWithRoot(req.query.root).then((data) => {
        if (typeof data === "string") {
            return res.send(data);
        }
        logger_1.logger.log("info", `Looked up root ${req.query.root}`);
        res.json({
            message: "success",
            data: data,
        });
    });
});
// app.put("/root", (req, res) => {
//   const noun = req.body;
//   if (!noun || !noun.word) {
//     console.log("No root provided");
//     return res.status(400).send(`No root provided`);
//   }
//   if (!noun.definitions || noun.definitions.length == 0) {
//     console.log("No definitions provided");
//     return res.status(400).send(`No definitions provided`);
//   }
//   if (!noun.id) {
//     console.log("No id provided");
//     return res.status(400).send(`No id provided`);
//   }
//   console.log("PUT ROOT: ", JSON.stringify(req.body));
//   forms = {};
//   order = [];
//   for (const [key, value] of Object.entries(noun.definitions)) {
//     order.push(key);
//     forms[key] = value;
//   }
//   var params = {
//     TableName: "hans_wehr_DB",
//     Item: {
//       WordID: noun.id,
//       Word: noun.word,
//       IsRoot: 1,
//       Root: noun.word,
//       Definition: {
//         Order: order,
//         Forms: forms,
//       },
//     },
//   };
//   const command = new PutCommand(params);
//   ddbDocClient.send(command).then((data) => {
//     logger.log("info", `Updated entry for root ${noun.word}`);
//     console.log("Success", data);
//     res.send("Success");
//   });
// });
exports.rootHandler = router;
