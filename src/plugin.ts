import streamDeck from "@elgato/streamdeck";
import { CellAction } from "./actions/cell.js";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new CellAction());

streamDeck.connect();
