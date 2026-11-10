# Local preview server for the prototype (127.0.0.1 only).
import functools, http.server, os, sys
root = os.path.dirname(os.path.abspath(__file__))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
print('serving', root, flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
