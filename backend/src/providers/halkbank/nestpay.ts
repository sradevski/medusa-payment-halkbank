import * as crypto from "crypto";

const omitted = ["encoding", "HASH", "countdown", "createdAt", "_id"];

// For whatever reason fields in error responses are an array of the duplicated element, so we need a getter to abstract that.
export const getField = (fieldName: string, data: any) => {
  const val = data[fieldName];
  return {
    fieldName: fieldName.toLowerCase(),
    value: Array.isArray(val) ? val[0] : val,
  };
};

export const calculateHash = (clientKey: string, paramsVal: string) => {
  const hashData = paramsVal + "|" + clientKey;
  const hash = crypto.createHash("sha512").update(hashData).digest("base64");

  return hash;
};

export const getHashFromResponse = (clientKey: string, data: any) => {
  const params = Object.entries(data)
    .filter(([key]) => !omitted.includes(key))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([_, val]) => val)
    .join("|");

  // The hash that comes from the caller has the secret client key appended, which is the only thing that guarantees the source of the transaction.
  const hash = calculateHash(clientKey, params);
  return { hash, paramsVal: params };
};

export const hashValidator = (clientKey: string, data: any) => {
  const serverHash = data.HASH;
  const localHash = getHashFromResponse(clientKey, data);

  if (!localHash?.hash || !serverHash) {
    return false;
  }

  return serverHash === localHash.hash;
};

export const getStatus = (data: any) => {
  const resp = getField("Response", data).value;
  switch (resp) {
    case "Approved":
      return "AUTHORIZED";
    case "Declined":
    default:
      return "FAILED";
  }
};
