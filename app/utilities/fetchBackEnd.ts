type fetchBackEndProps = {
  method: string;
  endpoint: string;
  queryString?: string;
  body?: string;
};

export async function fetchBackEnd(params: fetchBackEndProps) {
  const address = process.env['ADCON_BACKEND_ADDR'];
  const port = process.env['ADCON_BACKEND_PORT'];
  const headers = new Headers();

  switch (params.method) {
    case 'GET':
      headers.append('accept', '*/*');
      break;
    default:
      headers.append('accept', '*/*');
      headers.append('Content-type', 'application/json');
      break;
  }

  const result = await fetch(
    `http://${address}:${port}/adcon${params.endpoint}${params.queryString === undefined ? '' : '?' + params.queryString}`,
    params.body === undefined
      ? {
          method: params.method,
          headers: headers,
        }
      : {
          method: params.method,
          headers: headers,
          body: params.body,
        },
  );

  return result;
}
