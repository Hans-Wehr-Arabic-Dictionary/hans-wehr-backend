const express = require("express");
const logger = require("../utils/logger");
const { lookupRoot } = require("../utils/db");

const RESPONSE_VERS = "1.0";

// This is the router for the noun route
export const router = express.Router();

async function retrieveNoun(word) {
  const params = {
    ExpressionAttributeValues: {
      ":query_word": word,
      ":is_root": 0,
    },
    IndexName: "WordsIndex",
    KeyConditionExpression: "Word = :query_word AND IsRoot = :is_root",
    TableName: "hans_wehr_DB",
  };

  const response = await ddbDocClient.send(new QueryCommand(params));
  console.log(response.$metadata.httpStatusCode);

  if (response.$metadata.httpStatusCode != 200) {
    // error connecting to DB
    return "Error connecting to DB";
  }

  if (response.Count == 0) {
    // no results
    return "No results for " + word;
  }

  return response.Items;
}

// app.get("/noun", (req, res) => {
//   console.log("NOUN: ", JSON.stringify(req.query));
//   if (!req.query.noun) {
//     return res.send(`No noun provided`);
//   }
//   retrieveNoun(req.query.noun).then((data) => {
//     if (typeof data === "string") {
//       return res.send(data);
//     }
//     res.json({
//       message: "success",
//       data: data,
//     });
//   });
// });

// app.put("/noun", (req, res) => {
//   const noun = req.body;
//   if (!noun || !noun.word) {
//     console.log("No noun provided");
//     return res.status(400).send(`No noun provided`);
//   }
//   if (!noun.definition) {
//     console.log("No definition provided");
//     return res.status(400).send(`No definition provided`);
//   }
//   if (!noun.root) {
//     console.log("No root provided");
//     return res.status(400).send(`No root provided`);
//   }
//   if (!noun.id) {
//     console.log("No id provided");
//     return res.status(400).send(`No id provided`);
//   }

//   console.log("PUT NOUN: ", JSON.stringify(req.body));

//   var params = {
//     TableName: "hans_wehr_DB",
//     Item: {
//       WordID: noun.id,
//       Word: noun.word,
//       IsRoot: 0,
//       Root: noun.root,
//       Definition: {
//         Definition: noun.definition,
//       },
//     },
//   };

//   const command = new PutCommand(params);
//   ddbDocClient.send(command).then((data) => {
//     console.log("Success", data);
//     res.send("Success");
//   });
// });

export const nounHandler = router;
