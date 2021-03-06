import axios from "axios";
import * as express from "express";
import {get} from "lodash";

import * as faker from "faker";

import IDocument from "../common/IDocument";
import IUser from "../common/IUser";
import CONFIG from "../config";
import logger from "../logger";

/**
 * In memory documents map
 * @type {Map<number, IDocument>}
 */
const documents = new Map<number, IDocument>();

/**
 * In memory users map
 * @type {Map<string, IUser>}
 */
const users = new Map<string, IUser>();

const initializationRoute: express.RequestHandler = (req, res) => {
    const {token, documentId: documentId} = req.body.body;
    logger.info(`initialization request: token=${token} documentId=${documentId}`);
    if (!token || !documentId) {
        res.sendStatus(404);
    } else {
        let user = users.get(token);
        if (!user) {
            user = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                login: faker.internet.userName(),
            };
            users.set(token, user);
        }
        let document = documents.get(documentId);
        if (!document) {
            document = {
                id: documentId,
                title: "Document about " + faker.commerce.productName(),
            };
            documents.set(documentId, document);
        }
        res.json({
            document,
            message: "Initialized successful",
            status: "success",
            user,
        });

        // external service to initialize collaboration document
        // axios.get(CONFIG.INITIALIZE_END_POINT + documentId, {
        //   headers: {
        //     Cookie: `TOKEN=${token}`,
        //   },
        // }).then((response) => {
        //   if (response.status === 200) {
        //     const data = response.data.data;
        //     const document: IDocument = {
        //       id: documentId,
        //       title: get(data, "title"),
        //     };
        //     const user: IUser = {
        //       firstName: get(data, "firstName"),
        //       lastName: get(data, "lastName"),
        //       login: get(data, "userName"),
        //     };
        //     res.json({
        //       document,
        //       message: response.data.message,
        //       status: response.data.status,
        //       user,
        //     });
        //   } else {
        //     res.sendStatus(403);
        //   }
        // }).catch((error) => {
        //   logger.error(`initialization request: ${error}`);
        //   res.sendStatus(500);
        // });
    }
};

export default initializationRoute;
