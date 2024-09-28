type backendFetchProps = {
  method: string;
  endpoint: string;
  queryData?: Record<string, string>;
  bodyData?: Record<string, string | string[]>;
};

export async function backendFetch(params: backendFetchProps) {
  const { method, endpoint, queryData, bodyData } = params;

  const address = process.env['ADCON_BACKEND_ADDR'];
  const port = process.env['ADCON_BACKEND_PORT'];
  const headers = new Headers();

  /* 中身のないデータを抹消する */
  if (queryData !== undefined) {
    for (const [key, value] of Object.entries(queryData)) {
      if (value === 'null' || value === '') {
        delete queryData[key];
      }
    }
  }
  if (bodyData !== undefined) {
    for (const [key, value] of Object.entries(bodyData)) {
      if (value === 'null' || value === '') {
        delete bodyData[key];
      }
    }
  }

  const urlSearchParam = new URLSearchParams(queryData).toString();
  const body = JSON.stringify(bodyData);

  switch (method) {
    case 'GET':
      headers.append('accept', '*/*');
      break;
    default:
      headers.append('accept', '*/*');
      headers.append('Content-type', 'application/json');
      break;
  }

  const result = await fetch(
    `http://${address}:${port}/adcon${endpoint}${method === 'GET' ? '?' + urlSearchParam : ''}`,
    method === 'GET' || body === undefined
      ? {
          method: method,
          headers: headers,
        }
      : {
          method: method,
          headers: headers,
          body: body,
        },
  );

  return result;
}
