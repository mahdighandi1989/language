// Purpose: Drive copies of a lesson's stored files (link or error) for the file
// list on the lesson page. The copy is made on the server AFTER the upload
// reply, so the list is read again a few seconds later. Read-only.
// Upstream: GET /api/lesson-files/:lessonId (file.drive / file.driveError).
import { useEffect, useState } from 'react';

export function driveInfoMap(files = []) {
  const out = {};
  for (const f of files) if (f?.id && (f.drive?.link || f.driveError)) out[f.id] = { link: f.drive?.link || '', error: f.driveError || '' };
  return out;
}

export default function useDriveLinks(lessonId, storedCount, fetchImpl = (...a) => fetch(...a)) {
  const [info, setInfo] = useState({});
  useEffect(() => {
    if (!storedCount) return undefined;
    let live = true;
    const load = async () => {
      try {
        const res = await fetchImpl(`/api/lesson-files/${lessonId}`);
        if (!res.ok) return;
        const body = await res.json();
        if (live) setInfo(driveInfoMap(body.files));
      } catch { /* offline: no links */ }
    };
    load();
    const t = setTimeout(load, 8000); // the Drive copy runs after the upload reply
    return () => { live = false; clearTimeout(t); };
  }, [lessonId, storedCount]);
  return info;
}
