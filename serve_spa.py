import http.server
import os
import sys

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(os.path.dirname(__file__), "dist"), **kwargs)

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
    server.serve_forever()
