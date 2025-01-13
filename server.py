import http.server
import socketserver

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

PORT = 8000

Handler = CORSHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"サーバーを起動しました。http://localhost:{PORT} にアクセスしてください。")
    httpd.serve_forever()
