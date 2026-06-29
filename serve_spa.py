import http.server
import os
import sys

def get_serve_dir():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(script_dir, "dist")
    if os.path.isdir(dist_dir):
        return dist_dir
    if os.path.exists(os.path.join(os.getcwd(), "index.html")):
        return os.getcwd()
    return script_dir

SERVE_DIR = get_serve_dir()

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SERVE_DIR, **kwargs)

    def do_GET(self):
        path = self.translate_path(self.path)
        if os.path.exists(path) and not os.path.isdir(path):
            return super().do_GET()
        if self.path.startswith("/assets/") or self.path.startswith("/FONTS/"):
            return super().do_GET()
        self.path = "/index.html"
        return super().do_GET()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 1990
    server = http.server.HTTPServer(("0.0.0.0", port), SPAHandler)
    print(f"Serving SPA on http://0.0.0.0:{port}")
    print(f"Serving directory: {SERVE_DIR}")
    server.serve_forever()
