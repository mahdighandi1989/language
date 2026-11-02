// Purpose: thin client for /api/inspection. Every call carries the Firebase ID
// token of the signed-in user; the server decides who is owner/user (the UI only
// hides buttons — the real guard is backend/routes/inspection.js).
//
// Upstream: firebase auth (getIdToken). Downstream: InspectionLayer, InspectionBoard.

export class InspectionApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function createInspectionApi(getToken, fetchImpl = (...a) => fetch(...a)) {
  async function request(method, url, body) {
    const token = await getToken();
    if (!token) throw new InspectionApiError(401, 'ابتدا وارد شوید');
    const headers = { Authorization: `Bearer ${token}` };
    let payload;
    if (body instanceof FormData) payload = body;
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetchImpl(url, { method, headers, body: payload });
    let data = null;
    try { data = await res.json(); } catch { data = null; }
    if (!res.ok) throw new InspectionApiError(res.status, data?.error || `خطای ${res.status}`);
    return data;
  }
  return {
    me: () => request('GET', '/api/inspection/me'),
    list: (params = {}) => {
      const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
      return request('GET', `/api/inspection${q ? `?${q}` : ''}`);
    },
    get: (id) => request('GET', `/api/inspection/${id}`),
    create: (sheet) => request('POST', '/api/inspection', sheet),
    note: (id, body) => request('POST', `/api/inspection/${id}/notes`, body),
    approve: (id) => request('POST', `/api/inspection/${id}/approve`),
    reopen: (id) => request('POST', `/api/inspection/${id}/reopen`),
    triage: (id, decision, note = '') => request('POST', `/api/inspection/${id}/triage`, { decision, note }),
    urgent: (id, on) => request(on ? 'POST' : 'DELETE', `/api/inspection/${id}/urgent`),
    upload: (id, files, captions = [], noteId = '') => {
      const form = new FormData();
      files.forEach((f, i) => {
        form.append('files', f, f.name);
        form.append('captions', captions[i] || '');
      });
      if (noteId) form.append('noteId', noteId);
      return request('POST', `/api/inspection/${id}/files`, form);
    },
    fileText: (fileId, offset = 0) => request('GET', `/api/inspection/files/${fileId}/text?offset=${offset}`),
    blobUrl: async (path) => {
      const token = await getToken();
      const res = await fetchImpl(path, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new InspectionApiError(res.status, 'دریافت نشد');
      return URL.createObjectURL(await res.blob());
    },
  };
}
