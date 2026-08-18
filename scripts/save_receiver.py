"""Receiver de sincronização do editor -> projeto.

POST /export   body (text/plain) = JSON { layout: {...}, edits: { key: dataURL } }
   - grava o layout em public/mascot-pack/_synced_layout.json
   - grava cada recorte em parts/{key}_edit.png  (ex.: body_edit.png, mouth_edit.png)
POST /save?name=arquivo.png   body = dataURL  (grava um PNG avulso)

CORS aberto + text/plain => sem preflight. Use só em desenvolvimento."""
import base64, json, os, urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT = r"C:\Users\henry\OneDrive\Desktop\Tentativas portifólio\Cantinho do AUAU\public\mascot-pack"
PARTS = os.path.join(ROOT, "parts")

def _png(name, data_url):
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    with open(os.path.join(PARTS, os.path.basename(name)), "wb") as f:
        f.write(base64.b64decode(data_url))

class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")

    def do_OPTIONS(self):
        self.send_response(204); self._cors()
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*"); self.end_headers()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path)
        body = self.rfile.read(int(self.headers.get("Content-Length", 0))).decode("utf-8", "ignore")
        try:
            if path.path == "/export":
                payload = json.loads(body)
                layout = payload.get("layout", {})
                edits = payload.get("edits", {})
                with open(os.path.join(ROOT, "_synced_layout.json"), "w", encoding="utf-8") as f:
                    json.dump(layout, f, indent=2, ensure_ascii=False)
                written = []
                for key, url in edits.items():
                    fn = f"{key}_edit.png"
                    _png(fn, url); written.append(fn)
                print("EXPORT ok ->", "_synced_layout.json", written)
            else:  # /save?name=
                name = urllib.parse.parse_qs(path.query).get("name", ["out.png"])[0]
                _png(name, body); print("SAVE ok ->", name)
            self.send_response(200)
        except Exception as e:
            print("ERRO:", e); self.send_response(500)
        self._cors(); self.end_headers(); self.wfile.write(b"ok")

    def log_message(self, *a):
        pass

print("receiver on 127.0.0.1:8123 ->", PARTS)
HTTPServer(("127.0.0.1", 8123), H).serve_forever()
