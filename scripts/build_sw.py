#!/usr/bin/env python3
"""sw.js 를 만들어요 (오프라인용 파일 목록 + 버전). 파일을 바꾸면 다시 실행하세요."""
import os, hashlib
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = []
for d, _, fs in os.walk(root):
    if any(x in d for x in ('.git', 'scripts', 'node_modules', '.github')): continue
    for f in fs:
        p = os.path.relpath(os.path.join(d, f), root)
        if f in ('sw.js', 'README.md') or f.startswith('.'): continue
        files.append(p.replace(os.sep, '/'))
files.sort()
h = hashlib.md5()
for f in files: h.update(open(os.path.join(root, f), 'rb').read())
ver = h.hexdigest()[:8]
src = """/* 자동 생성 — scripts/build_sw.py */
var V = 'hm-%s', FILES = %s;
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || fetch(e.request); })); });
""" % (ver, '[' + ','.join("'%s'" % f for f in ['./'] + files) + ']')
open(os.path.join(root, 'sw.js'), 'w').write(src)
print('sw.js', ver, len(files), 'files')
