import fs from "fs";
import readCSVS from "./csvs.js";
import { parseJSON, parseJSONStream } from "./json.js";
import parseVK from "./vk.js";
import parseTG from "./tg.js";
import parseFS from "./fs.js";
import parseBiorg from "./biorg.js";
import parseListing from "./listing.js";
import parseGEDCOM from "./gedcom.js";
import parseVCF from "./vcf.js";

async function isCSVS(sourcePath) {
  try {
    await fs.promises.readFile(`${sourcePath}/.csvs.csv`);

    return true;
  } catch {
    //
  }

  return false;
}

async function isVK(sourcePath) {
  try {
    await fs.promises.readFile(`${sourcePath}/messages/index-messages.html`);

    return true;
  } catch {
    return false;
  }
}

async function isTG(sourcePath) {
  try {
    await fs.promises.readFile(`${sourcePath}/result.json`);

    return true;
  } catch {
    return false;
  }
}

async function isFS(sourcePath) {
  try {
    const stats = await fs.promises.stat(sourcePath);

    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function isBiorg(sourcePath) {
  return /org$/.test(sourcePath);
}

async function isJSON(sourcePath) {
  return /json$/.test(sourcePath);
}

async function isJSONStream() {
  return true;
}

async function isListing() {
  return true;
}

async function isGEDCOM(sourcePath) {
  return /ged$/.test(sourcePath);
}

async function isVCF(sourcePath) {
  return /vcf$/.test(sourcePath);
}

export function passthroughStream() {
  return new TransformStream({
    async write(record, controller) {
      controller.enqueue(record);
    },
  });
}

export async function transformStream(sourcePath, query, doHashsum) {
  // if stdin and source path
  // // exception stdin source path

  // if source type is biorg
  // // pipe stdin stream to parseBiorg

  // if source type is json
  // // pipe stdin stream to parseJson
  if (await isJSONStream(sourcePath)) {
    return parseJSONStream(query);
  }

  // if source type is csvs metadir stream
  // // pipe stdin stream to writeTmpMetadir
  // // return queryStream on temporary metadir

  // if source type is filesystem listing
  // // pipe stdin stream to parseListing
  if (await isListing(sourcePath)) {
    return parseListing(sourcePath, query, doHashsum);
  }

  return undefined;
}

/**
 *
 * @param {string} sourcePath - Path to source
 * @param {string} query - Query string
 * @param {string} doHashsum
 * @param {boolean} stats
 * @returns {stream}
 */
export async function importStream(sourcePath, query, doHashsum, stats) {
  // if no stdin and no source path or source path is directory
  // // // detect source type is csvs
  if (await isCSVS(sourcePath)) {
    return readCSVS(sourcePath, query, stats);
  }
  // // // otherwise source type is fs
  // // // // return readFS stream on sourcePath

  // // if source type is vk
  if (await isVK(sourcePath)) {
    // // // read filesystem with parseVK
    return parseVK(sourcePath, query);
  }

  // // if source type is tg
  if (await isTG(sourcePath)) {
    // // // read filesystem with parseTG
    return parseTG(sourcePath, query);
  }

  if (await isFS(sourcePath)) {
    return parseFS(sourcePath, query, doHashsum);
  }

  if (await isBiorg(sourcePath)) {
    return parseBiorg(sourcePath, query, stats);
  }

  if (await isJSON(sourcePath)) {
    return parseJSON(sourcePath, query);
  }

  if (await isGEDCOM(sourcePath)) {
    return parseGEDCOM(sourcePath);
  }

  if (await isVCF(sourcePath)) {
    return parseVCF(sourcePath);
  }

  return undefined;
}
