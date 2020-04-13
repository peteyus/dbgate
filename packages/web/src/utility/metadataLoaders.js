import useFetch from './useFetch';
import axios from './axios';
import { cacheGet, cacheSet, getCachedPromise } from './cache';
import stableStringify from 'json-stable-stringify';

const tableInfoLoader = ({ conid, database, schemaName, pureName }) => ({
  url: 'metadata/table-info',
  params: { conid, database, schemaName, pureName },
  reloadTrigger: `database-structure-changed-${conid}-${database}`,
});

const viewInfoLoader = ({ conid, database, schemaName, pureName }) => ({
  url: 'metadata/view-info',
  params: { conid, database, schemaName, pureName },
  reloadTrigger: `database-structure-changed-${conid}-${database}`,
});

const connectionInfoLoader = ({ conid }) => ({
  url: 'connections/get',
  params: { conid },
  reloadTrigger: 'connection-list-changed',
});

const sqlObjectListLoader = ({ conid, database }) => ({
  url: 'metadata/list-objects',
  params: { conid, database },
  reloadTrigger: `database-structure-changed-${conid}-${database}`,
});

const databaseListLoader = ({ conid }) => ({
  url: 'server-connections/list-databases',
  params: { conid },
  reloadTrigger: `database-list-changed-${conid}`,
});

const connectionListLoader = () => ({
  url: 'connections/list',
  params: {},
  reloadTrigger: `connection-list-changed`,
});

async function getCore(loader, args) {
  const { url, params, reloadTrigger } = loader(args);
  const key = stableStringify({ url, ...params });

  async function doLoad() {
    const resp = await axios.request({
      method: 'get',
      url,
      params,
    });
    return resp.data;
  }

  const fromCache = cacheGet(key);
  if (fromCache) return fromCache;
  const res = getCachedPromise(key, doLoad);

  cacheSet(key, res, reloadTrigger);
  return res;
}

function useCore(loader, args) {
  const { url, params, reloadTrigger } = loader(args);
  const cacheKey = stableStringify({ url, ...params });

  const res = useFetch({
    url,
    params,
    reloadTrigger,
    cacheKey,
  });

  return res;
}

/** @returns {Promise<import('@dbgate/types').TableInfo>} */
export function getTableInfo(args) {
  return getCore(tableInfoLoader, args);
}

/** @returns {import('@dbgate/types').TableInfo} */
export function useTableInfo(args) {
  return useCore(tableInfoLoader, args);
}

/** @returns {Promise<import('@dbgate/types').ViewInfo>} */
export function getViewInfo(args) {
  return getCore(viewInfoLoader, args);
}

/** @returns {import('@dbgate/types').ViewInfo} */
export function useViewInfo(args) {
  return useCore(viewInfoLoader, args);
}

/** @returns {Promise<import('@dbgate/types').StoredConnection>} */
export function getConnectionInfo(args) {
  return getCore(connectionInfoLoader, args);
}

/** @returns {import('@dbgate/types').StoredConnection} */
export function useConnectionInfo(args) {
  return useCore(connectionInfoLoader, args);
}

export function getSqlObjectList(args) {
  return getCore(sqlObjectListLoader, args);
}
export function useSqlObjectList(args) {
  return useCore(sqlObjectListLoader, args);
}

export function getDatabaseList(args) {
  return getCore(databaseListLoader, args);
}
export function useDatabaseList(args) {
  return useCore(databaseListLoader, args);
}

export function getConnectionList() {
  return getCore(connectionListLoader, {});
}
export function useConnectionList() {
  return useCore(connectionListLoader, {});
}
